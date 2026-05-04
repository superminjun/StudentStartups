import { createClient } from '@supabase/supabase-js';

export type ApiRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  socket?: {
    remoteAddress?: string | undefined;
  };
};

export type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export const serverConfig = {
  supabaseUrl: Boolean(supabaseUrl),
  serviceRoleKey: Boolean(supabaseServiceKey),
  anonKey: Boolean(supabaseAnonKey),
};

export const createPrivilegedSupabase = () => {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
};

export const getRequestBody = (body: unknown): Record<string, unknown> => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  return body as Record<string, unknown>;
};

export const readTrimmedText = (value: unknown, maxLength: number) => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
};

export const readPositiveInteger = (value: unknown) => {
  const numeric = Math.floor(Number(value));
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return numeric;
};

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const getRequestIp = (req: ApiRequest) => {
  const forwarded = req.headers?.['x-forwarded-for'];
  const firstForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  return firstForwarded?.trim() || req.socket?.remoteAddress || 'unknown';
};

export const readBearerToken = (req: ApiRequest) => {
  const header = req.headers?.authorization ?? req.headers?.Authorization;
  const raw = Array.isArray(header) ? header[0] : header;
  if (!raw?.startsWith('Bearer ')) return '';
  return raw.slice('Bearer '.length).trim();
};

export const findAuthUserByEmail = async (email: string) => {
  const supabase = createPrivilegedSupabase();
  if (!supabase) return null;

  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    const users = data.users ?? [];
    const match = users.find((user) => (user.email ?? '').trim().toLowerCase() === normalizedEmail);
    if (match) {
      return match;
    }

    if (users.length < perPage) break;
    page += 1;
  }

  return null;
};

export const getAdminRequester = async (req: ApiRequest) => {
  const supabase = createPrivilegedSupabase();
  if (!supabase) {
    throw new Error('Server not configured');
  }

  const token = readBearerToken(req);
  if (!token) {
    return { supabase, user: null, isAdmin: false };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) {
    return { supabase, user: null, isAdmin: false };
  }

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (adminError || !adminRow) {
    return { supabase, user: authData.user, isAdmin: false };
  }

  return { supabase, user: authData.user, isAdmin: true };
};
