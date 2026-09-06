# انتقال، راه‌اندازی و مسیر production

## تصمیم معماری

نسخهٔ حاضر بر پایهٔ قالب full-stack پروژهٔ Manus ساخته شده است: React 19، Vite، Tailwind 4، Express، tRPC، Drizzle و Manus OAuth. در این milestone، storefront با catalog محلی و local-first cart ساخته شده تا preview عمومی سریع، مستقل و قابل‌استفاده باشد. همین اسکلت، مسیر اتصال دیتابیس، auth و procedureهای server را آماده نگه می‌دارد.

## چرا این نسخه از نمونه‌های قبلی بهتر تفکیک شده است؟

پروژه‌های قبلی چند لایهٔ ارزشمند داشتند: taxonomy تو‌در‌تو، OTP، adapter زرین‌پال، پنل مشتریان، atomic checkout و تجربهٔ طراحی مستقل. این نسخه بخش‌های مناسب تجربهٔ کاربر را حفظ کرده است اما به جای کپی‌کردن ظاهر قبلی، یک visual system مستقل ساخته است. commerce حساس عمداً تا زمان اتصال Secrets و دیتابیس واقعی در سمت mock/preview باقی مانده تا مبلغ و موجودی به‌صورت نادرست در production پردازش نشود.

## چک‌لیست فروش واقعی

| حوزه | اقدام قبل از فروش عمومی | اولویت |
|---|---|---:|
| داده | ساخت schema محصولات، سفارش‌ها، order items، customers، addresses و inventory | فوری |
| امنیت | RLS، adminProcedure، اعتبارسنجی سروری total و stock | فوری |
| پرداخت | اتصال ZarinPal request/verify و callback idempotent | فوری |
| پیامک | اتصال یک provider ایرانی و rate limit برای OTP | فوری |
| تصاویر | انتقال تصاویر از Unsplash به storage/CDN متعلق به برند | فوری |
| SEO | SSR/Prerender برای product و category pages، sitemap و canonical | مهم |
| عملیات | پنل وضعیت سفارش، export، refund و audit log | مهم |
| WordPress | mapping به WooCommerce و تست import/export | پس از تثبیت فروش |

## هشدار حقوقی و عملیاتی

تصاویر فعلی برای نمایش طراحی و preview استفاده شده‌اند. قبل از شروع فروش باید تصاویر دارای مجوز یا تصاویر اختصاصی محصولات واقعی جایگزین شوند. همچنین ادعاهای «اصالت تضمین‌شده»، شرایط بازگشت، هزینهٔ ارسال و زمان تحویل باید مطابق فرایند واقعی کسب‌وکار و قوانین محلی بازبینی شوند.

## خروجی‌های قابل انتقال

- کد منبع کامل در همین پروژه
- build production در `dist/`
- فایل‌های تست در `server/`
- مستندات اصلی در `README_ORIGINALY.md`
- نسخهٔ عمومی Netlify برای مشاهده و تست UI
