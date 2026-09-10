import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { TAXONOMY } from "@/lib/catalog";
import { cartCount, useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand-mark";
import { motion, useReducedMotion } from "motion/react";

const TICKER = [
  "اصالت‌سنجی قبل از ارسال",
  "ارسال رایگان بالای ۸ میلیون",
  "۷ روز فرصت بازگشت",
  "Originaly / authentic state",
];

export function Header() {
  const items = useCart((s) => s.items);
  const flyKey = useCart((s) => s.flyKey);
  const count = cartCount(items);
  const wish = useWishlist((s) => s.ids.length);
  const reduce = useReducedMotion();
  const { user, isPending } = useCurrentUserState();
  const [openDept, setOpenDept] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const nav = useNavigate();

  return (
    <div className="sticky top-0 z-40">
      <div className="relative h-9 overflow-hidden border-b border-border bg-elevated/80 text-[11px] text-muted">
        <div className="marquee absolute inset-y-0 flex w-max items-center gap-16 whitespace-nowrap px-8">
          {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>
      <header className="border-b border-border glass">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4">
          <button className="rounded-full p-2 md:hidden" aria-label="منو" onClick={() => setMobile(true)}>
            <Menu className="size-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <BrandMark className="size-10" alt="" />
            <span className="font-display text-xl font-extrabold tracking-tight">ORIGINALY</span>
            <span className="mb-0.5 hidden text-[9px] tracking-[0.22em] text-primary sm:block">AUTHENTIC STATE</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" onMouseLeave={() => setOpenDept(null)}>
            {TAXONOMY.map((d) => (
              <div key={d.id} className="relative">
                <Link
                  to="/shop"
                  search={{ dept: d.id }}
                  onMouseEnter={() => setOpenDept(d.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-transform duration-150",
                    openDept === d.id ? "active-chip" : "hover:bg-subtle",
                  )}
                >
                  {d.nameFa}
                </Link>
              </div>
            ))}
            <Link to="/shop" className="link-line mx-2 text-sm text-muted hover:text-fg">
              همه محصولات
            </Link>
            <Link to="/lookbook" className="link-line mx-2 text-sm text-muted hover:text-fg">
              لوک‌بوک
            </Link>
          </nav>
          <div className="flex items-center gap-1">
            <button
              className="grid size-10 place-items-center rounded-full border border-primary/50 bg-primary text-primary-fg shadow-[0_0_18px_rgba(196,255,44,.28)] transition hover:scale-105"
              aria-label="جستجوی محصولات"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search className="size-5" />
            </button>
            {isPending ? (
              <div className="size-8 animate-pulse rounded-full bg-subtle" />
            ) : user ? (
              <SignedIn>
                <Link to="/account" className="hidden rounded-full p-2 hover:bg-subtle sm:block" aria-label="حساب">
                  <User className="size-5" />
                </Link>
                <UserButton />
              </SignedIn>
            ) : (
              <SignedOut>
                <Link to="/login" className="rounded-full px-3 py-2 text-sm hover:bg-subtle">
                  ورود
                </Link>
              </SignedOut>
            )}
            <Link to="/wishlist" className="relative hidden rounded-full p-2 hover:bg-subtle sm:block" aria-label="علاقه‌مندی">
              <Heart className="size-5" />
              {wish > 0 ? (
                <span className="absolute -top-0.5 -left-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-fg">
                  {wish}
                </span>
              ) : null}
            </Link>
            <Link to="/cart" className="relative rounded-full p-2 hover:bg-subtle" aria-label="سبد">
              <ShoppingBag className="size-5" />
              {count > 0 ? (
                <motion.span
                  key={flyKey}
                  initial={reduce ? false : { scale: 0.6 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -left-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-fg"
                >
                  {count}
                </motion.span>
              ) : null}
            </Link>
          </div>
        </div>
        {searchOpen ? (
          <form
            className="mx-auto max-w-6xl px-4 pb-4"
            onSubmit={(e) => {
              e.preventDefault();
              void nav({ to: "/shop", search: { q: q.trim() || undefined } });
              setSearchOpen(false);
            }}
          >
            <div className="glass flex items-center gap-3 rounded-2xl border-primary/40 px-4 py-3">
              <Search className="size-4 text-primary" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجو: هودی، کتانی، کوهستانی…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-faint"
              />
              <button type="submit" className="text-xs font-bold text-primary">
                جستجو
              </button>
            </div>
          </form>
        ) : null}
        {openDept ? (
          <div
            className="hidden border-t border-border md:block"
            onMouseEnter={() => setOpenDept(openDept)}
            onMouseLeave={() => setOpenDept(null)}
          >
            <Mega deptId={openDept} />
          </div>
        ) : null}
      </header>

      {mobile ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-bg/95 p-4 md:hidden">
          <div className="mb-6 flex items-center justify-between">
            <span className="font-display text-lg font-bold">منو</span>
            <button onClick={() => setMobile(false)} aria-label="بستن" className="rounded-full p-2">
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-6 pb-16">
            {TAXONOMY.map((d) => (
              <div key={d.id}>
                <Link to="/shop" search={{ dept: d.id }} onClick={() => setMobile(false)} className="text-lg font-semibold">
                  {d.nameFa}
                </Link>
                {d.genders.map((g) => (
                  <div key={g.id} className="mt-3">
                    <p className="text-xs text-faint">{g.nameFa}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {g.subs.map((s) => (
                        <Link
                          key={s.id}
                          to="/shop"
                          search={{ dept: d.id, gender: g.id, sub: s.id }}
                          onClick={() => setMobile(false)}
                          className="rounded-lg border border-border p-2 text-sm"
                        >
                          {s.nameFa}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <Link to="/lookbook" onClick={() => setMobile(false)} className="block text-sm text-muted">
              لوک‌بوک
            </Link>
            <Link to="/guide" onClick={() => setMobile(false)} className="block text-sm text-muted">
              راهنمای سایز
            </Link>
            <Link to="/about" onClick={() => setMobile(false)} className="block text-sm text-muted">
              درباره اورجینالی
            </Link>
            <Link to="/wishlist" onClick={() => setMobile(false)} className="block text-sm text-muted">
              علاقه‌مندی‌ها
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Mega({ deptId }: { deptId: string }) {
  const d = TAXONOMY.find((x) => x.id === deptId);
  if (!d) return null;
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-6">
      {d.genders.map((g) => (
        <div key={g.id}>
          <Link to="/shop" search={{ dept: d.id, gender: g.id }} className="text-sm font-semibold">
            {g.nameFa}
          </Link>
          <ul className="mt-3 grid grid-cols-2 gap-3">
            {g.subs.map((s) => (
              <li key={s.id}>
                <Link
                  to="/shop"
                  search={{ dept: d.id, gender: g.id, sub: s.id }}
                  className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-subtle"
                >
                  <img src={s.thumb} alt="" className="size-12 rounded-md object-cover" />
                  <span className="text-sm font-medium">{s.nameFa}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
