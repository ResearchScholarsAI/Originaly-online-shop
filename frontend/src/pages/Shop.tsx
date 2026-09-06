import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { fetchProducts, faDigits, type Product } from '@/lib/store';
import { CATEGORY_TREE, categoryPathLabel } from '@/lib/categories';
import ProductCard from '@/components/ProductCard';

const SORTS = [['newest', 'جدیدترین'], ['cheap', 'ارزان‌ترین'], ['expensive', 'گران‌ترین'], ['popular', 'پرفروش‌ترین']] as const;

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get('q') || '');
  const department = params.get('department') || '';
  const gender = params.get('gender') || '';
  const subcategory = params.get('subcategory') || '';
  const sort = params.get('sort') || 'newest';

  useEffect(() => { fetchProducts().then(setProducts).catch(console.error).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => {
    let list = products.filter((p) => !department || p.department === department);
    if (gender) list = list.filter((p) => p.gender === gender || p.gender === 'unisex');
    if (subcategory) list = list.filter((p) => p.subcategory_slug === subcategory);
    if (q.trim()) { const t = q.trim().toLowerCase(); list = list.filter((p) => `${p.name} ${p.brand || ''} ${p.category} ${categoryPathLabel(p)}`.toLowerCase().includes(t)); }
    return list.sort((a, b) => sort === 'cheap' ? a.price - b.price : sort === 'expensive' ? b.price - a.price : sort === 'popular' ? (b.sold || 0) - (a.sold || 0) : (b.created_at || '').localeCompare(a.created_at || ''));
  }, [products, department, gender, subcategory, q, sort]);

  const activeLabel = subcategory ? categoryPathLabel({ department: department as 'clothing' | 'footwear', gender: gender as 'men' | 'women', subcategory_slug: subcategory }) : department ? `${department === 'clothing' ? 'پوشاک' : 'کفش'}${gender ? ` / ${gender === 'men' ? 'مردانه' : 'زنانه'}` : ''}` : 'همه محصولات';
  const setFilter = (key: string, value?: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next); };

  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8"><div><p className="text-xs text-primary font-bold">ORIGINALY STORE</p><h1 className="text-3xl md:text-4xl font-black mt-1">{activeLabel}</h1></div><div className="glass rounded-full flex items-center gap-2 px-4 py-3 w-full lg:w-96"><Search className="w-4 h-4 text-primary" /><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setFilter('q', q || undefined)} placeholder="جستجوی محصول، برند یا دسته..." className="bg-transparent outline-none text-sm flex-1" /></div></div>
    <div className="glass rounded-[1.5rem] p-4 mb-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2"><span className="flex items-center gap-2 text-sm text-muted-foreground ml-2"><SlidersHorizontal className="w-4 h-4 text-primary" /> دسته:</span><button onClick={() => { setFilter('department'); setFilter('gender'); setFilter('subcategory'); }} className={!department ? 'active-chip rounded-full px-4 py-1.5 text-sm' : 'glass rounded-full px-4 py-1.5 text-sm'}>همه</button>{CATEGORY_TREE.map((d) => <button key={d.department} onClick={() => { const next = new URLSearchParams(params); next.set('department', d.department); next.delete('subcategory'); setParams(next); }} className={department === d.department ? 'active-chip rounded-full px-4 py-1.5 text-sm' : 'glass rounded-full px-4 py-1.5 text-sm'}>{d.fa}</button>)}</div>
      {department && <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-muted-foreground ml-2">جنسیت:</span>{[['', 'همه'], ['men', 'مردانه'], ['women', 'زنانه']] .map(([k, l]) => <button key={k} onClick={() => setFilter('gender', k || undefined)} className={gender === k ? 'active-chip rounded-full px-4 py-1.5 text-xs' : 'glass rounded-full px-4 py-1.5 text-xs'}>{l}</button>)}</div>}
      {department && gender && <div className="flex flex-wrap gap-2 border-t border-border/50 pt-3">{CATEGORY_TREE.find((d) => d.department === department)?.branches.find((b) => b.gender === gender)?.subcategories.map((s) => <button key={s.slug} onClick={() => setFilter('subcategory', subcategory === s.slug ? undefined : s.slug)} className={subcategory === s.slug ? 'active-chip rounded-full px-3 py-1.5 text-xs' : 'glass rounded-full px-3 py-1.5 text-xs'}>{s.fa}</button>)}</div>}
      <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{faDigits(filtered.length)} محصول</span><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">مرتب‌سازی:</span><select value={sort} onChange={(e) => setFilter('sort', e.target.value)} className="glass rounded-xl px-3 py-1.5 text-sm bg-transparent outline-none">{SORTS.map(([k, l]) => <option key={k} value={k} className="bg-card">{l}</option>)}</select>{(department || gender || subcategory || q) && <button onClick={() => { setParams({}); setQ(''); }} className="glass rounded-full p-2" aria-label="پاک کردن فیلترها"><X className="w-4 h-4" /></button>}</div></div>
    </div>
    {loading ? <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{[...Array(8)].map((_, i) => <div key={i} className="glass rounded-3xl h-80 shimmer" />)}</div> : filtered.length === 0 ? <div className="glass rounded-3xl py-20 text-center"><p className="text-muted-foreground">محصولی با این مشخصات یافت نشد.</p><Link to="/shop" className="inline-block mt-4 text-primary text-sm">بازگشت به همه محصولات</Link></div> : <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{filtered.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
  </div>;
}
