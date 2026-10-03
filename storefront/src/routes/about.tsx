import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <div>
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(8,9,13,.55) 0%, rgba(8,9,13,.9) 100%), url('/brand/hero-cinematic.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto flex min-h-[420px] max-w-4xl flex-col items-center justify-end px-4 pb-16 pt-20 text-center">
          <BrandMark className="h-28 w-28" />
          <p className="eyebrow mt-6">ORIGINALY / DROP 04</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-6xl">انتخابی روشن، بی‌حاشیه.</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted">
            فروشگاه کفش و پوشاک با دسته‌بندی ساده و اطلاعات مشخص برای هر موجودی.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-16 md:grid-cols-3">
        {[
          { n: "01", t: "سایز مشخص", c: "هر کالای قابل سفارش با یک سایز ثابت ثبت می‌شود؛ کالاهای دارای اطلاعات ناقص از خرید کنار گذاشته می‌شوند." },
          { n: "02", t: "قیمت روشن", c: "قیمت درج‌شده قیمت فعلی محصول است. هزینهٔ ارسال جدا و در بخش تسویه به‌صورت شفاف توضیح داده می‌شود." },
          { n: "03", t: "اتصال‌های واقعی", c: "OTP پیامکی و پرداخت آنلاین به سرویس‌های واقعی وابسته‌اند و تا زمان پیکربندی نهایی، وضعیت آماده‌نبودن آن‌ها پنهان نمی‌شود." },
        ].map((x) => (
          <article key={x.n} className="stage-lift rounded-2xl bg-elevated p-6">
            <p className="font-mono text-xs text-primary">{x.n}</p>
            <h2 className="mt-3 font-display text-xl font-bold">{x.t}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{x.c}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 text-center">
        <p className="text-sm leading-7 text-muted">
          تمرکز اورجینالی بر نمایش دقیق کالای موجود، خرید ساده و پرهیز از وعده‌هایی است که هنوز پشتوانهٔ عملیاتی ندارند.
        </p>
        <Link to="/shop" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
          ورود به فروشگاه
        </Link>
      </section>
    </div>
  );
}
