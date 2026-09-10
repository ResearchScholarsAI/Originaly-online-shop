import { createFileRoute, Link } from "@tanstack/react-router";
import { safeListProducts } from "@/lib/store";
import { ProductCard } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lookbook")({
  loader: () => safeListProducts({ department: "footwear" }),
  component: Lookbook,
});

function Lookbook() {
  const loaded = Route.useLoaderData();
  const products = (Array.isArray(loaded) ? loaded : []).slice(0, 8);
  return (
    <div>
      <section className="relative overflow-hidden">
        <img
          src="/products/lookbook-grid.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center">
          <p className="eyebrow">LOOKBOOK / DROP 04</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-6xl">نگاه، نه کاتالوگ.</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted">
            منتخب کتانی‌های استودیو — همان جفت‌هایی که روی رادار این فصل‌اند.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="overflow-hidden rounded-[28px] stage-lift">
          <img src="/products/lookbook-grid.jpg" alt="کالکشن کفش اورجینالی" className="w-full object-cover" />
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link to="/shop" search={{ dept: "footwear" }} className={cn(buttonVariants({ size: "lg" }))}>
            همه کفش‌ها
          </Link>
        </div>
      </section>
    </div>
  );
}
