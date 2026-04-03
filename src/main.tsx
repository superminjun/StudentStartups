import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/hooks/useLanguage';
import { AuthProvider } from '@/components/auth/AuthProvider';
import App from './App';
import './index.css';

const BUILD_ID = '2026-04-03-02';

const clearStaleCaches = () => {
  if (typeof window === 'undefined') return;
  try {
    const prev = window.localStorage.getItem('bnss-build-id');
    if (prev === BUILD_ID) return;
    Object.keys(window.localStorage).forEach((key) => {
      if (key.startsWith('bnss-')) {
        window.localStorage.removeItem(key);
      }
    });
    window.localStorage.setItem('bnss-build-id', BUILD_ID);
  } catch {
    // ignore storage errors
  }
};

clearStaleCaches();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
