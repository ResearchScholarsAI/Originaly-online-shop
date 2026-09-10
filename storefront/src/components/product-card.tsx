import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { TiltCard } from "@/components/tilt-card";
import { toman } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist";
import type { SeedProduct } from "@/lib/catalog";

export function ProductCard({ product }: { product: SeedProduct }) {
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);

  return (
    <div className="relative">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <TiltCard>
          <div className="overflow-hidden rounded-[calc(var(--radius-xl)-4px)]">
            <div className="relative aspect-[4/5] bg-subtle">
              <img
                src={product.image}
                alt={product.nameFa}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              {product.compareAt ? (
                <span className="absolute top-3 right-3 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-fg">
                  فروش ویژه
                </span>
              ) : null}
            </div>
            <div className="p-4">
              <p className="text-xs text-faint">{product.brand}</p>
              <h3 className="mt-1 font-medium leading-snug transition-[font-weight] duration-150 group-hover:font-bold">
                {product.nameFa}
              </h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="tabular-nums text-primary">{toman(product.price)}</span>
                {product.compareAt ? (
                  <span className="text-xs text-faint line-through tabular-nums">{toman(product.compareAt)}</span>
                ) : null}
              </div>
            </div>
          </div>
        </TiltCard>
      </Link>
      <button
        type="button"
        aria-label="علاقه‌مندی"
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
