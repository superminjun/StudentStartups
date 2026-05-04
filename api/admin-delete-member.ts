import {
  getAdminRequester,
  getRequestBody,
  readTrimmedText,
  type ApiRequest,
  type ApiResponse,
} from './_lib/server.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { supabase, isAdmin } = await getAdminRequester(req);

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const body = getRequestBody(req.body);
    const memberId = readTrimmedText(body.memberId, 80);

    if (!memberId) {
      return res.status(400).json({ error: 'Member id is required.' });
    }

    const { data: memberRow, error: memberError } = await supabase
      .from('members')
      .select('id,user_id,email')
      .eq('id', memberId)
      .maybeSingle();

    if (memberError) {
      return res.status(400).json({ error: memberError.message });
    }

    if (!memberRow?.user_id) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(memberRow.user_id);
    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    return res.status(200).json({ ok: true, deletedEmail: memberRow.email ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return res.status(500).json({ error: message });
  }
}
