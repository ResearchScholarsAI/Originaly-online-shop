import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { getProduct, listProducts } from "@/lib/store";
import { categoryPathFa } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { cn, toman } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ActiveChip } from "@/components/active-chip";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const p = await getProduct({ data: { slug: params.slug } });
    if (!p) throw new Error("محصول پیدا نشد");
    const all = await listProducts({
      data: { department: p.department, gender: p.gender },
    });
    const related = all.filter((x) => x.id !== p.id).slice(0, 4);
    return { product: p, related };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product: p, related } = Route.useLoaderData();
  const sizes = p.sizes.split(",").map((s) => s.trim()).filter(Boolean);
  const [size, setSize] = useState(sizes[0] ?? "");
  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.ids.includes(p.id));
  const toggle = useWishlist((s) => s.toggle);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="product-stage overflow-hidden rounded-[28px] bg-subtle">
          <img src={p.image} alt={p.nameFa} className="aspect-[4/5] w-full object-cover" />
        </div>
        <div>
          <p className="text-xs text-faint">{categoryPathFa(p.department, p.gender, p.subcategory)}</p>
          <p className="mt-3 text-sm text-muted">{p.brand}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight">{p.nameFa}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-xl tabular-nums text-primary">{toman(p.price)}</span>
            {p.compareAt ? (
              <span className="text-sm text-faint line-through tabular-nums">{toman(p.compareAt)}</span>
            ) : null}
          </div>
          <p className="mt-5 leading-7 text-muted">{p.descriptionFa}</p>

          <p className="mt-8 text-sm font-medium">سایز</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <ActiveChip key={s} active={size === s} onClick={() => setSize(s)}>
                {s}
              </ActiveChip>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              disabled={p.stock < 1}
              onClick={() => {
                add(
                  {
                    productId: p.id,
                    slug: p.slug,
                    nameFa: p.nameFa,
                    image: p.image,
                    price: p.price,
                    size,
                  },
                  1,
                );
                toast.success("به سبد اضافه شد");
              }}
            >
              افزودن به سبد
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                const on = toggle(p.id);
                toast.success(on ? "به علاقه‌مندی اضافه شد" : "حذف شد");
              }}
            >
              <Heart className={wished ? "size-4 fill-primary text-primary" : "size-4"} />
              علاقه‌مندی
            </Button>
            <Link to="/cart" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              مشاهده سبد
            </Link>
          </div>
          <p className="mt-4 text-xs text-faint">موجودی: {p.stock} عدد · ارسال سریع · اصالت تضمین‌شده</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="glass rounded-2xl p-4">
              <p className="flex items-center gap-2 text-sm font-bold">
                <ShieldCheck className="size-4 text-primary" /> اصالت قبل از ارسال
              </p>
              <p className="mt-2 text-xs leading-6 text-muted">اگر اصل نباشد، از انبار خارج نمی‌شود.</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="flex items-center gap-2 text-sm font-bold">
                <Truck className="size-4 text-primary" /> ارسال و مرجوعی
              </p>
              <p className="mt-2 text-xs leading-6 text-muted">ارسال سریع · ۷ روز فرصت بازگشت.</p>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <p className="eyebrow">NEARBY IN THE ARCHIVE</p>
          <h2 className="mt-2 font-display text-2xl font-bold">نزدیک این انتخاب</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
