import type { Provider } from '@supabase/supabase-js';

export type SocialProvider = Extract<Provider, 'google' | 'azure' | 'apple'>;

export type SocialProviderConfig = {
  key: SocialProvider;
  labelKey: string;
  scopes: string;
  tone: string;
  logoSrc: string;
  logoAlt: string;
};

export const SOCIAL_PROVIDERS: SocialProviderConfig[] = [
  {
    key: 'google',
    labelKey: 'login.continueWithGoogle',
    scopes: 'email profile',
    tone: 'bg-white text-[#1f1a17]',
    logoSrc: '/brand/google.svg',
    logoAlt: 'Google',
  },
  {
    key: 'azure',
    labelKey: 'login.continueWithMicrosoft',
    scopes: 'email openid profile',
    tone: 'bg-white text-[#1f1a17]',
    logoSrc: '/brand/microsoft.svg',
    logoAlt: 'Microsoft',
  },
  {
    key: 'apple',
    labelKey: 'login.continueWithApple',
    scopes: 'name email',
    tone: 'bg-[#111111] text-white',
    logoSrc: '/brand/apple.svg',
    logoAlt: 'Apple',
  },
];
