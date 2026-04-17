import { serverConfig, type ApiRequest, type ApiResponse } from './_lib/server';

export default async function handler(_req: ApiRequest, res: ApiResponse) {
  return res.status(200).json({
    ok: true,
    supabaseUrl: serverConfig.supabaseUrl,
    serviceRoleKey: serverConfig.serviceRoleKey,
    anonKey: serverConfig.anonKey,
  });
}
