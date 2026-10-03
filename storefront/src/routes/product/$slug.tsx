import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Ruler, ScanSearch } from "lucide-react";
import { toast } from "sonner";
import { getProduct, listProducts } from "@/lib/store";
import { canPurchaseProduct, categoryPathFa } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { cn, toman } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { ProductFocusLens } from "@/components/product-focus-lens";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const p = await getProduct({ data: { slug: params.slug } });
    if (!p) throw new Error("این کالا در کاتالوگ پیدا نشد");
    const all = await listProducts({ data: { department: p.department, gender: p.gender } });
    const related = all
      .filter((x) => x.id !== p.id && canPurchaseProduct(x))
      .sort((a, b) => {
        const sameBrand = Number(b.brand === p.brand) - Number(a.brand === p.brand);
        const sameCategory = Number(b.subcategory === p.subcategory) - Number(a.subcategory === p.subcategory);
        const priceDistance = Math.abs(a.price - p.price) - Math.abs(b.price - p.price);
        return sameBrand || sameCategory || priceDistance;
      })
      .slice(0, 4);
    return { product: p, related };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product: p, related } = Route.useLoaderData();
  const underReview = p.catalogStatus !== "available";
  const canBuy = canPurchaseProduct(p);
  const size = p.sizes.trim();
  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.ids.includes(p.id));
  const toggle = useWishlist((s) => s.toggle);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductFocusLens src={p.image} alt={p.nameFa} />
        <div>
          <p className="text-xs text-faint">{categoryPathFa(p.department, p.gender, p.subcategory)}</p>
          <p className="mt-3 text-sm text-muted">{underReview ? "از کاتالوگ قبلی · اطلاعات نیازمند تأیید" : p.brand}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight">{p.nameFa}</h1>
          {underReview ? <p className="mt-3 inline-flex rounded-full border border-warn/30 bg-warn/5 px-3 py-1.5 text-xs text-warn">ناموجود · مشخصات در حال بازبینی</p> : null}
          <div className="mt-4 flex items-baseline gap-3">
            <span className={underReview ? "text-sm text-muted" : "text-xl tabular-nums text-primary"}>{underReview ? "قیمت در حال بررسی" : toman(p.price)}</span>
            {!underReview && p.compareAt && p.compareAt > p.price ? (
              <span className="text-sm text-faint line-through tabular-nums">{toman(p.compareAt)}</span>
            ) : null}
          </div>
          <p className="mt-5 leading-7 text-muted">{underReview ? "این محصول از فهرست پیشین فروشگاه نگه داشته شده تا حذف نشود. نام و مدل، برند، قیمت و سایز هنوز تأیید نشده‌اند؛ فعلاً ناموجود است و امکان افزودن به سبد یا ثبت سفارش ندارد." : p.descriptionFa}</p>

          {underReview ? (
            <div className="mt-7 rounded-2xl border border-warn/30 bg-warn/5 p-4 text-sm leading-7 text-muted">وقتی اطلاعات این کالا تکمیل و موجودی واقعی ثبت شد، مالک فروشگاه می‌تواند آن را فعال کند. اندازه‌های قبلی تا زمان بازبینی نشان داده نمی‌شوند.</div>
          ) : (
            <div className="mt-7 rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold"><Ruler className="size-4 text-primary" /> سایز همین موجودی</p>
              <p className="mt-2 text-lg font-bold tabular-nums">{size}</p>
              <p className="mt-1 text-xs text-muted">این محصول با همین یک سایز ثبت شده است؛ گزینهٔ انتخابی دیگری ندارد.</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              size="lg"
              disabled={!canBuy}
              onClick={() => {
                add({ productId: p.id, slug: p.slug, nameFa: p.nameFa, image: p.image, price: p.price, size, stock: p.stock }, 1);
                toast.success("به سبد اضافه شد");
              }}
            >
              {canBuy ? "افزودن به سبد" : underReview ? "اطلاعات در حال بررسی" : "ناموجود"}
            </Button>
            <Button size="lg" variant="outline" onClick={() => {
              const on = toggle(p.id);
              toast.success(on ? "به علاقه‌مندی اضافه شد" : "حذف شد");
            }}>
              <Heart className={wished ? "size-4 fill-primary text-primary" : "size-4"} /> علاقه‌مندی
            </Button>
            <Link to="/cart" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>مشاهده سبد</Link>
          </div>
          <p className="mt-4 text-xs text-faint">{canBuy ? `موجودی ثبت‌شده: ${p.stock} عدد` : underReview ? "فعلاً ناموجود است؛ این صفحه برای حفظ کاتالوگ قبلی باقی مانده است." : "این کالا اکنون موجود نیست."}</p>
          <div className="glass mt-8 rounded-2xl p-5">
            <p className="flex items-center gap-2 text-sm font-bold"><ScanSearch className="size-4 text-primary" /> ذره‌بین تصویری</p>
            <p className="mt-2 text-xs leading-6 text-muted">روی عکس مکث کنید یا آن را لمس کنید؛ سپس موس یا انگشت را آرام حرکت دهید تا جزئیات نزدیک‌تر را در کادر دنبال کنید.</p>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <p className="eyebrow">SIMILAR / IN STOCK</p>
          <h2 className="mt-2 font-display text-2xl font-bold">نزدیک به این انتخاب</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div>
        </section>
      ) : null}
    </div>
  );
}
