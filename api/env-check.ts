export default async function handler(
  _req: unknown,
  res: { status: (code: number) => { json: (body: unknown) => void } }
) {
  return res.status(200).json({
    ok: true,
    supabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    anonKey: Boolean(process.env.VITE_SUPABASE_ANON_KEY),
  });
}
