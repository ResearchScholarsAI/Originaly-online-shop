import { createFileRoute, Link } from "@tanstack/react-router";
import { safeListProducts } from "@/lib/store";
import { useWishlist } from "@/lib/wishlist";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/wishlist")({
  loader: () => safeListProducts({}),
  component: WishlistPage,
});

function WishlistPage() {
  const loaded = Route.useLoaderData();
  const products = Array.isArray(loaded) ? loaded : [];
  const ids = useWishlist((s) => s.ids);
  const saved = products.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="eyebrow">WISHLIST</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">علاقه‌مندی‌ها</h1>
      {saved.length === 0 ? (
        <p className="mt-8 text-muted">
          هنوز چیزی ذخیره نشده.{" "}
          <Link to="/shop" className="text-primary underline">
            فروشگاه
          </Link>
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {saved.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
