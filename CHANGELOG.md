# CHANGELOG — Originaly v2 (this delivery)

## ⚠️ نکتهٔ صادقانه دربارهٔ آدرس Atoms.dev

آدرس `https://1574855-...app.atoms.dev/` را باز کردم، اما چون این یک اپلیکیشن React تک‌صفحه‌ای (SPA) است، ابزار دریافت صفحهٔ من فقط پوستهٔ HTML اولیه (متادیتا) را می‌بیند — محتوای واقعی صفحه توسط جاوااسکریپت در مرورگر ساخته می‌شود و من هیچ مرورگر واقعی/ابزار اسکرین‌شات برای اجرای آن جاوااسکریپت در این محیط ندارم. **بنابراین نتوانستم پیشرفت واقعی Atoms را به‌صورت بصری ببینم یا کدهای به‌روزشدهٔ آن‌ها را دریافت کنم** (آن‌ها روی هاست خودشان هستند، نه در فایلی که به من داده‌اید).

به‌جای حدس زدن، **این نسخه را مستقیماً بر پایهٔ همان فایل ZIP اصلی‌ای که خودتان اول برایم فرستادید ساختم** و کل مسترپرامپت قبلی را رویش کامل پیاده‌سازی کردم. اگر Atoms مستقل از این، پیشرفت دیگری هم روی نسخهٔ خودش داشته، آن نسخه با این یکی یکی نیست و برای ادغام نیاز به مقایسهٔ دستی دارند — نمی‌توانم چیزی را ادغام کنم که نمی‌بینمش.

## آنچه واقعاً در این نسخه پیاده‌سازی و با تایپ‌چک دقیق پروژه (بدون خطا) تایید شد

1. **دسته‌بندی تودرتو** (`src/lib/categories.ts`) — پوشاک/کفش ← مردانه/زنانه ← ده‌ها زیردسته — به‌همراه مایگریشن دیتابیس (`app/backend/migrations/001_taxonomy_customers_otp.sql`).
2. **منوی مگا با افکت سه‌بعدی** (`CategoryMegaMenu.tsx`) — تیلت واقعی روی هاور با framer-motion، نه ترفند CSS ساده.
3. **ترنزیشن صفحات** (`PageTransition.tsx` + بازنویسی `App.tsx`) با `AnimatePresence`، به‌همراه پشتیبانی کامل از `prefers-reduced-motion`.
4. **کلاس‌های حالت فعال یکپارچه** (`.active-chip`) در ناوبری دسکتاپ، موبایل، و پنل مدیریت — یک تعریف واحد، نه استایل پراکنده.
5. **تایید اجباری شماره موبایل** — کامپوننت `PhoneVerification.tsx` + دو Edge Function واقعی (`send-otp`, `verify-otp`) + جداول `customers`/`phone_verifications`/`sms_log` + قفل دکمهٔ ثبت سفارش در `Cart.tsx` تا زمان تایید. آدرس‌دهی SMS به‌صورت آداپتور طراحی شده (فعلاً فقط لاگ می‌کند)، آماده برای کاوه‌نگار/ملی‌پیامک/آی‌پی‌پنل.
6. **پنل «مشتریان» در ادمین** (`CustomersPanel` در `Admin.tsx`) با جستجو، فیلتر تاییدشده‌ها، و خروجی CSV برای بازاریابی/مالیات.
7. **آداپتور کامل زرین‌پال** (`zarinpal-request`, `zarinpal-verify` Edge Functions + `createZarinpalPaymentRequest`/`verifyZarinpalPayment` در `store.ts`) — در `Cart.tsx` تا وقتی `ZARINPAL_MERCHANT_ID` تنظیم نشود، به‌صورت «به‌زودی» غیرفعال نمایش داده می‌شود، نه دکمهٔ خراب.
8. **تم رنگی جدید** (`src/index.css`) — از طلایی ثابت به گرادیان بنفش-فیروزه‌ای پویا (جهت گزینهٔ «الف» مسترپرامپت)، با حفظ نام کلاس‌های قدیمی (`gold-text`, `btn-gold`) تا هیچ صفحه‌ای نشکند.
9. **پل ووکامرس گسترش‌یافته** (`productsToWooJSON`/`productsToCSV`) برای خروجی دسته‌بندی تودرتو + `docs/WORDPRESS_MIGRATION.md` با دو مسیر واقعی (CSV ساده / معماری Headless).

## قدم بعدی برای فعال‌سازی کامل (نیاز به اطلاعات از شما)

- یک حساب کاوه‌نگار/ملی‌پیامک/آی‌پی‌پنل بسازید و کلید API را در Secrets پروژهٔ Supabase به‌نام `SMS_PROVIDER_API_KEY` اضافه و تابع `sendViaProvider` در `send-otp/index.ts` را با API واقعی همان سرویس تکمیل کنید.
- merchant ID زرین‌پال را در Secrets با نام `ZARINPAL_MERCHANT_ID` اضافه کنید.
- فایل مایگریشن SQL را روی پروژهٔ Supabase موجودتان اجرا کنید.
- `npm install && npm run build` را یک‌بار خودتان اجرا کنید تا مطمئن شوید نصب پکیج جدید (`framer-motion`) در محیط واقعی هم بدون مشکل است — من در این محیط دسترسی اینترنت برای تست واقعی npm install نداشتم؛ تایپ‌چک کامل انجام شد اما اجرای واقعی build را باید یک‌بار خودتان تایید کنید.

## Phase 2 — Security Hardening
- Hardened OTP generation, rate limits, attempt limits, and atomic verification.
- Added `003_originaly_security_hardening.sql`.
- Added centralized admin authorization predicate.
- Prevented client-side OTP flow from reporting success when SMS delivery is not configured.
