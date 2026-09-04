import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Star, Truck, RotateCcw, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchProductBySlug,
  addToCart,
  formatToman,
  faDigits,
  discountPercent,
  type Product,
} from '@/lib/store';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchProductBySlug(slug || '')
      .then((p) => {
        setProduct(p);
        if (p) {
          setSize((p.sizes && p.sizes[0]) || '');
          setActiveImg(0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const imgs = product.images && product.images.length ? product.images : [product.image_url];
    return imgs;
  }, [product]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="glass rounded-3xl h-[420px] shimmer" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center space-y-4">
        <p className="text-xl">محصول یافت نشد.</p>
        <Link to="/shop" className="btn-gold rounded-full px-6 py-2.5 inline-block">بازگشت به فروشگاه</Link>
      </div>
    );
  }

  const off = discountPercent(product);

  const handleAdd = () => {
    if (!size) {
      toast.error('ابتدا سایز را انتخاب کنید');
      return;
    }
    addToCart(product, size, qty);
    toast.success('به سبد خرید اضافه شد');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary">خانه</Link>
        <ChevronRight className="w-3 h-3 rotate-180" />
        <Link to="/shop" className="hover:text-primary">فروشگاه</Link>
        <ChevronRight className="w-3 h-3 rotate-180" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <div className="glass rounded-[2rem] overflow-hidden ring-gold">
            <img src={gallery[activeImg]} alt={product.name} className="w-full h-[380px] md:h-[480px] object-cover" />
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-3 mt-4">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`rounded-xl overflow-hidden border-2 transition-colors ${
                    i === activeImg ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={g} alt="" className="w-20 h-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-primary mb-2">{product.brand}</p>
            <h1 className="text-2xl md:text-3xl font-black leading-relaxed">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary fill-primary" /> {faDigits(Number(product.rating || 0).toFixed(1))}
              </span>
              <span>•</span>
              <span>{faDigits(product.sold ?? 0)} فروش</span>
              <span>•</span>
              <span>{product.stock > 0 ? `موجود: ${faDigits(product.stock)}` : 'ناموجود'}</span>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-black text-2xl text-primary">{formatToman(product.price)}</p>
              {product.old_price ? (
                <p className="text-sm text-muted-foreground line-through mt-1">{formatToman(product.old_price)}</p>
              ) : null}
            </div>
            {off ? (
              <span className="bg-destructive text-destructive-foreground text-sm font-bold rounded-full px-3 py-1.5">
                ٪{faDigits(off)} تخفیف
              </span>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-bold mb-3">انتخاب سایز:</p>
            <div className="flex flex-wrap gap-2">
              {(product.sizes || []).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-12 h-12 rounded-xl grid place-items-center text-sm font-bold transition-all ${
                    size === s ? 'btn-gold scale-105' : 'glass hover:border-primary/60'
                  }`}
                >
                  {faDigits(s)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-sm font-bold">تعداد:</p>
            <div className="glass rounded-full flex items-center gap-4 px-4 py-2">
              <button onClick={() => setQty((v) => Math.max(1, v - 1))} className="text-primary font-black text-lg">−</button>
              <span className="font-bold min-w-6 text-center">{faDigits(qty)}</span>
              <button onClick={() => setQty((v) => Math.min(product.stock || 99, v + 1))} className="text-primary font-black text-lg">+</button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="btn-gold rounded-full flex-1 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {product.stock > 0 ? 'افزودن به سبد خرید' : 'ناموجود'}
            </button>
            <button
              onClick={() => {
                if (!size) {
                  toast.error('ابتدا سایز را انتخاب کنید');
                  return;
                }
                addToCart(product, size, qty);
                navigate('/cart');
              }}
              disabled={product.stock <= 0}
              className="glass rounded-full px-6 py-3.5 hover:border-primary/60 disabled:opacity-40"
            >
              خرید فوری
            </button>
          </div>

          <p className="text-sm text-muted-foreground leading-8 border-t border-border/60 pt-5">
            {product.description}
          </p>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            {[
              { icon: ShieldCheck, t: 'ضمانت اصالت' },
              { icon: RotateCcw, t: '۷ روز بازگشت' },
              { icon: Truck, t: 'ارسال سریع' },
            ].map((x, i) => (
              <div key={i} className="glass rounded-2xl py-4 space-y-2">
                <x.icon className="w-5 h-5 text-primary mx-auto" />
                <p className="text-muted-foreground">{x.t}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-primary/80">
            <Check className="w-4 h-4" /> کالای اورجینال با بسته‌بندی اصلی کارخانه
          </div>
        </div>
      </div>
    </div>
  );
}