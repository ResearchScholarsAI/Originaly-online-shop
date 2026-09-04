import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { fetchProducts, faDigits, type Product } from '@/lib/store';
import ProductCard from '@/components/ProductCard';

const GENDERS = [
  { key: '', label: 'همه' },
  { key: 'men', label: 'مردانه' },
  { key: 'women', label: 'زنانه' },
  { key: 'unisex', label: 'هر دو' },
];

const SORTS = [
  { key: 'newest', label: 'جدیدترین' },
  { key: 'cheap', label: 'ارزان‌ترین' },
  { key: 'expensive', label: 'گران‌ترین' },
  { key: 'popular', label: 'پرفروش‌ترین' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest');

  const gender = params.get('gender') || '';

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (gender) list = list.filter((p) => p.gender === gender || p.gender === 'unisex');
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          (p.brand || '').toLowerCase().includes(t) ||
          p.category.toLowerCase().includes(t)
      );
    }
    switch (sort) {
      case 'cheap':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'expensive':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        list.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
      default:
        list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    }
    return list;
  }, [products, gender, q, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-black">
          فروشگاه <span className="gold-text">اورجینالی</span>
        </h1>
        <div className="glass rounded-full flex items-center gap-2 px-4 py-2.5 w-full md:w-80">
          <Search className="w-4 h-4 text-primary shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجوی نام، برند..."
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="glass rounded-2xl p-4 mb-8 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4 text-primary" /> فیلتر:
        </span>
        {GENDERS.map((g) => (
          <button
            key={g.key || 'all'}
            onClick={() => {
              const next = new URLSearchParams(params);
              if (g.key) next.set('gender', g.key);
              else next.delete('gender');
              setParams(next);
            }}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              gender === g.key ? 'btn-gold' : 'glass hover:border-primary/50'
            }`}
          >
            {g.label}
          </button>
        ))}
        <div className="mr-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">مرتب‌سازی:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="glass rounded-xl px-3 py-1.5 text-sm bg-transparent outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key} className="bg-card">{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="glass rounded-3xl h-80 shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-3xl py-20 text-center text-muted-foreground">
          محصولی با این مشخصات یافت نشد.
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">{faDigits(filtered.length)} محصول</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}