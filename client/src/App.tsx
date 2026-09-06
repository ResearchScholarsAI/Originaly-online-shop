import { Toaster } from '@/components/ui/sonner';
import { Route, Switch } from 'wouter';
import { ThemeProvider } from './contexts/ThemeContext';
import StoreShell from './components/StoreShell';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductPage from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import NotFound from './pages/NotFound';

function Router() {
  return <StoreShell><Switch><Route path="/" component={Home}/><Route path="/shop" component={Shop}/><Route path="/product/:slug" component={ProductPage}/><Route path="/cart" component={Cart}/><Route path="/checkout" component={Checkout}/><Route path="/wishlist" component={Wishlist}/><Route path="/404" component={NotFound}/><Route component={NotFound}/></Switch></StoreShell>;
}

export default function App() { return <ThemeProvider defaultTheme="dark"><Toaster position="top-center" richColors/><Router/></ThemeProvider>; }
