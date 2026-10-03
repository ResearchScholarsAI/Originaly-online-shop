import { Link } from "@tanstack/react-router";
import { Heart, Ruler } from "lucide-react";
import { toast } from "sonner";
import { TiltCard } from "@/components/tilt-card";
import { toman } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist";
import type { SeedProduct } from "@/lib/catalog";

export function ProductCard({ product }: { product: SeedProduct }) {
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);
  const size = product.sizes.split(",").map((value) => value.trim()).filter(Boolean)[0] ?? "—";
  const underReview = product.catalogStatus !== "available";

  return (
    <div className="relative">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <TiltCard>
          <div className="overflow-hidden rounded-[calc(var(--radius-xl)-4px)]">
            <div className="relative aspect-[4/5] bg-subtle">
              <img
                src={product.image}
                alt={product.nameFa}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              {underReview || product.stock < 1 ? (
                <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-bg/80 px-2.5 py-1 text-xs text-muted backdrop-blur">
                  {underReview ? "در حال بررسی · ناموجود" : "ناموجود"}
                </span>
              ) : null}
            </div>
            <div className="p-4">
              <p className="text-xs text-faint">{underReview ? "از کاتالوگ قبلی · جزئیات نیازمند تأیید" : product.brand}</p>
              <h3 className="mt-1 font-medium leading-snug transition-[font-weight] duration-150 group-hover:font-bold">
                {product.nameFa}
              </h3>
              {underReview ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted"><Ruler className="size-3.5 text-primary" /> قیمت و سایز در حال بازبینی</p>
              ) : (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                  <Ruler className="size-3.5 text-primary" /> سایز ثابت: <span className="font-semibold tabular-nums text-fg">{size}</span>
                </p>
              )}
              <div className="mt-2 flex items-baseline gap-2">
                <span className={underReview ? "text-xs text-muted" : "tabular-nums text-primary"}>{underReview ? "قیمت در حال بررسی" : toman(product.price)}</span>
                {!underReview && product.compareAt && product.compareAt > product.price ? (
                  <span className="text-xs text-faint line-through tabular-nums">{toman(product.compareAt)}</span>
                ) : null}
              </div>
            </div>
          </div>
        </TiltCard>
      </Link>
      <button
        type="button"
        aria-label={wished ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
        className="absolute top-3 left-3 z-10 grid size-9 place-items-center rounded-full border border-border bg-bg/70 backdrop-blur"
        onClick={(e) => {
          e.preventDefault();
          const on = toggle(product.id);
          toast.success(on ? "به علاقه‌مندی اضافه شد" : "از علاقه‌مندی حذف شد");
        }}
      >
        <Heart className={wished ? "size-4 fill-primary text-primary" : "size-4"} />
      </button>
    </div>
  );
}
