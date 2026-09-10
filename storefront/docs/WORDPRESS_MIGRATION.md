# مهاجرت اورجینالی به وردپرس / ووکامرس

این فروشگاه یک اپلیکیشن React است و **تم وردپرس نیست**. تبدیل یک‌کلیکی ممکن نیست. مسیر واقعی:

## ۱. خروجی کاتالوگ

از پنل مدیریت → «خروجی وردپرس» دو فایل بگیرید:

- `originaly-woo.csv` — مناسب واردکنندهٔ استاندارد ووکامرس
- `originaly-woo.json` — دسته‌های تو در تو با فیلد `categories: [{name, parent}]`

## ۲. نگاشت فیلدها

| فیلد اورجینالی | ووکامرس |
| --- | --- |
| nameFa | Product name |
| department / gender / subcategory | Categories (تو در تو: پوشاک > مردانه > تیشرت) |
| brand | Attribute: برند |
| sizes | Attribute: سایز (variable product) |
| gender | Attribute: جنسیت |
| price / compareAt | Sale price / Regular price |
| image | Product image URL (بعد از آپلود در رسانه عوض شود) |

## ۳. دامنه و هاست

۱. وردپرس + ووکامرس را روی هاست نصب کنید.
۲. CSV را از Products → Import وارد کنید.
۳. درگاه زرین‌پال ووکامرس را فعال کنید.
۴. DNS دامنه اختصاصی را روی هاست بگذارید.

تا آن زمان همین اپ با هاست Node/Vercel و دامنه اختصاصی کار می‌کند.
