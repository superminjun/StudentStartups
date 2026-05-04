import {
  findAuthUserByEmail,
  getAdminRequester,
  getRequestBody,
  isValidEmail,
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
    const email = readTrimmedText(body.email, 160).toLowerCase();

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const authUser = await findAuthUserByEmail(email);
    const { data: memberRow, error: memberError } = await supabase
      .from('members')
      .select('id,user_id')
      .eq('email', email)
      .maybeSingle();

    if (memberError) {
      return res.status(400).json({ error: memberError.message });
    }

    const authUserId = authUser?.id ?? memberRow?.user_id ?? null;
    if (!authUserId) {
      return res.status(404).json({ error: 'No auth account or member profile was found for this email.' });
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(authUserId);
    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    return res.status(200).json({ ok: true, deletedEmail: email });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return res.status(500).json({ error: message });
  }
}
