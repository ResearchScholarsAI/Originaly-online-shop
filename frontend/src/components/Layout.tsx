import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Phone, MapPin, Instagram, Send, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { BRAND, loadCart, onCartChange, cartCount } from '@/lib/store';
import CategoryMegaMenu from '@/components/CategoryMegaMenu';
import type { Department } from '@/lib/categories';

export const LOGO_URL =
  'https://mgx-backend-cdn.metadl.com/generate/images/1573859/2026-09-01/vukmjmycakpa/logo-originaly-wordmark.png';

const NAV = [
  { to: '/', label: 'خانه' },
  { to: '/shop', label: 'همه محصولات' },
  { to: '/admin', label: 'پنل مدیریت' },
];
const DEPARTMENTS: { id: Department; label: string }[] = [
  { id: 'clothing', label: 'پوشاک' },
  { id: 'footwear', label: 'کفش' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState(loadCart());
  const [open, setOpen] = useState(false);
  const [openDept, setOpenDept] = useState<Department | null>(null);
  const closeTimer = useRef<number | null>(null);
  const location = useLocation();

  useEffect(() => onCartChange(() => setCart(loadCart())), []);
  useEffect(() => {
    setOpen(false);
    setOpenDept(null);
    window.scrollTo({ top: 0 });
  }, [location.pathname, location.search]);

  const count = cartCount(cart);

  function scheduleClose() {
    closeTimer.current = window.setTimeout(() => setOpenDept(null), 150);
  }
  function cancelClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="glass-strong sticky top-0 z-50">
        <div className="hidden md:flex items-center justify-center gap-8 py-1.5 text-[11px] text-muted-foreground border-b border-border/50">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> تضمین اصالت کالا</span>
          <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-primary" /> ارسال سریع به سراسر کشور</span>
          <span className="flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5 text-primary" /> ۷ روز ضمانت بازگشت</span>
        </div>

        <header className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={LOGO_URL} alt={BRAND.name} className="h-10 md:h-12 w-auto rounded-xl object-contain ring-gold" />
          </Link>

          <nav className="hidden md:flex items-center gap-1 relative">
            <Link to="/" className={`px-4 py-2 rounded-full text-sm transition-colors ${location.pathname === '/' ? 'active-chip' : 'text-foreground/80 hover:text-primary hover:bg-primary/10'}`}>
              خانه
            </Link>

            {DEPARTMENTS.map((d) => (
              <div key={d.id} className="relative" onMouseEnter={() => { cancelClose(); setOpenDept(d.id); }} onMouseLeave={scheduleClose}>
                <button
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${openDept === d.id ? 'active-chip' : 'text-foreground/80 hover:text-primary hover:bg-primary/10'}`}
                >
                  {d.label}
                </button>
                <AnimatePresence>
                  {openDept === d.id && (
                    <div className="absolute top-full pt-3 start-0 z-50" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                      <CategoryMegaMenu department={d.id} />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <Link to="/shop" className={`px-4 py-2 rounded-full text-sm transition-colors ${location.pathname === '/shop' && !location.search ? 'active-chip' : 'text-foreground/80 hover:text-primary hover:bg-primary/10'}`}>
              همه محصولات
            </Link>
            <Link to="/admin" className={`px-4 py-2 rounded-full text-sm transition-colors ${location.pathname === '/admin' ? 'active-chip' : 'text-foreground/80 hover:text-primary hover:bg-primary/10'}`}>
              پنل مدیریت
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative glass rounded-full p-2.5 hover:border-primary/50 transition-colors" aria-label="سبد خرید">
              <ShoppingCart className="w-5 h-5 text-primary" />
              {count > 0 && (
                <span className="absolute -top-1.5 -left-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-5 h-5 grid place-items-center px-1">
                  {count.toLocaleString('fa-IR')}
                </span>
              )}
            </Link>
            <button className="md:hidden glass rounded-full p-2.5" onClick={() => setOpen((v) => !v)} aria-label="منو">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {open && (
          <nav className="md:hidden border-t border-border/60 px-4 py-3 flex flex-col gap-1">
            <Link to="/" className="px-4 py-2.5 rounded-xl hover:bg-primary/10 text-sm">خانه</Link>
            {DEPARTMENTS.map((d) => (
              <div key={d.id} className="px-4 py-1">
                <p className="text-xs text-primary font-bold mb-1.5">{d.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {['men', 'women'].map((g) => (
                    <Link
                      key={g}
                      to={`/shop?department=${d.id}&gender=${g}`}
                      className="text-xs glass rounded-full px-3 py-1.5"
                    >
                      {g === 'men' ? 'مردانه' : 'زنانه'}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Link to="/shop" className="px-4 py-2.5 rounded-xl hover:bg-primary/10 text-sm">همه محصولات</Link>
            <Link to="/admin" className="px-4 py-2.5 rounded-xl hover:bg-primary/10 text-sm">پنل مدیریت</Link>
          </nav>
        )}
      </div>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t border-primary/15 bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-3">
          <div>
            <img src={LOGO_URL} alt={BRAND.name} className="h-12 rounded-xl object-contain mb-4" />
            <p className="text-sm text-muted-foreground leading-7">
              {BRAND.fa} | {BRAND.slogan}. فروشگاه تخصصی کفش و پوشاک اورجینال با ضمانت اصالت، مستقر در {BRAND.city}.
            </p>
            <p className="mt-3 text-xs gold-text font-bold tracking-widest">{BRAND.domain}</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-primary">دسترسی سریع</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {NAV.map((n) => (
                <li key={n.label}><Link to={n.to} className="hover:text-primary transition-colors">{n.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-primary">تماس با ما</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href={`tel:${BRAND.phone}`} dir="ltr" className="hover:text-primary">{BRAND.phoneDisplay}</a>
              </li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary shrink-0" /> {BRAND.city}</li>
              <li className="flex items-center gap-4 pt-1">
                <a href={`https://wa.me/${BRAND.phone.replace('+', '')}`} target="_blank" rel="noreferrer" className="glass rounded-full p-2 hover:border-primary/60">
                  <Send className="w-4 h-4 text-primary" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="glass rounded-full p-2 hover:border-primary/60">
                  <Instagram className="w-4 h-4 text-primary" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="gold-line" />
        <p className="text-center text-xs text-muted-foreground py-5">
          © ۱۴۰۵ {BRAND.fa} — تمامی حقوق محفوظ است.
        </p>
      </footer>
    </div>
  );
}