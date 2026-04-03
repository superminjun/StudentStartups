import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/hooks/useLanguage';
import { AuthProvider } from '@/components/auth/AuthProvider';
import App from './App';
import './index.css';

const clearStaleCaches = () => {
  if (typeof window === 'undefined') return;
  try {
    Object.keys(window.localStorage).forEach((key) => {
      if (key.startsWith('bnss-')) {
        window.localStorage.removeItem(key);
      }
    });
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
