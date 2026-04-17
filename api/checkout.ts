import {
  createPrivilegedSupabase,
  getRequestBody,
  readPositiveInteger,
  readTrimmedText,
  isValidEmail,
  serverConfig,
  type ApiRequest,
  type ApiResponse,
} from './_lib/server';

type FallbackProductRow = {
  id: string;
  name: string;
  price: number;
  inventory: number;
  status: string | null;
};

const createFallbackOrder = async (
  supabase: Awaited<ReturnType<typeof createPrivilegedSupabase>>,
  buyerName: string,
  buyerEmail: string,
  deliveryNote: string,
  items: { id: string; qty: number }[]
) => {
  if (!supabase) {
    throw new Error('Server not configured');
  }

  const productIds = items.map((item) => item.id);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id,name,price,inventory,status')
    .in('id', productIds);

  if (productsError) {
    throw new Error(productsError.message);
  }

  const productMap = new Map(
    ((products as FallbackProductRow[] | null) ?? []).map((product) => [product.id, product])
  );

  const inventoryRollbacks: Array<{
    id: string;
    previousInventory: number;
    previousStatus: string | null;
    qty: number;
  }> = [];

  const rollbackInventory = async () => {
    await Promise.all(
      inventoryRollbacks.map((entry) =>
        supabase
          .from('products')
          .update({
            inventory: entry.previousInventory,
            status: entry.previousStatus,
          })
          .eq('id', entry.id)
          .eq('inventory', Math.max(entry.previousInventory - entry.qty, 0))
      )
    );
  };

  const orderItems = items.map((item) => {
    const product = productMap.get(item.id);
    if (!product) {
      throw new Error('Product not found');
    }

    const currentInventory = Number(product.inventory) || 0;
    if (currentInventory < item.qty) {
      throw new Error(`${product.name} is out of stock.`);
    }

    return {
      id: product.id,
      name: product.name,
      qty: item.qty,
      price: Number(product.price) || 0,
    };
  });

  const total = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  try {
    for (const item of orderItems) {
      const product = productMap.get(item.id);
      if (!product) {
        throw new Error('Product not found');
      }

      const previousInventory = Number(product.inventory) || 0;
      const nextInventory = previousInventory - item.qty;
      const previousStatus = product.status ?? 'available';
      const nextStatus = nextInventory <= 0
        ? 'sold-out'
        : previousStatus === 'sold-out'
          ? 'available'
          : previousStatus;

      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update({
          inventory: nextInventory,
          status: nextStatus,
        })
        .eq('id', item.id)
        .eq('inventory', previousInventory)
        .select('id')
        .maybeSingle();

      if (updateError || !updatedProduct) {
        throw new Error(`Could not update stock for ${product.name}. Please try again.`);
      }

      inventoryRollbacks.push({
        id: item.id,
        previousInventory,
        previousStatus,
        qty: item.qty,
      });
    }

    const { data: insertedOrder, error: insertError } = await supabase
      .from('orders')
      .insert({
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        total,
        delivery_note: deliveryNote || null,
        items: orderItems,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError || !insertedOrder?.id) {
      throw new Error(insertError?.message || 'Could not create order');
    }

    return insertedOrder.id as string;
  } catch (error) {
    await rollbackInventory();
    throw error;
  }
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createPrivilegedSupabase();

    if (!supabase) {
      return res.status(500).json({
        error: 'Server not configured',
        missing: {
          supabaseUrl: !serverConfig.supabaseUrl,
          serviceRoleKey: !serverConfig.serviceRoleKey,
        },
      });
    }

    const body = getRequestBody(req.body);
    const buyerName = readTrimmedText(body.buyerName, 120);
    const buyerEmail = readTrimmedText(body.buyerEmail, 160).toLowerCase();
    const deliveryNote = readTrimmedText(body.deliveryNote, 500);
    const sessionId = readTrimmedText(body.sessionId, 128);
    const rawItems = Array.isArray(body.items) ? body.items : [];

    if (!buyerName || !buyerEmail || rawItems.length === 0) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    if (!isValidEmail(buyerEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const itemQuantities = new Map<string, number>();
    rawItems.forEach((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return;
      const record = item as Record<string, unknown>;
      const id = readTrimmedText(record.id, 128);
      const qty = readPositiveInteger(record.qty);
      if (!id || qty <= 0 || qty > 25) return;
      itemQuantities.set(id, (itemQuantities.get(id) ?? 0) + qty);
    });

    const normalizedItems = Array.from(itemQuantities.entries())
      .map(([id, qty]) => ({ id, qty }))
      .filter((item) => item.qty > 0 && item.qty <= 50);

    const totalQuantity = normalizedItems.reduce((sum, item) => sum + item.qty, 0);

    if (normalizedItems.length === 0 || normalizedItems.length > 25 || totalQuantity > 100) {
      return res.status(400).json({ error: 'Invalid items' });
    }

    if (!sessionId) {
      const orderId = await createFallbackOrder(supabase, buyerName, buyerEmail, deliveryNote, normalizedItems);
      return res.status(200).json({ orderId });
    }

    const { data, error } = await supabase.rpc('create_order_with_items', {
      p_buyer_name: buyerName,
      p_buyer_email: buyerEmail,
      p_delivery_note: deliveryNote || null,
      p_items: normalizedItems,
      p_session_id: sessionId,
    });

    if (error) {
      if (error.message.toLowerCase().includes('reservation missing')) {
        const orderId = await createFallbackOrder(supabase, buyerName, buyerEmail, deliveryNote, normalizedItems);
        return res.status(200).json({ orderId });
      }
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ orderId: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return res.status(500).json({ error: message });
  }
}
