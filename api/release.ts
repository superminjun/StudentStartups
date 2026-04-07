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
    const { productId, qty, sessionId } = req.body ?? {};
    const pId = String(productId || '');
    const pQty = Number(qty || 0);
    const sId = String(sessionId || '');

    if (!pId || !sId || !Number.isFinite(pQty) || pQty <= 0) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const { error } = await supabase.rpc('release_product_inventory', {
      p_product_id: pId,
      p_qty: pQty,
      p_session_id: sId,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? 'Server error' });
  }
}
