import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpLeft, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { safeListProducts } from "@/lib/store";
import { EDITORIAL, PROMISES, TAXONOMY } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { TiltCard } from "@/components/tilt-card";
import { BrandMark } from "@/components/brand-mark";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: () => safeListProducts({}),
  pendingComponent: HomeSkeleton,
  component: Home,
});

function Home() {
  const products = Route.useLoaderData();
  const featured = products.slice(0, 8);
  return (
    <div>
      <section className="relative overflow-hidden">
        <img
          src="/brand/hero-cinematic.png"
          alt="Originaly — Authentic fashion"
          className="h-[72vh] min-h-[520px] w-full object-cover object-center sm:h-[78vh]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-10 sm:pb-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="eyebrow">DROP 04 / AUTHENTIC STATE</p>
              <h1 className="mt-3 font-display text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">
                اورجینال.
                <br />
                بدون حاشیه.
              </h1>
              <p className="mt-3 max-w-md text-sm leading-7 text-muted">
                پوشاک و کفش اورجینال با دسته‌بندی دقیق مردانه و زنانه.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/shop" search={{ dept: "footwear" }} className={cn(buttonVariants({ size: "lg" }))}>
                  کشف کالکشن
                  <ArrowUpLeft className="size-4" />
                </Link>
                <a href="#edit" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
                  ویراست امروز
                </a>
              </div>
            </div>
            <div className="glass hidden rounded-2xl p-4 sm:block">
              <div className="flex items-center gap-3">
                <BrandMark className="size-12" />
                <div>
                  <p className="text-xs tracking-[0.22em] text-primary">ORIGINALY.IR</p>
                  <p className="text-sm font-bold">Authentic / Original / Limited</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-xs text-muted">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> اصالت تضمین‌شده
            </span>
            <span className="flex items-center gap-2">
              <Truck className="size-4 text-primary" /> ارسال سریع
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> دراپ‌های محدود
            </span>
          </div>
        </div>
      </section>

      <section id="edit" className="mx-auto max-w-6xl px-4 py-16">
        <p className="eyebrow">THE EDIT / 04</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-5xl">ویراستِ امروز</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {EDITORIAL.map((card) => (
            <Link key={card.dept} to="/shop" search={{ dept: card.dept }} className="group relative min-h-[280px] overflow-hidden rounded-[28px] stage-lift">
              <img
                src={card.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/35 to-transparent" />
              <div className="relative flex min-h-[280px] flex-col justify-between p-7">
                <span className="eyebrow">{card.eyebrow}</span>
                <div>
                  <h3 className="max-w-sm text-3xl font-extrabold leading-tight">{card.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-muted">{card.copy}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <Link to="/lookbook" className="group relative min-h-[330px] overflow-hidden rounded-[28px] border border-border bg-elevated stage-lift">
            <img src="/brand/shoe-collage.png" alt="کالکشن شش‌تکه کفش‌های اورجینال" className="absolute inset-y-0 left-0 h-full w-[62%] object-contain object-left opacity-90 transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-l from-elevated via-elevated/75 to-transparent" />
            <div className="relative flex min-h-[330px] flex-col justify-between p-7 sm:p-9">
              <div className="self-end text-right"><p className="eyebrow">THE ORIGINALY SYSTEM</p><h2 className="mt-3 max-w-sm font-display text-3xl font-extrabold leading-tight sm:text-5xl">بیشتر از یک<br /><span className="text-primary">استایل.</span></h2><p className="mt-4 max-w-xs text-sm leading-7 text-muted">کالکشن‌های محدود، انتخاب دقیق و محصولی که قرار است مدت‌ها بماند.</p></div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-fg transition group-hover:gap-3">ورود به لوک‌بوک <ArrowUpLeft className="size-4" /></span>
            </div>
          </Link>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Link to="/guide" className="glass group rounded-[28px] p-6 transition hover:-translate-y-1"><p className="eyebrow">FIT / GUIDE</p><div className="mt-4 flex items-end justify-between gap-3"><div><h3 className="text-2xl font-extrabold">سایز درست، خرید مطمئن</h3><p className="mt-2 text-sm leading-6 text-muted">راهنمای انتخاب کفش و پوشاک برای هر محصول.</p></div><ArrowUpLeft className="size-5 text-primary transition group-hover:-translate-x-1 group-hover:-translate-y-1" /></div></Link>
            <Link to="/login" className="glass group rounded-[28px] p-6 transition hover:-translate-y-1"><p className="eyebrow">VERIFIED CHECKOUT</p><div className="mt-4 flex items-end justify-between gap-3"><div><h3 className="text-2xl font-extrabold">خرید با موبایل تأییدشده</h3><p className="mt-2 text-sm leading-6 text-muted">OTP واقعی، آدرس ذخیره‌شده و مسیر شفاف سفارش.</p></div><ShieldCheck className="size-5 text-primary transition group-hover:scale-110" /></div></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow">DEPARTMENTS</p>
            <h2 className="mt-2 font-display text-2xl font-bold">دپارتمان‌ها</h2>
          </div>
          <Link to="/lookbook" className="text-sm text-muted hover:text-fg">
            لوک‌بوک
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {TAXONOMY.map((d) => (
            <Link key={d.id} to="/shop" search={{ dept: d.id }} className="block">
              <TiltCard>
                <div className="relative overflow-hidden rounded-[calc(var(--radius-xl)-4px)]">
                  <img
                    src={d.id === "footwear" ? "/products/lookbook-grid.jpg" : "/products/coat-fur-honey.jpg"}
                    alt=""
                    className="h-56 w-full object-cover sm:h-72"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-xs text-muted">{d.nameEn}</p>
                    <p className="font-display text-3xl font-extrabold">{d.nameFa}</p>
                  </div>
                </div>
              </TiltCard>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow">CURATED</p>
            <h2 className="mt-2 font-display text-2xl font-bold">الان روی رادار</h2>
          </div>
          <Link to="/shop" className="text-sm text-muted hover:text-fg">
            همه محصولات
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section id="promise" className="border-y border-border bg-elevated/50 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">WHY ORIGINALY</p>
            <h2 className="mt-4 font-display text-4xl font-extrabold">
              چیزهایی که
              <br />
              <span className="text-primary">می‌مانند.</span>
            </h2>
          </div>
          <div className="grid gap-3">
            {PROMISES.map((p) => (
              <div key={p.number} className="glass rounded-2xl p-5 transition hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-sm text-primary">{p.number}</span>
                  <div>
                    <h3 className="font-bold">{p.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted">{p.copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Skeleton className="h-16 w-2/3" />
      <Skeleton className="mt-4 h-6 w-1/3" />
      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5]" />
        ))}
      </div>
    </div>
  );
}
