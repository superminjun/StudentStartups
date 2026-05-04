import {
  createPrivilegedSupabase,
  findAuthUserByEmail,
  getRequestBody,
  isValidEmail,
  readTrimmedText,
  serverConfig,
  type ApiRequest,
  type ApiResponse,
} from './_lib/server.js';

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
    const email = readTrimmedText(body.email, 160).toLowerCase();

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const authUser = await findAuthUserByEmail(email);
    const { data: memberRow, error: memberError } = await supabase
      .from('members')
      .select('id,user_id,is_verified')
      .eq('email', email)
      .maybeSingle();

    if (memberError) {
      return res.status(400).json({ error: memberError.message });
    }

    const exists = Boolean(authUser || memberRow);
    const confirmed = Boolean(authUser?.email_confirmed_at);

    return res.status(200).json({
      ok: true,
      exists,
      confirmed,
      hasMemberProfile: Boolean(memberRow),
      canSignup: !exists,
      needsVerification: exists && !confirmed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return res.status(500).json({ error: message });
  }
}
