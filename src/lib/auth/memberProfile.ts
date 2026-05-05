import type { PostgrestError, SupabaseClient, User } from '@supabase/supabase-js';

export class MissingAuthEmailError extends Error {
  constructor() {
    super('Missing verified email from provider');
    this.name = 'MissingAuthEmailError';
  }
}

export type ProviderKey = 'email' | 'google' | 'microsoft' | 'apple';

type SyncMemberProfileParams = {
  supabase: SupabaseClient;
  user: User;
  displayName?: string;
  eagerProviderSync?: boolean;
};

const PROVIDER_NAME_MAP: Record<string, ProviderKey> = {
  apple: 'apple',
  azure: 'microsoft',
  email: 'email',
  google: 'google',
  microsoft: 'microsoft',
};

function normalizeProvider(provider: unknown): ProviderKey | null {
  if (typeof provider !== 'string') return null;
  return PROVIDER_NAME_MAP[provider] ?? null;
}

function getLinkedProviders(user: User): ProviderKey[] {
  const providers = new Set<ProviderKey>();

  const primaryProvider = normalizeProvider(user.app_metadata?.provider);
  if (primaryProvider) providers.add(primaryProvider);

  const appProviders = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers
    : [];
  appProviders
    .map((provider) => normalizeProvider(provider))
    .filter((provider): provider is ProviderKey => provider !== null)
    .forEach((provider) => providers.add(provider));

  (user.identities ?? [])
    .map((identity) => normalizeProvider(identity.provider))
    .filter((provider): provider is ProviderKey => provider !== null)
    .forEach((provider) => providers.add(provider));

  if (!providers.size) providers.add('email');

  return Array.from(providers);
}

function getPrimaryProvider(user: User, linkedProviders: ProviderKey[]): ProviderKey {
  return normalizeProvider(user.app_metadata?.provider) ?? linkedProviders[0] ?? 'email';
}

function getNormalizedName(user: User, displayName?: string) {
  const candidates = [
    displayName?.trim(),
    String(user.user_metadata?.full_name ?? '').trim(),
    String(user.user_metadata?.name ?? '').trim(),
    [user.user_metadata?.given_name, user.user_metadata?.family_name].filter(Boolean).join(' ').trim(),
  ];

  return candidates.find((value) => value && value.length > 0) ?? '';
}

function isMissingProviderColumnError(error: PostgrestError) {
  const details = `${error.message} ${error.details ?? ''} ${error.hint ?? ''}`.toLowerCase();
  return (
    error.code === 'PGRST204' ||
    details.includes('primary_provider') ||
    details.includes('linked_providers')
  );
}

export async function syncMemberProfile({
  supabase,
  user,
  displayName = '',
  eagerProviderSync = true,
}: SyncMemberProfileParams) {
  const normalizedEmail = String(user.email ?? '').trim().toLowerCase();
  if (!normalizedEmail) {
    throw new MissingAuthEmailError();
  }

  const normalizedName =
    getNormalizedName(user, displayName) || normalizedEmail.split('@')[0] || 'Member';

  const linkedProviders = getLinkedProviders(user);
  const primaryProvider = getPrimaryProvider(user, linkedProviders);

  const profileBase = {
    email: normalizedEmail,
    is_verified: Boolean(user.email_confirmed_at),
  };

  const { data: existingMember, error: memberLookupError } = await supabase
    .from('members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (memberLookupError) {
    throw memberLookupError;
  }

  if (!existingMember?.id) {
    const insertBase = {
      user_id: user.id,
      name: normalizedName,
      role: 'Member',
      team: 'Unassigned',
      contributions: 0,
      ...profileBase,
    };

    const insertWithProvider = {
      ...insertBase,
      primary_provider: primaryProvider,
      linked_providers: linkedProviders,
    };

    const { error: insertProviderError } = await supabase
      .from('members')
      .insert(insertWithProvider);

    if (!insertProviderError) return;
    if (!isMissingProviderColumnError(insertProviderError)) {
      throw insertProviderError;
    }

    const { error: insertFallbackError } = await supabase
      .from('members')
      .insert(insertBase);

    if (insertFallbackError) {
      throw insertFallbackError;
    }
    return;
  }

  if (!eagerProviderSync) {
    return;
  }

  const updateWithProvider = {
    ...profileBase,
    primary_provider: primaryProvider,
    linked_providers: linkedProviders,
  };

  const { error: updateProviderError } = await supabase
    .from('members')
    .update(updateWithProvider)
    .eq('user_id', user.id);

  if (!updateProviderError) return;
  if (!isMissingProviderColumnError(updateProviderError)) {
    throw updateProviderError;
  }

  const { error: fallbackError } = await supabase
    .from('members')
    .update(profileBase)
    .eq('user_id', user.id);

  if (fallbackError) {
    throw fallbackError;
  }
}
