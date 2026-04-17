import {
  createPrivilegedSupabase,
  getRequestBody,
  readPositiveInteger,
  readTrimmedText,
  serverConfig,
  type ApiRequest,
  type ApiResponse,
} from './_lib/server';

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
    const pId = readTrimmedText(body.productId, 128);
    const pQty = readPositiveInteger(body.qty);
    const sId = readTrimmedText(body.sessionId, 128);

    if (!pId || !sId || pQty <= 0 || pQty > 10) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const { data, error } = await supabase.rpc('reserve_product_inventory', {
      p_product_id: pId,
      p_qty: pQty,
      p_session_id: sId,
    });

    if (error || data !== true) {
      return res.status(400).json({ error: error?.message || 'Out of stock' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return res.status(500).json({ error: message });
  }
}
