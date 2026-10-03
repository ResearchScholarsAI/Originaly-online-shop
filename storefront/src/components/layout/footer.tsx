import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand-mark";

export function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark className="size-12" alt="" />
            <p className="font-display text-2xl font-extrabold tracking-tight">ORIGINALY</p>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-7 text-muted">
            کفش و پوشاک با اطلاعات روشن، سایز مشخص و تجربهٔ خرید ساده.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium">کشف کن</p>
          <div className="mt-3 flex flex-col gap-2 text-muted">
            <Link to="/shop" search={{ dept: "clothing" }}>پوشاک</Link>
            <Link to="/shop" search={{ dept: "footwear" }}>کفش</Link>
            <Link to="/lookbook">لوک‌بوک</Link>
            <Link to="/wishlist">علاقه‌مندی‌ها</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-medium">راهنما</p>
          <div className="mt-3 flex flex-col gap-2 text-muted">
            <Link to="/guide">راهنمای انتخاب محصول</Link>
            <Link to="/about">دربارهٔ اورجینالی</Link>
            <Link to="/cart">سبد خرید و پرداخت</Link>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 border-t border-border px-4 py-5 text-[10px] text-faint sm:flex-row">
        <span>© Originaly</span>
        <span>اطلاعات هر سفارش پیش از ثبت نهایی نمایش داده می‌شود.</span>
      </div>
    </footer>
  );
}
