import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import RequireAuth from '@/components/auth/RequireAuth';
import { useSiteContentSync } from '@/stores/siteContentStore';
import { useCMSDataSync } from '@/stores/cmsStore';

const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Projects = lazy(() => import('@/pages/Projects'));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'));
const Impact = lazy(() => import('@/pages/Impact'));
const Shop = lazy(() => import('@/pages/Shop'));
const ProductDetail = lazy(() => import('@/pages/ProductDetailPage'));
const Cart = lazy(() => import('@/pages/Cart'));
const Contact = lazy(() => import('@/pages/Contact'));
const MemberPortal = lazy(() => import('@/pages/MemberPortal'));
const Login = lazy(() => import('@/pages/Login'));
const Admin = lazy(() => import('@/pages/Admin'));

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-beige">
      <div className="text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-[hsl(30,12%,87%)] border-t-[hsl(24,80%,50%)]" />
        <p className="mt-4 text-sm text-light">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  useSiteContentSync();
  useCMSDataSync();

  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/portal"
              element={(
                <RequireAuth>
                  <MemberPortal />
                </RequireAuth>
              )}
            />
            <Route
              path="/admin"
              element={(
                <RequireAuth adminOnly>
                  <Admin />
                </RequireAuth>
              )}
            />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}
