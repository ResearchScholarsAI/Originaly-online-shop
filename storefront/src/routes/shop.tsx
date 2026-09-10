import { createFileRoute, Link } from "@tanstack/react-router";
import { safeListProducts } from "@/lib/store";
import { TAXONOMY, findSub, type Department, type Gender } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { chipClass } from "@/components/active-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type ShopSearch = {
  dept?: Department;
  gender?: Gender;
  sub?: string;
  q?: string;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    dept: s.dept === "clothing" || s.dept === "footwear" ? s.dept : undefined,
    gender: s.gender === "men" || s.gender === "women" ? s.gender : undefined,
    sub: typeof s.sub === "string" ? s.sub : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    safeListProducts({ department: deps.dept, gender: deps.gender, subcategory: deps.sub }),
  pendingComponent: ShopSkeleton,
  component: Shop,
});

function Shop() {
  const loaded = Route.useLoaderData();
  const products = Array.isArray(loaded) ? loaded : [];
  const search = Route.useSearch();
  const found = findSub(search.dept, search.gender, search.sub);
  const dept = TAXONOMY.find((d) => d.id === search.dept) ?? null;
  const gender = dept?.genders.find((g) => g.id === search.gender);
  const q = (search.q ?? "").trim().toLowerCase();
  const shown = q
    ? products.filter((p) => `${p.nameFa} ${p.nameEn} ${p.brand} ${p.subcategory}`.toLowerCase().includes(q))
    : products;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs text-faint">فروشگاه / {found.dept?.nameFa ?? "همه"}</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">
        {q ? `جستجو: ${search.q}` : found.sub?.nameFa ?? found.gender?.nameFa ?? found.dept?.nameFa ?? "همه محصولات"}
      </h1>
      <p className="mt-2 text-sm text-muted">{shown.length} محصول</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/shop" className={chipClass(!search.dept)}>
          همه
        </Link>
        {TAXONOMY.map((d) => (
          <Link key={d.id} to="/shop" search={{ dept: d.id }} className={chipClass(search.dept === d.id && !search.gender)}>
            {d.nameFa}
          </Link>
        ))}
      </div>

      {dept ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {dept.genders.map((g) => (
            <Link
              key={g.id}
              to="/shop"
              search={{ dept: dept.id, gender: g.id }}
              className={chipClass(search.gender === g.id && !search.sub)}
            >
              {g.nameFa}
            </Link>
          ))}
        </div>
      ) : null}

      {gender ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {gender.subs.map((s) => {
            const on = search.sub === s.id;
            return (
              <Link
                key={s.id}
                to="/shop"
                search={{ dept: dept!.id, gender: gender.id, sub: s.id }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-2 transition-transform duration-150",
                  on ? "border-primary bg-primary text-primary-fg scale-[1.03]" : "border-border hover:bg-subtle",
                )}
              >
                <img src={s.thumb} alt="" className="size-12 rounded-md object-cover" />
                <span className={cn("text-sm font-medium", on && "font-bold")}>{s.nameFa}</span>
              </Link>
            );
          })}
        </div>
      ) : null}

      {shown.length === 0 ? (
        <div className="stage-lift mx-auto mt-12 max-w-md rounded-2xl bg-elevated p-8 text-center">
          <p className="font-display text-xl font-bold">این قفسه هنوز خالی است</p>
          <p className="mt-2 text-sm leading-7 text-muted">
            دراپ بعدی در همین دسته می‌آید. فعلاً بقیهٔ آرشیو را ببینید.
          </p>
          <Link to="/shop" className="mt-5 inline-block text-sm font-bold text-primary">
            بازگشت به همه محصولات
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Skeleton className="h-8 w-48" />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5]" />
        ))}
      </div>
    </div>
  );
}
