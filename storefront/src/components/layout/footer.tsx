import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand-mark";

export function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark className="size-12" alt="" />
            <p className="font-display text-2xl font-extrabold tracking-tight">ORIGINALY</p>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-7 text-muted">
            برای کسانی که فرق بین «خوب» و «واقعاً درست» را می‌دانند.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium">کشف کن</p>
          <div className="mt-3 flex flex-col gap-2 text-muted">
            <Link to="/shop" search={{ dept: "clothing" }}>پوشاک</Link>
            <Link to="/shop" search={{ dept: "footwear" }}>کفش</Link>
            <Link to="/lookbook">نگاه / لوک‌بوک</Link>
            <Link to="/wishlist">علاقه‌مندی</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-medium">پشتیبانی</p>
          <div className="mt-3 flex flex-col gap-2 text-muted">
            <Link to="/guide">راهنمای سایز</Link>
            <Link to="/about">درباره اورجینالی</Link>
            <span>مرجوعی ۷ روزه</span>
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-sm font-bold">دراپ بعدی، زودتر از همه</p>
          <p className="mt-2 text-xs leading-6 text-muted">خبرهای محدود، بدون اسپم.</p>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="email"
              placeholder="ایمیل تو"
              className="min-w-0 flex-1 rounded-xl border border-border bg-bg px-3 py-2 text-xs outline-none"
              autoComplete="off"
              suppressHydrationWarning
            />
            <button type="submit" className="rounded-xl bg-primary px-3 text-xs font-black text-primary-fg">
              عضویت
            </button>
          </form>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 border-t border-border px-4 py-5 text-[10px] text-faint sm:flex-row">
        <span>© ۱۴۰۴ Originaly. Authentic state of mind.</span>
        <span>آماده اتصال دامنه اختصاصی و مهاجرت ووکامرس</span>
      </div>
    </footer>
  );
}