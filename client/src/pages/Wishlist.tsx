import { useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { formatPrice, products } from '@/lib/catalog';
import { loadWishlist, saveWishlist, toggleWishlist } from '@/lib/store';

export default function Wishlist() {
  const [ids, setIds] = useState(loadWishlist());
  const saved = products.filter((product) => ids.includes(product.id));
  const remove = (id: string) => { const next = toggleWishlist(ids, id); setIds(next); saveWishlist(next); };
  return <div className="container py-14"><p className="eyebrow">YOUR SAVED EDIT</p><h1 className="display mt-4 text-5xl font-black md:text-7xl">علاقه‌مندی‌ها</h1>{saved.length ? <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{saved.map((product) => <article key={product.id} className="glass overflow-hidden rounded-[26px]"><div className="relative aspect-square"><img src={product.image} alt={product.name} className="h-full w-full object-cover"/><button onClick={() => remove(product.id)} className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur"><Trash2 size={15}/></button></div><div className="p-4"><p className="text-[10px] uppercase tracking-[.15em] text-white/40">{product.brand}</p><Link href={`/product/${product.slug}`} className="mt-1 block font-bold">{product.name}</Link><p className="mt-3 text-sm font-bold text-[var(--acid)]">{formatPrice(product.price)}</p></div></article>)}</div> : <div className="glass mt-10 rounded-[30px] py-24 text-center"><Heart className="mx-auto text-[var(--acid)]" size={32}/><p className="mt-5 font-bold">هنوز چیزی ذخیره نکرده‌ای.</p><Link href="/shop" className="btn-primary mt-7 inline-flex">کشف محصولات</Link></div>}</div>;
}
