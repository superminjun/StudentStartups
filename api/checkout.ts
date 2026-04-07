import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Server not configured: missing SUPABASE_SERVICE_ROLE_KEY' });
  }

  try {
    const { buyerName, buyerEmail, deliveryNote, items } = req.body ?? {};

    if (!buyerName || !buyerEmail || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const normalizedItems = items.map((item: any) => ({
      id: String(item.id || ''),
      qty: Number(item.qty || 0),
    })).filter((item: any) => item.id && item.qty > 0);

    if (normalizedItems.length === 0) {
      return res.status(400).json({ error: 'Invalid items' });
    }

    const { data, error } = await supabase.rpc('create_order_with_items', {
      p_buyer_name: buyerName,
      p_buyer_email: buyerEmail,
      p_delivery_note: deliveryNote ?? null,
      p_items: normalizedItems,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ orderId: data });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? 'Server error' });
  }
}
