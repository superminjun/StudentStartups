import { cn } from '@/lib/utils';
import type { SocialProvider, SocialProviderConfig } from '@/lib/auth/oauthProviders';

type OAuthProviderButtonsProps = {
  providers: SocialProviderConfig[];
  loadingProvider: SocialProvider | null;
  disabled?: boolean;
  dividerLabel: string;
  onSelect: (provider: SocialProvider) => void;
  resolveLabel: (labelKey: string) => string;
};

export default function OAuthProviderButtons({
  providers,
  loadingProvider,
  disabled = false,
  dividerLabel,
  onSelect,
  resolveLabel,
}: OAuthProviderButtonsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {dividerLabel}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-2">
        {providers.map((provider) => {
          const isLoading = loadingProvider === provider.key;
          const label = resolveLabel(provider.labelKey);

          return (
            <button
              key={provider.key}
              type="button"
              onClick={() => onSelect(provider.key)}
              disabled={disabled}
              className={cn(
                'group flex w-full items-center gap-3 rounded-2xl border border-border px-4 py-3 text-left text-sm font-semibold shadow-sm transition-all duration-200',
                'hover:-translate-y-px hover:border-foreground/15 hover:shadow-md',
                'disabled:cursor-not-allowed disabled:opacity-65',
                provider.tone
              )}
            >
              <span className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                  <img
                    src={provider.logoSrc}
                    alt={provider.logoAlt}
                    className="size-[18px] object-contain"
                    loading="eager"
                    decoding="async"
                  />
                </span>
                <span className="flex flex-col">
                  <span>{label}</span>
                  {isLoading && (
                    <span
                      className={cn(
                        'text-xs font-medium',
                        provider.key === 'apple' ? 'text-white/70' : 'text-muted-foreground'
                      )}
                    >
                      {resolveLabel('login.redirecting')}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
