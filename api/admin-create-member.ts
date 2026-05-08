import {
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
    const name = readTrimmedText(body.name, 120);
    const email = readTrimmedText(body.email, 160).toLowerCase();
    const password = readTrimmedText(body.password, 120);
    const role = readTrimmedText(body.role, 80) || 'Member';
    const team = readTrimmedText(body.team, 80) || 'Unassigned';

    if (!name) return res.status(400).json({ error: 'Name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ error: 'A valid email is required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Temporary password must be at least 8 characters.' });

    const existingMember = await supabase
      .from('members')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingMember.error) {
      return res.status(400).json({ error: existingMember.error.message });
    }
    if (existingMember.data) {
      return res.status(409).json({ error: 'That email already belongs to an existing member.' });
    }

    const createResult = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
      },
    });

    if (createResult.error || !createResult.data.user) {
      return res.status(400).json({ error: createResult.error?.message ?? 'Could not create the auth account.' });
    }

    const authUser = createResult.data.user;
    const insertResult = await supabase.from('members').insert({
      user_id: authUser.id,
      name,
      email,
      role,
      team,
      is_verified: true,
      primary_provider: 'email',
      linked_providers: ['email'],
      join_date: new Date().toISOString().slice(0, 10),
    });

    if (insertResult.error) {
      await supabase.auth.admin.deleteUser(authUser.id);
      return res.status(400).json({ error: insertResult.error.message });
    }

    return res.status(200).json({
      ok: true,
      member: {
        id: authUser.id,
        email,
        name,
        role,
        team,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
}
