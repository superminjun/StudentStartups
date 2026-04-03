import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

export default function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const location = useLocation();
  const { user, loading, isAdmin, isConfigured } = useAuth();

  if (!isConfigured) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-beige px-6 py-16 text-center">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-charcoal">Supabase not configured</p>
          <p className="mt-2 text-sm text-mid">
            Set <span className="font-mono">VITE_SUPABASE_URL</span> and <span className="font-mono">VITE_SUPABASE_ANON_KEY</span> to enable login.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-beige">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-border border-t-[hsl(24,80%,50%)]" />
          <p className="mt-4 text-sm text-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-beige px-6 py-16 text-center">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-charcoal">Access denied</p>
          <p className="mt-2 text-sm text-mid">Your account is not an admin user.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
