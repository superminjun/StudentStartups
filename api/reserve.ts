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
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const { productId, qty } = req.body ?? {};
    const pId = String(productId || '');
    const pQty = Number(qty || 0);

    if (!pId || !Number.isFinite(pQty) || pQty <= 0) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const { data, error } = await supabase.rpc('reserve_product_inventory', {
      p_product_id: pId,
      p_qty: pQty,
    });

    if (error || data !== true) {
      return res.status(400).json({ error: error?.message || 'Out of stock' });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? 'Server error' });
  }
}
