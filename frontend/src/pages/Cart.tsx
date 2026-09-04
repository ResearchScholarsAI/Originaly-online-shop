import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  loadCart,
  onCartChange,
  setCartQty,
  removeFromCart,
  clearCart,
  cartTotal,
  formatToman,
  faDigits,
  submitOrder,
  normalizeIranPhone,
  isPhoneVerified,
  isZarinpalConfigured,
  BRAND,
  type CartItem,
} from '@/lib/store';
import PhoneVerification from '@/components/PhoneVerification';

const SHIPPING = 120000;

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>(loadCart());
  const [done, setDone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    city: '',
    address: '',
    postal_code: '',
    notes: '',
    payment_method: 'card-to-card',
  });

  useEffect(() => onCartChange(() => setItems(loadCart())), []);

  const total = cartTotal(items);
  const grand = items.length ? total + SHIPPING : 0;
  const normalizedPhone = normalizeIranPhone(form.phone);

  useEffect(() => {
    setPhoneVerified(normalizedPhone ? isPhoneVerified(normalizedPhone) : false);
  }, [normalizedPhone]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    if (!form.customer_name || !form.phone || !form.address || !form.city) {
      toast.error('لطفاً نام، تلفن، شهر و آدرس را کامل کنید');
      return;
    }
    if (!normalizedPhone) {
      toast.error('شماره موبایل معتبر نیست (مثال: ۰۹۱۲۲۶۴۰۹۷۹)');
      return;
    }
    // Server-side of truth is the phone_verified_at column set by the
    // verify-otp edge function; this client check only prevents an
    // unnecessary round-trip — it is not the security boundary itself.
    if (!isPhoneVerified(normalizedPhone)) {
      toast.error('لطفاً ابتدا شماره موبایل خود را تایید کنید');
      return;
    }
    setSubmitting(true);
    try {
      const orderNumber = await submitOrder({
        ...form,
        phone: normalizedPhone,
        items,
        total,
        shipping: SHIPPING,
      });
      clearCart();
      setDone(orderNumber);
      toast.success('سفارش شما با موفقیت ثبت شد');
    } catch (err) {
      console.error(err);
      toast.error('خطا در ثبت سفارش. دوباره تلاش کنید.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <CheckCircle2 className="w-20 h-20 text-primary mx-auto" />
        <h1 className="text-3xl font-black">سفارش ثبت شد!</h1>
        <p className="text-muted-foreground leading-8">
          کد پیگیری شما: <span className="gold-text font-black text-xl" dir="ltr">{done}</span>
          <br />
          به‌زودی برای تأیید و هماهنگی پرداخت با شما تماس می‌گیریم.
        </p>
        <div className="glass rounded-2xl p-5 text-sm text-muted-foreground leading-7">
          مبلغ قابل پرداخت: <span className="text-foreground font-bold">{formatToman(grand)}</span>
          <br />
          پرداخت: کارت‌به‌کارت به نام {BRAND.owner} — جزئیات پس از تماس تلفنی.
        </div>
        <Link to="/shop" className="btn-gold rounded-full px-8 py-3 inline-block">ادامه خرید</Link>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5">
        <ShoppingBag className="w-16 h-16 text-primary/50 mx-auto" />
        <h1 className="text-2xl font-black">سبد خرید شما خالی است</h1>
        <Link to="/shop" className="btn-gold rounded-full px-8 py-3 inline-block">رفتن به فروشگاه</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-black mb-8">سبد خرید</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((i) => (
            <div key={i.slug + i.size} className="glass rounded-2xl p-4 flex items-center gap-4">
              <img src={i.image_url} alt={i.name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <Link to={`/product/${i.slug}`} className="font-bold text-sm hover:text-primary line-clamp-1">{i.name}</Link>
                <p className="text-xs text-muted-foreground mt-1">سایز: {faDigits(i.size)}</p>
                <p className="text-primary font-bold text-sm mt-1">{formatToman(i.price)}</p>
              </div>
              <div className="glass rounded-full flex items-center gap-3 px-3 py-1.5">
                <button onClick={() => setCartQty(i.slug, i.size, i.qty - 1)}><Minus className="w-3.5 h-3.5 text-primary" /></button>
                <span className="text-sm font-bold min-w-5 text-center">{faDigits(i.qty)}</span>
                <button onClick={() => setCartQty(i.slug, i.size, i.qty + 1)}><Plus className="w-3.5 h-3.5 text-primary" /></button>
              </div>
              <button onClick={() => removeFromCart(i.slug, i.size)} className="text-muted-foreground hover:text-destructive p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-6 space-y-4 h-fit">
          <h2 className="font-black text-lg">اطلاعات گیرنده</h2>
          <input value={form.customer_name} onChange={set('customer_name')} placeholder="نام و نام خانوادگی *" className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none focus:border-primary/60" />
          <input value={form.phone} onChange={set('phone')} placeholder="موبایل *" dir="ltr" className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none focus:border-primary/60" />

          {normalizedPhone && <PhoneVerification phone={normalizedPhone} onVerified={() => setPhoneVerified(true)} />}

          <input value={form.city} onChange={set('city')} placeholder="شهر *" className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none focus:border-primary/60" />
          <textarea value={form.address} onChange={set('address')} placeholder="آدرس کامل پستی *" rows={3} className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none focus:border-primary/60 resize-none" />
          <input value={form.postal_code} onChange={set('postal_code')} placeholder="کد پستی" dir="ltr" className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none focus:border-primary/60" />
          <textarea value={form.notes} onChange={set('notes')} placeholder="توضیحات (اختیاری)" rows={2} className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none focus:border-primary/60 resize-none" />
          <select value={form.payment_method} onChange={set('payment_method')} className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none">
            <option value="card-to-card" className="bg-card">کارت‌به‌کارت</option>
            <option value="cod" className="bg-card">پرداخت در محل</option>
            <option value="zarinpal" className="bg-card" disabled={!isZarinpalConfigured()}>
              {isZarinpalConfigured() ? 'پرداخت آنلاین (زرین‌پال)' : 'پرداخت آنلاین (به‌زودی)'}
            </option>
          </select>
          {!isZarinpalConfigured() && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 -mt-2">
              <Lock className="w-3 h-3" /> درگاه پرداخت آنلاین زرین‌پال به‌زودی فعال می‌شود.
            </p>
          )}

          <div className="gold-line" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>جمع کالاها</span><span>{formatToman(total)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>هزینه ارسال</span><span>{formatToman(SHIPPING)}</span>
            </div>
            <div className="flex justify-between font-black text-lg pt-1">
              <span>مبلغ کل</span><span className="text-primary">{formatToman(grand)}</span>
            </div>
          </div>

          <button type="submit" disabled={submitting || !phoneVerified} className="btn-gold w-full rounded-full py-3.5 disabled:opacity-50 flex items-center justify-center gap-2">
            {!phoneVerified && <Lock className="w-4 h-4" />}
            {submitting ? 'در حال ثبت...' : phoneVerified ? 'ثبت نهایی سفارش' : 'ابتدا شماره را تایید کنید'}
          </button>
          <p className="text-[11px] text-muted-foreground text-center leading-5">
            پس از ثبت، همکار ما برای تأیید و ارسال شماره کارت تماس می‌گیرد.
          </p>
        </form>
      </div>
    </div>
  );
}