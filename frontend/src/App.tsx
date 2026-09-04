import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <Layout>
              <PageTransition>
                <Home />
              </PageTransition>
            </Layout>
          }
        />
        <Route
          path="/shop"
          element={
            <Layout>
              <PageTransition>
                <Shop />
              </PageTransition>
            </Layout>
          }
        />
        <Route
          path="/product/:slug"
          element={
            <Layout>
              <PageTransition>
                <ProductDetail />
              </PageTransition>
            </Layout>
          }
        />
        <Route
          path="/cart"
          element={
            <Layout>
              <PageTransition>
                <Cart />
              </PageTransition>
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <Layout>
              <PageTransition>
                <Admin />
              </PageTransition>
            </Layout>
          }
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/error" element={<AuthError />} />
        <Route
          path="*"
          element={
            <Layout>
              <PageTransition>
                <Home />
              </PageTransition>
            </Layout>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-center" richColors closeButton />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };