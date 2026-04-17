import {
  createPrivilegedSupabase,
  getRequestBody,
  getRequestIp,
  isValidEmail,
  readTrimmedText,
  serverConfig,
  type ApiRequest,
  type ApiResponse,
} from './_lib/server';

const submissionWindowMs = 30_000;
const recentSubmissions = new Map<string, number>();

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
    const honeypot = readTrimmedText(body.website, 200);
    const name = readTrimmedText(body.name, 120);
    const email = readTrimmedText(body.email, 160).toLowerCase();
    const subject = readTrimmedText(body.subject, 160);
    const message = readTrimmedText(body.message, 2000);

    if (honeypot) {
      return res.status(200).json({ ok: true });
    }

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Please fill in every field.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (message.length < 10) {
      return res.status(400).json({ error: 'Please add a little more detail to your message.' });
    }

    const now = Date.now();
    const rateLimitKey = `${getRequestIp(req)}:${email}`;
    const lastSubmissionAt = recentSubmissions.get(rateLimitKey);
    if (lastSubmissionAt && now - lastSubmissionAt < submissionWindowMs) {
      return res.status(429).json({ error: 'Please wait a few seconds before sending another message.' });
    }

    recentSubmissions.set(rateLimitKey, now);

    const { error } = await supabase.from('messages').insert({
      name,
      email,
      subject,
      message,
    });

    if (error) {
      recentSubmissions.delete(rateLimitKey);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return res.status(500).json({ error: message });
  }
}
