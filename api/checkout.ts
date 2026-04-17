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

const supabase = createPrivilegedSupabase();

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabase) {
    return res.status(500).json({
      error: 'Server not configured',
      missing: {
        supabaseUrl: !serverConfig.supabaseUrl,
        serviceRoleKey: !serverConfig.serviceRoleKey,
      },
    });
  }

  try {
    const body = getRequestBody(req.body);
    const buyerName = readTrimmedText(body.buyerName, 120);
    const buyerEmail = readTrimmedText(body.buyerEmail, 160).toLowerCase();
    const deliveryNote = readTrimmedText(body.deliveryNote, 500);
    const sessionId = readTrimmedText(body.sessionId, 128);
    const rawItems = Array.isArray(body.items) ? body.items : [];

    if (!buyerName || !buyerEmail || rawItems.length === 0 || !sessionId) {
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

    const { data, error } = await supabase.rpc('create_order_with_items', {
      p_buyer_name: buyerName,
      p_buyer_email: buyerEmail,
      p_delivery_note: deliveryNote || null,
      p_items: normalizedItems,
      p_session_id: sessionId,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ orderId: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return res.status(500).json({ error: message });
  }
}
