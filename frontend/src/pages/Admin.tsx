import { useEffect, useState } from 'react';
import {
  supabase,
  ADMIN_EMAIL,
  adminSignIn,
  adminSignOut,
  getAdminSession,
  fetchProducts,
  fetchOrders,
  createProduct,
  updateProduct,
  deleteProduct,
  updateOrderStatus,
  productsToWooJSON,
  productsToCSV,
  fetchCustomers,
  customersToCSV,
  downloadFile,
  formatToman,
  faDigits,
  type Product,
  type Customer,
} from '@/lib/store';
import { toast } from 'sonner';
import { BarChart3, ShoppingBag, Users, WalletCards, PackageSearch } from 'lucide-react';
import { CATEGORY_TREE, categoryPathLabel, type Department, type Gender } from '@/lib/categories';

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getAdminSession()
      .then((s) => setAuthed(!!s))
      .finally(() => setChecking(false));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session && session.user.email === ADMIN_EMAIL);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminSignIn(email, password);
      setAuthed(true);
      toast.success('خوش آمدید');
    } catch (err) {
      console.error(err);
      toast.error('نام کاربری یا رمز عبور اشتباه است');
    } finally {
      setBusy(false);
    }
  };

  if (checking) {
    return <div className="max-w-md mx-auto px-4 py-32"><div className="glass rounded-3xl h-64 shimmer" /></div>;
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <form onSubmit={login} className="glass-strong rounded-3xl p-8 space-y-4">
          <h1 className="text-2xl font-black text-center">ورود پنل مدیریت</h1>
          <p className="text-xs text-muted-foreground text-center">فقط حساب مالک فروشگاه اجازه ورود دارد.</p>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="ایمیل مدیر" dir="ltr" className="w-full glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none focus:border-primary/60" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="رمز عبور" dir="ltr" className="w-full glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none focus:border-primary/60" />
          <button type="submit" disabled={busy} className="btn-gold w-full rounded-full py-3 disabled:opacity-50">
            {busy ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">پنل <span className="gold-text">مدیریت</span></h1>
        <button onClick={() => adminSignOut()} className="glass rounded-full px-5 py-2 text-sm hover:border-destructive/60 hover:text-destructive transition-colors">
          خروج
        </button>
      </div>
      <AdminDashboard />
    </div>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState<'overview' | 'products' | 'orders' | 'customers'>('overview');
  return (
    <div className="space-y-6">
      <div className="glass rounded-full p-1.5 w-fit flex gap-1">
        <button onClick={() => setTab('overview')} className={`rounded-full px-6 py-2 text-sm transition-all ${tab === 'overview' ? 'active-chip' : 'hover:text-primary'}`}>نمای کلی</button>
        <button onClick={() => setTab('products')} className={`rounded-full px-6 py-2 text-sm transition-all ${tab === 'products' ? 'active-chip' : 'hover:text-primary'}`}>محصولات</button>
        <button onClick={() => setTab('orders')} className={`rounded-full px-6 py-2 text-sm transition-all ${tab === 'orders' ? 'active-chip' : 'hover:text-primary'}`}>سفارش‌ها</button>
        <button onClick={() => setTab('customers')} className={`rounded-full px-6 py-2 text-sm transition-all ${tab === 'customers' ? 'active-chip' : 'hover:text-primary'}`}>مشتریان</button>
      </div>
      {tab === 'overview' ? <AdminOverview /> : tab === 'products' ? <ProductsPanel /> : tab === 'orders' ? <OrdersPanel /> : <CustomersPanel />}
    </div>
  );
}


function AdminOverview() {
  const [data, setData] = useState({ products: 0, activeProducts: 0, orders: 0, pending: 0, customers: 0, revenue: 0, lowStock: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchOrders(), fetchCustomers()])
      .then(([products, orders, customers]) => {
        const rows = orders as Record<string, unknown>[];
        setData({
          products: products.length,
          activeProducts: products.filter((p) => p.is_active).length,
          orders: rows.length,
          pending: rows.filter((o) => ['pending', 'confirmed'].includes(String(o.status))).length,
          customers: customers.length,
          revenue: rows.filter((o) => String(o.status) !== 'cancelled').reduce((sum, o) => sum + (Number(o.total) || 0), 0),
          lowStock: products.filter((p) => p.is_active && p.stock <= 3).length,
        });
      })
      .catch((err) => { console.error(err); toast.error('خطا در بارگذاری نمای کلی'); })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'فروش ثبت‌شده', value: formatToman(data.revenue), icon: WalletCards },
    { label: 'سفارش‌ها', value: faDigits(data.orders), icon: ShoppingBag },
    { label: 'مشتریان', value: faDigits(data.customers), icon: Users },
    { label: 'محصولات کم‌موجودی', value: faDigits(data.lowStock), icon: PackageSearch },
  ];

  if (loading) return <div className="glass rounded-3xl h-56 shimmer" />;
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute -left-8 -top-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
            <Icon className="w-5 h-5 text-primary mb-6" />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-black mt-1">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass rounded-3xl p-5"><p className="text-xs text-muted-foreground">محصولات فعال</p><p className="text-2xl font-black mt-2">{faDigits(data.activeProducts)}</p></div>
        <div className="glass rounded-3xl p-5"><p className="text-xs text-muted-foreground">سفارش‌های نیازمند پیگیری</p><p className="text-2xl font-black mt-2">{faDigits(data.pending)}</p></div>
        <div className="glass rounded-3xl p-5"><p className="text-xs text-muted-foreground">وضعیت عملیات</p><p className="text-sm font-bold mt-3 text-emerald-400">داده‌ها از پایگاه‌داده فروشگاه خوانده می‌شوند</p></div>
      </div>
    </div>
  );
}

function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = () => fetchProducts().then(setProducts).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const exportJSON = () => downloadFile('originaly-products-woo.json', JSON.stringify(productsToWooJSON(products), null, 2));
  const exportCSV = () => downloadFile('originaly-products.csv', productsToCSV(products), 'text/csv');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setEditing('new')} className="btn-gold rounded-full px-5 py-2 text-sm">+ محصول جدید</button>
        <button onClick={exportJSON} className="glass rounded-full px-5 py-2 text-sm hover:border-primary/60">خروجی JSON (ووکامرس)</button>
        <button onClick={exportCSV} className="glass rounded-full px-5 py-2 text-sm hover:border-primary/60">خروجی CSV</button>
      </div>

      {loading ? (
        <div className="glass rounded-3xl h-40 shimmer" />
      ) : (
        <div className="glass rounded-3xl overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="border-b border-border/60 text-muted-foreground">
              <tr>
                <th className="p-4 text-right">محصول</th>
                <th className="p-4 text-right">دسته</th>
                <th className="p-4 text-right">قیمت</th>
                <th className="p-4 text-right">موجودی</th>
                <th className="p-4 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border/40 hover:bg-primary/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs leading-6">{categoryPathLabel(p)}</td>
                  <td className="p-4">{formatToman(p.price)}</td>
                  <td className="p-4">{faDigits(p.stock)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(p)} className="glass rounded-lg px-3 py-1.5 text-xs hover:border-primary/60">ویرایش</button>
                      <button onClick={async () => { if (confirm('حذف شود؟')) { await deleteProduct(p.id); reload(); } }} className="glass rounded-lg px-3 py-1.5 text-xs hover:border-destructive/60 hover:text-destructive">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <ProductForm product={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
    </div>
  );
}

function ProductForm({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: () => void }) {
  const initialDepartment: Department = product?.department || 'footwear';
  const initialGender: Gender = product?.gender === 'women' ? 'women' : 'men';
  const initialSubcategory = product?.subcategory_slug || `${initialGender}-${initialDepartment === 'footwear' ? 'sneakers' : 'tshirt'}`;
  const [f, setF] = useState({
    slug: product?.slug || '',
    name: product?.name || '',
    department: initialDepartment,
    gender: initialGender,
    subcategory_slug: initialSubcategory,
    category: product?.category || (initialDepartment === 'footwear' ? 'کفش' : 'پوشاک'),
    brand: product?.brand || '',
    price: product?.price ?? 0,
    old_price: product?.old_price ?? null,
    stock: product?.stock ?? 0,
    description: product?.description || '',
    sizes: (product?.sizes || []).join(','),
    image_url: product?.image_url || '',
    images: (product?.images || []).join('\n'),
    featured: product?.featured ?? false,
  });
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.slug || !f.name || !f.image_url) { toast.error('اسلاگ، نام و تصویر اصلی الزامی است'); return; }
    setBusy(true);
    try {
      const payload = {
        slug: f.slug,
        name: f.name,
        category: f.department === 'footwear' ? 'کفش' : 'پوشاک',
        department: f.department,
        gender: f.gender,
        subcategory_slug: f.subcategory_slug,
        brand: f.brand || null,
        price: Number(f.price) || 0,
        old_price: f.old_price ? Number(f.old_price) : null,
        stock: Number(f.stock) || 0,
        description: f.description,
        sizes: f.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        image_url: f.image_url,
        images: f.images.split('\n').map((s) => s.trim()).filter(Boolean),
        featured: !!f.featured,
        is_active: true,
      };
      if (product) await updateProduct(product.id, payload);
      else await createProduct(payload);
      toast.success(product ? 'محصول به‌روزرسانی شد' : 'محصول اضافه شد');
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error('خطا در ذخیره محصول');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="glass-strong rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3">
        <h2 className="font-black text-lg">{product ? 'ویرایش محصول' : 'محصول جدید'}</h2>
        <input value={f.slug} onChange={set('slug')} placeholder="اسلاگ (انگلیسی، یکتا) *" dir="ltr" className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
        <input value={f.name} onChange={set('name')} placeholder="نام محصول *" className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
        <div className="grid grid-cols-2 gap-3">
          <select value={f.department} onChange={(e) => setF((s) => ({ ...s, department: e.target.value as Department, subcategory_slug: `${s.gender}-${e.target.value === 'footwear' ? 'sneakers' : 'tshirt'}` }))} className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none">
            <option value="footwear" className="bg-card">کفش</option><option value="clothing" className="bg-card">پوشاک</option>
          </select>
          <select value={f.gender} onChange={(e) => setF((s) => ({ ...s, gender: e.target.value as Gender, subcategory_slug: `${e.target.value}-${s.department === 'footwear' ? 'sneakers' : 'tshirt'}` }))} className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none">
            <option value="men" className="bg-card">مردانه</option><option value="women" className="bg-card">زنانه</option>
          </select>
        </div>
        <select value={f.subcategory_slug} onChange={set('subcategory_slug')} className="glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none w-full">
          {CATEGORY_TREE.find((d) => d.department === f.department)?.branches.find((b) => b.gender === f.gender)?.subcategories.map((s) => <option key={s.slug} value={s.slug} className="bg-card">{s.fa}</option>)}
        </select>
        <input value={f.brand} onChange={set('brand')} placeholder="برند" className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
        <div className="grid grid-cols-3 gap-3">
          <input value={f.price} onChange={set('price')} type="number" placeholder="قیمت *" className="glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none" />
          <input value={f.old_price ?? ''} onChange={set('old_price')} type="number" placeholder="قیمت قبلی" className="glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none" />
          <input value={f.stock} onChange={set('stock')} type="number" placeholder="موجودی" className="glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none" />
        </div>
        <input value={f.sizes} onChange={set('sizes')} placeholder="سایزها با کاما: 41,42,43" dir="ltr" className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
        <input value={f.image_url} onChange={set('image_url')} placeholder="مسیر تصویر اصلی (مثال /assets/products/x.jpg) *" dir="ltr" className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none" />
        <textarea value={f.images} onChange={set('images')} placeholder="گالری (هر خط یک مسیر)" rows={3} dir="ltr" className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none resize-none" />
        <textarea value={f.description} onChange={set('description')} placeholder="توضیحات" rows={3} className="w-full glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none resize-none" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.featured} onChange={set('featured')} className="accent-primary w-4 h-4" /> نمایش در «منتخب اورجینالی»
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={busy} className="btn-gold flex-1 rounded-full py-2.5 disabled:opacity-50">{busy ? '...' : 'ذخیره'}</button>
          <button type="button" onClick={onClose} className="glass rounded-full px-6 py-2.5">انصراف</button>
        </div>
      </form>
    </div>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => fetchOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const STATUS: Record<string, string> = {
    pending: 'در انتظار',
    confirmed: 'تأییدشده',
    shipped: 'ارسال‌شده',
    delivered: 'تحویل‌شده',
    cancelled: 'لغوشده',
  };

  return (
    <div className="glass rounded-3xl overflow-x-auto">
      {loading ? (
        <div className="h-40 shimmer m-4 rounded-2xl" />
      ) : orders.length === 0 ? (
        <p className="p-10 text-center text-muted-foreground">هنوز سفارشی ثبت نشده است.</p>
      ) : (
        <table className="w-full text-sm min-w-[860px]">
          <thead className="border-b border-border/60 text-muted-foreground">
            <tr>
              <th className="p-4 text-right">کد سفارش</th>
              <th className="p-4 text-right">مشتری</th>
              <th className="p-4 text-right">مبلغ</th>
              <th className="p-4 text-right">اقلام</th>
              <th className="p-4 text-right">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const items = (o.items as { name: string; qty: number }[]) || [];
              return (
                <tr key={String(o.id)} className="border-b border-border/40">
                  <td className="p-4 font-bold" dir="ltr">{String(o.order_number)}</td>
                  <td className="p-4">
                    <p>{String(o.customer_name)}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">{String(o.phone)}</p>
                  </td>
                  <td className="p-4">{formatToman(Number(o.total) || 0)}</td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {items.map((i, k) => <span key={k}>{i.name} ×{faDigits(i.qty)}{k < items.length - 1 ? '، ' : ''}</span>)}
                  </td>
                  <td className="p-4">
                    <select
                      value={String(o.status)}
                      onChange={async (e) => { await updateOrderStatus(String(o.id), e.target.value); reload(); }}
                      className="glass rounded-lg px-2 py-1.5 text-xs bg-transparent outline-none"
                    >
                      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k} className="bg-card">{v}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CustomersPanel() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      setCustomers(await fetchCustomers());
    } catch (err) {
      console.error(err);
      toast.error('خطا در دریافت لیست مشتریان');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = customers.filter((c) => {
    if (verifiedOnly && !c.phone_verified_at) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو بر اساس نام یا موبایل..."
          className="glass rounded-xl px-4 py-2 text-sm bg-transparent outline-none flex-1 min-w-[200px]"
        />
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
          فقط تاییدشده‌ها
        </label>
        <button
          onClick={() => downloadFile('originaly-customers.csv', customersToCSV(filtered), 'text/csv;charset=utf-8')}
          className="btn-gold rounded-full px-5 py-2 text-xs"
        >
          خروجی CSV (بازاریابی / مالیات)
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground leading-6">
        این بخش شامل اطلاعات شخصی (شماره موبایل، آدرس) است — فقط برای استفادهٔ داخلی مدیر فروشگاه (کمپین پیامکی، پیگیری سفارش، گزارش به دارایی) و نباید در دسترس عمومی قرار گیرد.
      </p>

      {loading ? (
        <p className="text-center text-muted-foreground py-10">در حال بارگذاری...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">مشتری‌ای یافت نشد.</p>
      ) : (
        <table className="w-full text-sm glass rounded-2xl overflow-hidden">
          <thead className="bg-white/5 text-xs text-muted-foreground">
            <tr>
              <th className="p-4 text-right">نام</th>
              <th className="p-4 text-right">موبایل</th>
              <th className="p-4 text-right">وضعیت تایید</th>
              <th className="p-4 text-right">تعداد سفارش</th>
              <th className="p-4 text-right">مجموع خرید</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="p-4">{c.name || '—'}</td>
                <td className="p-4" dir="ltr">{faDigits(c.phone)}</td>
                <td className="p-4">
                  {c.phone_verified_at ? (
                    <span className="text-emerald-400 text-xs">تایید‌شده</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">تاییدنشده</span>
                  )}
                </td>
                <td className="p-4">{faDigits(c.total_orders)}</td>
                <td className="p-4">{formatToman(c.total_spent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
