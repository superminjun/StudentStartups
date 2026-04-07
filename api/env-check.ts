export default async function handler(_req: any, res: any) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  return res.status(200).json({
    ok: true,
    supabaseUrl: Boolean(supabaseUrl),
    serviceRoleKey: Boolean(serviceRoleKey),
    anonKey: Boolean(anonKey),
  });
}
