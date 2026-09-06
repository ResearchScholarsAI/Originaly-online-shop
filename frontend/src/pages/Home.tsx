import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BadgePercent, Footprints, Shirt, ShieldCheck, Sparkles, Star, Zap } from 'lucide-react';
import { fetchProducts, faDigits, discountPercent, type Product } from '@/lib/store';
import { CATEGORY_TREE } from '@/lib/categories';
import ProductCard from '@/components/ProductCard';

const HERO_URL = 'https://mgx-backend-cdn.metadl.com/generate/images/1573859/2026-09-01/vuj7g6acakoq/hero-luxury-dark-gold.png';

const ICONS = { clothing: Shirt, footwear: Footprints };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  const featured = useMemo(() => products.filter((p) => p.featured).slice(0, 4), [products]);
  const offers = useMemo(() => products.filter((p) => discountPercent(p)).slice(0, 4), [products]);

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[620px] flex items-center hero-glow">
        <div className="absolute inset-0 pattern-grid" />
        <div className="ambient-orb ambient-orb-a" /><div className="ambient-orb ambient-orb-b" />
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-16 md:py-24 grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center relative">
          <div className="space-y-7">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-primary border-primary/20">
              <Sparkles className="w-3.5 h-3.5" /> {faDigits('2026')} · انتخاب‌های اورجینال
            </span>
            <h1 className="text-4xl md:text-6xl xl:text-7xl font-black leading-[1.18] tracking-tight">
              استایل تو، <span className="gold-text">امضای توست.</span>
              <br />اصالت، امضای ماست.
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-8 max-w-xl">
              کتونی و پوشاک اورجینال برای استایل‌های روزمره؛ با تجربه خرید سریع، شفاف و ساخته‌شده برای مشتری ایرانی.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="btn-gold rounded-full px-8 py-3.5 inline-flex items-center gap-2">
                ورود به فروشگاه <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link to="/shop?gender=men" className="glass rounded-full px-7 py-3.5 inline-flex items-center gap-2 hover:border-primary/60">
                مردانه
              </Link>
              <Link to="/shop?gender=women" className="glass rounded-full px-7 py-3.5 inline-flex items-center gap-2 hover:border-primary/60">
                زنانه
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-xl pt-2">
              {[['اصالت', 'کالاهای اورجینال'], ['ارسال', 'به سراسر ایران'], ['پشتیبانی', 'واقعی و مستقیم']].map(([a, b]) => (
                <div key={a} className="glass rounded-2xl p-3">
                  <p className="font-black text-sm">{a}</p><p className="text-[11px] text-muted-foreground mt-1">{b}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative perspective-stage">
            <div className="absolute -inset-10 rounded-[3rem] bg-gradient-to-tr from-primary/25 via-cyan-400/5 to-fuchsia-400/20 blur-3xl spin-slow" />
            <div className="hero-frame glass-strong rounded-[2.5rem] p-2">
              <img src={HERO_URL} alt="اورجینالی؛ فروشگاه آنلاین کتونی و پوشاک اورجینال" className="relative w-full aspect-[4/3] rounded-[2rem] object-cover float-slow" />
            </div>
            <div className="absolute -bottom-5 -right-4 glass-strong rounded-2xl px-5 py-3 float-slower border-primary/20">
              <p className="text-xs text-muted-foreground">کالکشن‌های منتخب</p>
              <p className="gold-text font-black text-xl">Originaly Drops</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 ambient-noise">
        <div className="flex items-end justify-between mb-7"><div><p className="text-xs text-primary font-bold tracking-wider">SHOP BY STYLE</p><h2 className="text-2xl md:text-3xl font-black mt-1">دسته‌بندی اصلی</h2></div><span className="text-xs text-muted-foreground">مردانه · زنانه</span></div>
        <div className="grid md:grid-cols-2 gap-5">
          {(['men', 'women'] as const).map((gender) => {
            const label = gender === 'men' ? 'مردانه' : 'زنانه';
            const productsForGender = products.filter((p) => p.gender === gender || p.gender === 'unisex').slice(0, 2);
            return <Link key={gender} to={`/shop?gender=${gender}`} className="card-3d category-orbit glass rounded-[2rem] p-5 overflow-hidden relative group soft-glow magnetic-hover">
              <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative flex items-center justify-between mb-4"><div><p className="text-xs text-primary font-bold">ORIGINALY</p><h3 className="text-2xl font-black mt-1">{label}</h3><p className="text-xs text-muted-foreground mt-1">کتونی، تیشرت، جوراب، کلاه، کاپشن و لباس گرم</p></div><ArrowLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" /></div>
              <div className="grid grid-cols-2 gap-3 relative">{productsForGender.map((p) => <img key={p.id} src={p.image_url} alt={p.name} className="h-40 w-full object-cover rounded-2xl" />)}{productsForGender.length === 0 && <div className="col-span-2 h-40 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 grid place-items-center text-sm text-muted-foreground">کالکشن {label} در حال تکمیل است</div>}</div>
            </Link>;
          })}
        </div>
      </section>

      {(loading || featured.length > 0) && <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-8"><h2 className="text-2xl md:text-3xl font-black">منتخب <span className="gold-text">اورجینالی</span></h2><Link to="/shop" className="text-sm text-primary flex items-center gap-1">مشاهده همه <ArrowLeft className="w-4 h-4" /></Link></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{loading ? [...Array(4)].map((_, i) => <div key={i} className="glass rounded-3xl h-80 shimmer" />) : featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>}

      {offers.length > 0 && <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10"><h2 className="text-2xl md:text-3xl font-black mb-8">پیشنهادهای <span className="gold-text">ویژه</span></h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{offers.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16"><div className="glass rounded-[2rem] p-8 md:p-12 grid md:grid-cols-3 gap-8 text-center border-primary/10">
        {[{ icon: ShieldCheck, t: 'تضمین اصالت', d: 'تمرکز Originaly بر عرضه کالای اورجینال و تجربه خرید قابل اعتماد است.' }, { icon: BadgePercent, t: 'قیمت شفاف', d: 'قیمت، تخفیف و هزینه‌های سفارش پیش از پرداخت روشن نمایش داده می‌شوند.' }, { icon: Star, t: 'پشتیبانی واقعی', d: 'فروشگاه حضوری در نظرآباد و پشتیبانی مستقیم، پشت تجربه آنلاین قرار دارد.' }].map((x) => <div key={x.t} className="space-y-3"><div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 grid place-items-center"><x.icon className="w-7 h-7 text-primary" /></div><h3 className="font-bold text-lg">{x.t}</h3><p className="text-sm text-muted-foreground leading-7">{x.d}</p></div>)}
      </div></section>
    </div>
  );
}
