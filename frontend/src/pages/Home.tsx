import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, ShieldCheck, BadgePercent, Star } from 'lucide-react';
import { fetchProducts, faDigits, discountPercent, type Product } from '@/lib/store';
import ProductCard from '@/components/ProductCard';

const HERO_URL =
  'https://mgx-backend-cdn.metadl.com/generate/images/1573859/2026-09-01/vuj7g6acakoq/hero-luxury-dark-gold.png';

const CATEGORIES = [
  { key: 'kafsh', label: 'کفش', desc: 'رانینگ، تنیس، لایف‌استایل', img: '/assets/products/ub20-1.jpg' },
  { key: 'lebas', label: 'لباس', desc: 'به‌زودی — منتظر تصاویر شما', img: '/assets/products/asics-1.jpg' },
  { key: 'shalvar', label: 'شلوار', desc: 'به‌زودی — منتظر تصاویر شما', img: '/assets/products/ghost-1.jpg' },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = products.filter((p) => p.featured).slice(0, 4);
  const offers = products.filter((p) => discountPercent(p)).slice(0, 4);

  return (
    <div>
      <section className="relative overflow-hidden hero-glow">
        <div className="absolute inset-0 pattern-grid" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-28 grid lg:grid-cols-2 gap-12 items-center relative">
          <div className="space-y-7">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-primary">
              <Sparkles className="w-3.5 h-3.5" /> {faDigits('2026')} — کالکشن اورجینال
            </span>
            <h1 className="text-4xl md:text-6xl font-black leading-[1.25]">
              <span className="gold-text">اورجینالی</span>
              <br />
              اصالت، امضای ماست
            </h1>
            <p className="text-muted-foreground text-lg leading-8 max-w-xl">
              کفش‌ها و پوشاک اورجینال با تضمین اصالت، قیمت منصفانه و ارسال سریع.
              انتخاب کن، در سبد بگذار، سفارش بده — همین ساده.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-gold rounded-full px-8 py-3.5 inline-flex items-center gap-2">
                مشاهده فروشگاه <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link to="/shop" className="glass rounded-full px-8 py-3.5 inline-flex items-center gap-2 hover:border-primary/60 transition-colors">
                <BadgePercent className="w-4 h-4 text-primary" /> تخفیف‌ها
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> ضمانت اصالت</span>
              <span className="flex items-center gap-2"><Star className="w-4 h-4 text-primary fill-primary" /> رضایت مشتریان</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-primary/25 via-transparent to-primary/10 blur-2xl spin-slow" />
            <img src={HERO_URL} alt="اورجینالی" className="relative w-full rounded-[2rem] object-cover ring-gold float-slow" />
            <div className="absolute -bottom-5 -right-5 glass-strong rounded-2xl px-5 py-3 float-slower">
              <p className="text-xs text-muted-foreground">تخفیف‌های ویژه</p>
              <p className="gold-text font-black text-xl">تا ۲۰٪</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-black mb-8">دسته‌بندی‌ها</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {CATEGORIES.map((c) => (
            <Link key={c.key} to="/shop" className="card-3d glass rounded-3xl overflow-hidden group">
              <div className="h-44 overflow-hidden">
                <img src={c.img} alt={c.label} className="w-full h-full object-cover img-3d group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg">{c.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-black">منتخب <span className="gold-text">اورجینالی</span></h2>
            <Link to="/shop" className="text-sm text-primary hover:underline flex items-center gap-1">
              همه محصولات <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-3xl h-80 shimmer" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      )}

      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-2xl md:text-3xl font-black mb-8">تخفیف‌های <span className="gold-text">امروز</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {offers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="glass rounded-[2rem] p-8 md:p-12 grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: ShieldCheck, t: 'تضمین اصالت', d: 'تمام کالاها اورجینال و با کارت اصالت عرضه می‌شوند.' },
            { icon: BadgePercent, t: 'قیمت منصفانه', d: 'حذف واسطه‌ها؛ بهترین قیمت بازار، شفاف و بدون هزینه پنهان.' },
            { icon: Sparkles, t: 'پشتیبانی واقعی', d: 'تماس مستقیم با مالک فروشگاه در نظرآباد — پاسخ‌گویی صادقانه.' },
          ].map((x, i) => (
            <div key={i} className="space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/15 grid place-items-center">
                <x.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg">{x.t}</h3>
              <p className="text-sm text-muted-foreground leading-7">{x.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}