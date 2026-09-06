export type Category = 'همه' | 'کفش' | 'پوشاک' | 'اکسسوری';
export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: Exclude<Category, 'همه'>;
  gender: 'مردانه' | 'زنانه' | 'یونیسکس';
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  badge?: string;
  color: string;
  accent: string;
  image: string;
  gallery: string[];
  sizes: string[];
  description: string;
  details: string[];
  featured?: boolean;
  stock: number;
};

const shoeA = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85';
const shoeB = 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=85';
const shoeC = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=85';
const shoeD = 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=85';
const coat = 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85';
const tee = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85';
const bag = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85';
const cap = 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=85';

export const products: Product[] = [
  {
    id: 'ub20-orange', slug: 'adidas-ultraboost-20-orange', name: 'Ultraboost 20 Solar Orange', brand: 'adidas', category: 'کفش', gender: 'یونیسکس', price: 6890000, compareAt: 7990000,
    rating: 4.9, reviews: 28, badge: 'انتخاب ویراستار', color: 'نارنجی خورشیدی', accent: '#ff7043', image: shoeA, gallery: [shoeA, shoeC, shoeD], sizes: ['40', '41', '42', '43', '44'],
    description: 'یک رانر نمادین با انرژی بازگشت بالا، رویهٔ تنفس‌پذیر و حس سبک برای حرکت شهری و تمرین روزانه.', details: ['رویهٔ Primeknit تنفس‌پذیر', 'کفی Boost برای بازگشت انرژی', 'ساختار پاشنهٔ تقویت‌شده', 'مناسب استفادهٔ روزانه و دویدن'], featured: true, stock: 8,
  },
  {
    id: 'new-balance-680', slug: 'new-balance-680-v8', name: 'Fresh Foam 680 v8', brand: 'new balance', category: 'کفش', gender: 'مردانه', price: 5740000, compareAt: 6290000,
    rating: 4.8, reviews: 19, badge: 'پرفروش', color: 'خاکستری مه‌آلود', accent: '#99a3b4', image: shoeB, gallery: [shoeB, shoeD], sizes: ['41', '42', '43', '44', '45'],
    description: 'تعادل دقیق بین نرمی و ثبات برای روزهایی که از صبح تا شب در حرکتید.', details: ['Fresh Foam نرم و پاسخ‌گو', 'زیرهٔ مقاوم در برابر سایش', 'وزن سبک شهری', 'بسته‌بندی اورجینال'], featured: true, stock: 12,
  },
  {
    id: 'nike-air-max-dn', slug: 'nike-air-max-dn-black', name: 'Air Max Dn Black Volt', brand: 'nike', category: 'کفش', gender: 'زنانه', price: 8290000,
    rating: 4.7, reviews: 14, badge: 'دراپ جدید', color: 'مشکی ولت', accent: '#c4ff2c', image: shoeC, gallery: [shoeC, shoeA], sizes: ['37', '38', '39', '40', '41'],
    description: 'سیلوئت آینده‌نگر و کفی پویا برای استایل خیابانی که قرار نیست شبیه بقیه باشد.', details: ['Air cushioning تمام‌قد', 'رویهٔ مشبک چندلایه', 'کفی داخلی قابل تعویض', 'اصالت‌سنجی پیش از ارسال'], featured: true, stock: 5,
  },
  {
    id: 'salomon-xt6', slug: 'salomon-xt6-ghost', name: 'XT-6 Ghost Grey', brand: 'salomon', category: 'کفش', gender: 'یونیسکس', price: 9180000,
    rating: 4.9, reviews: 11, badge: 'کالکشن محدود', color: 'گوست گری', accent: '#bfc5cc', image: shoeD, gallery: [shoeD, shoeB], sizes: ['40', '41', '42', '43', '44'],
    description: 'تکنیکال، مقاوم و آمادهٔ فرار از مسیرهای تکراری؛ برای استایل شهری با روحیهٔ ماجراجو.', details: ['سیستم Quicklace', 'زیرهٔ Contagrip', 'محافظ پنجهٔ مقاوم', 'تولید محدود فصل'], featured: true, stock: 3,
  },
  {
    id: 'north-face-nuptse', slug: 'the-north-face-nuptse-1996', name: '1996 Retro Nuptse', brand: 'the north face', category: 'پوشاک', gender: 'یونیسکس', price: 11900000, compareAt: 13400000,
    rating: 4.8, reviews: 22, badge: 'اورجینال', color: 'مشکی مات', accent: '#7d8ba1', image: coat, gallery: [coat], sizes: ['S', 'M', 'L', 'XL'],
    description: 'یک آیکون زمستانی با حجم درست، عایق سبک و فرم ماندگار که هر سال دوباره برمی‌گردد.', details: ['پرکنندهٔ عایق سبک', 'پوشش مقاوم در برابر رطوبت', 'جیب‌های زیپ‌دار', 'لیبل و بسته‌بندی اصلی'], stock: 7,
  },
  {
    id: 'nike-tech-tee', slug: 'nike-tech-tee-stone', name: 'Tech Essential Tee Stone', brand: 'nike', category: 'پوشاک', gender: 'مردانه', price: 1890000,
    rating: 4.6, reviews: 9, color: 'استون', accent: '#d4c6af', image: tee, gallery: [tee], sizes: ['S', 'M', 'L', 'XL'],
    description: 'تی‌شرتی مینیمال برای ساختن استایل روزانه؛ پارچهٔ نرم با ایستایی تمیز.', details: ['پنبهٔ نرم شانه‌خورده', 'دوخت تقویت‌شده', 'فرم relaxed', 'شست‌وشوی آسان'], stock: 16,
  },
  {
    id: 'herschel-retreat', slug: 'herschel-retreat-backpack', name: 'Retreat Backpack Dark', brand: 'herschel', category: 'اکسسوری', gender: 'یونیسکس', price: 3270000,
    rating: 4.7, reviews: 16, badge: 'روزمره', color: 'دارک اولیو', accent: '#9aa878', image: bag, gallery: [bag], sizes: ['ONE SIZE'],
    description: 'یک همراه روزانهٔ خوش‌ساخت برای لپ‌تاپ، باشگاه و تمام مسیرهای بعدی.', details: ['محفظهٔ لپ‌تاپ ۱۵ اینچ', 'بندهای پددار', 'پارچهٔ مقاوم', 'ظرفیت ۱۹.۵ لیتر'], stock: 9,
  },
  {
    id: 'new-era-cap', slug: 'new-era-59fifty-cap', name: '59FIFTY NY Monochrome', brand: 'new era', category: 'اکسسوری', gender: 'یونیسکس', price: 2140000,
    rating: 4.8, reviews: 7, color: 'مشکی/سفید', accent: '#d8d7d2', image: cap, gallery: [cap], sizes: ['7', '7 1/8', '7 1/4', '7 3/8'],
    description: 'کلاه فیت‌شدهٔ نمادین برای آخرین لایهٔ استایل؛ دقیق، تمیز و همیشه قابل اتکا.', details: ['فرم 59FIFTY', 'گلدوزی سه‌بعدی', 'لبهٔ صاف', 'سایزبندی دقیق'], stock: 6,
  },
];

export const categories: { label: Category; hint: string; icon: string }[] = [
  { label: 'همه', hint: 'ویراست کامل', icon: '✦' },
  { label: 'کفش', hint: 'حرکت بعدی', icon: '◒' },
  { label: 'پوشاک', hint: 'لایهٔ اصلی', icon: '◐' },
  { label: 'اکسسوری', hint: 'امضای نهایی', icon: '◈' },
];

export function getProduct(slug: string) { return products.find((product) => product.slug === slug); }
export function formatPrice(value: number) { return `${new Intl.NumberFormat('fa-IR').format(value)} تومان`; }
export function discountPercent(product: Product) { return product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0; }

export const editorialCards = [
  { eyebrow: '01 / CITY RUNNER', title: 'برای خیابان‌هایی که هنوز کشف نشده‌اند.', copy: 'کفش‌هایی که فقط دیده نمی‌شوند؛ مسیر حرکتت را تعریف می‌کنند.', image: shoeA, tone: 'from-[#ff7043]/70 via-[#151923]/30 to-[#090a0f]' },
  { eyebrow: '02 / COLD FORM', title: 'لایه‌های گرم، فرم‌های سرد.', copy: 'پوشاکی برای هوای سرد و ذهنی که گرم می‌ماند.', image: coat, tone: 'from-[#9aa878]/70 via-[#11151b]/30 to-[#090a0f]' },
];

export const promises = [
  { number: '01', title: 'اصالت‌سنجی دو مرحله‌ای', copy: 'هر آیتم قبل از خروج از استودیو توسط تیم Originaly بررسی می‌شود.' },
  { number: '02', title: 'ارسال در همان روز', copy: 'سفارش‌های تهران تا ساعت ۱۴، همان روز تحویل پیک می‌شوند.' },
  { number: '03', title: '۷ روز فرصت بازگشت', copy: 'اگر سایز یا حس محصول با تو جور نبود، کنار تو هستیم.' },
];
