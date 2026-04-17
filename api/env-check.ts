import { serverConfig } from './_lib/server';

export function GET() {
  return Response.json({
    ok: true,
    supabaseUrl: serverConfig.supabaseUrl,
    serviceRoleKey: serverConfig.serviceRoleKey,
    anonKey: serverConfig.anonKey,
  });
}
