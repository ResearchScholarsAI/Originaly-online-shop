import { createFileRoute, Link } from "@tanstack/react-router";
import { Ruler, ScanSearch, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/guide")({ component: Guide });

function Guide() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="eyebrow">ONE SIZE / CLEAR DETAILS</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold">راهنمای انتخاب محصول</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
        هر کالا با همان سایز موجود در انبار معرفی می‌شود. سایز را از بین چند گزینه انتخاب نمی‌کنید؛ اندازهٔ ثبت‌شده را پیش از افزودن به سبد بررسی کنید.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Ruler, title: "سایز ثابت", copy: "عدد درج‌شده در صفحهٔ کالا، سایز همان موجودی است؛ گزینهٔ دیگری برای انتخاب نمایش داده نمی‌شود." },
          { icon: ScanSearch, title: "بررسی جزئیات", copy: "از ذره‌بین تصویری برای دیدن نزدیک‌تر رویه، رنگ و بافت عکس استفاده کنید." },
          { icon: ShoppingBag, title: "بدون حدس", copy: "اگر اطلاعات سایز یا قیمت یک کالا هنوز تأیید نشده باشد، تا زمان تکمیل قابل سفارش نخواهد بود." },
        ].map(({ icon: Icon, title, copy }) => (
          <article key={title} className="glass rounded-2xl p-5">
            <Icon className="size-5 text-primary" aria-hidden="true" />
            <h2 className="mt-4 font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted">{copy}</p>
          </article>
        ))}
      </section>
      <Link to="/shop" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
        دیدن کالاهای موجود
      </Link>
    </div>
  );
}
