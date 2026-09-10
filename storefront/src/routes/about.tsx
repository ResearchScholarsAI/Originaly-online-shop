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
            "linear-gradient(180deg, rgba(8,9,13,.55) 0%, rgba(8,9,13,.88) 100%), url('/brand/hero-cinematic.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto flex min-h-[420px] max-w-4xl flex-col items-center justify-end px-4 pb-16 pt-20 text-center">
          <BrandMark className="h-28 w-28" />
          <p className="eyebrow mt-6">AUTHENTIC STATE</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-6xl">اورجینالی یعنی اصل.</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted">
            فروشگاه انتخاب‌شدهٔ پوشاک و کفش اورجینال؛ بدون هیاهو، با تأیید واقعی.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-16 md:grid-cols-3">
        {[
          { n: "01", t: "اصالت قبل از انبار", c: "اگر اصل نباشد، از انبار خارج نمی‌شود. برچسب، دوخت و پروفایل کالا قبل از لیست شدن چک می‌شود." },
          { n: "02", t: "خرید با موبایل تأییدشده", c: "ثبت سفارش فقط بعد از OTP. لایهٔ پیامک جداست تا کاوه‌نگار، Bird یا سرویس ایرانی بعدی بدون بازنویسی وصل شود." },
          { n: "03", t: "آمادۀ دامنه و ووکامرس", c: "خروجی CSV/JSON از پنل مدیریت. زرین‌پال اسکافلد شده. وقتی Merchant ID بیاید، درگاه زنده می‌شود." },
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
          اورجینالی برای کسانی ساخته شده که فرق «خوب» و «واقعاً درست» را می‌دانند. دراپ‌ها محدودند، دسته‌بندی‌ها دقیق‌اند، و ظاهر فروشگاه باید گرم بماند — نه شلوغ و نه ترسناک.
        </p>
        <Link to="/shop" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
          ورود به فروشگاه
        </Link>
      </section>
    </div>
  );
}
