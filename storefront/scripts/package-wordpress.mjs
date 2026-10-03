import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { canPurchaseProduct, LEGACY_PRODUCTS, SEED_PRODUCTS } from "../src/lib/catalog.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifacts = path.join(root, "artifacts/wordpress");
const stage = path.join(artifacts, ".staging");
fs.rmSync(artifacts, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });

const themeSource = path.join(root, "wordpress/originaly-theme");
const pluginSource = path.join(root, "wordpress/originaly-catalog-importer");
const themeStage = path.join(stage, "originaly-theme");
const pluginStage = path.join(stage, "originaly-catalog-importer");
fs.cpSync(themeSource, themeStage, { recursive: true });
fs.cpSync(pluginSource, pluginStage, { recursive: true });
fs.mkdirSync(path.join(pluginStage, "assets/images"), { recursive: true });

const products = SEED_PRODUCTS.filter(canPurchaseProduct);
const reviewProducts = SEED_PRODUCTS.filter((product) => product.catalogStatus === "under_review");
const legacyById = new Map(LEGACY_PRODUCTS.map((product) => [product.id, product]));
const allProducts = [...products, ...reviewProducts];
const entries = allProducts.map((product) => {
  const underReview = product.catalogStatus === "under_review";
  const source = underReview ? legacyById.get(product.id) : undefined;
  const sourceRelative = product.image.replace(/^\/+/, "");
  const imageSource = path.join(root, "public", sourceRelative);
  if (!fs.existsSync(imageSource)) throw new Error(`Missing image for ${product.id}: ${imageSource}`);
  const extension = path.extname(imageSource).toLowerCase() || ".jpg";
  const imageName = `${product.id}${extension}`;
  fs.copyFileSync(imageSource, path.join(pluginStage, "assets/images", imageName));
  return {
    sku: product.id,
    slug: product.slug,
    name_fa: product.nameFa,
    name_en: underReview ? "" : product.nameEn,
    brand: underReview ? "اطلاعات در حال بررسی" : product.brand,
    department: product.department,
    subcategory: product.subcategory,
    description_fa: underReview
      ? "از کاتالوگ قبلی فروشگاه نگه‌داری شده است. مدل، برند، قیمت و سایز در حال بازبینی‌اند؛ فعلاً ناموجود است و سفارش نمی‌پذیرد."
      : product.descriptionFa,
    catalog_status: underReview ? "under_review" : "available",
    price_toman: underReview ? null : product.price,
    size: underReview ? "در حال بررسی" : product.sizes.trim(),
    stock: underReview ? 0 : product.stock,
    image: `assets/images/${imageName}`,
    recorded_old_price_toman: source?.price ?? null,
    recorded_old_size: source?.sizes ?? "",
    recorded_old_brand: source?.brand ?? "",
    source_note: underReview ? "مقادیر قدیمی فقط برای بازبینی مالک‌اند؛ قیمت/سایز فعال نیست." : "قیمت و تک‌سایز از دادهٔ بررسی‌شدهٔ محصول.",
  };
});
fs.writeFileSync(path.join(pluginStage, "catalog.json"), `${JSON.stringify(entries, null, 2)}\n`);

const zipDir = (directory, output) => {
  fs.rmSync(output, { force: true });
  execFileSync("zip", ["-q", "-r", output, path.basename(directory)], { cwd: path.dirname(directory) });
};
const themeZip = path.join(artifacts, "originaly-theme.zip");
const pluginZip = path.join(artifacts, "originaly-catalog-importer.zip");
zipDir(themeStage, themeZip);
zipDir(pluginStage, pluginZip);

const exportsRoot = path.join(artifacts, "woocommerce-product-data");
fs.mkdirSync(exportsRoot, { recursive: true });
const reviewRows = allProducts.map((product) => {
  const underReview = product.catalogStatus === "under_review";
  const source = underReview ? legacyById.get(product.id) : undefined;
  return {
    sku: product.id,
    name: product.nameFa,
    catalog_status: underReview ? "در حال بازبینی — ناموجود" : "تأییدشده — موجود",
    brand: underReview ? "در حال بررسی" : product.brand,
    department: product.department,
    category_path_fa: product.department === "footwear" ? "کفش" : "پوشاک",
    current_price_toman: underReview ? "" : product.price,
    recorded_old_price_toman: source?.price ?? "",
    confirmed_size: underReview ? "" : product.sizes.trim(),
    recorded_old_size_unverified: source?.sizes ?? "",
    stock: underReview ? 0 : product.stock,
    image: product.image,
  };
});
fs.writeFileSync(path.join(exportsRoot, "originaly-products-toman.json"), `${JSON.stringify(reviewRows, null, 2)}\n`);
const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const reviewCsv = [
  ["SKU", "Name (fa)", "Status", "Brand", "Department", "Category", "Confirmed size", "Recorded old size (UNVERIFIED)", "Current price (toman)", "Recorded old price (UNVERIFIED)", "Stock", "Image"],
  ...reviewRows.map((row) => [row.sku, row.name, row.catalog_status, row.brand, row.department, row.category_path_fa, row.confirmed_size, row.recorded_old_size_unverified, row.current_price_toman, row.recorded_old_price_toman, row.stock, row.image]),
].map((row) => row.map(csvCell).join(",")).join("\n");
fs.writeFileSync(path.join(exportsRoot, "ORIGINALY_IMPORT_REVIEW.csv"), `${reviewCsv}\n`);

const checklist = [
  "# بستهٔ راه‌اندازی WordPress — Originaly",
  "",
  "این بسته برای آماده‌سازی سایت پس از تهیهٔ هاست و نصب WordPress/WooCommerce ساخته شده است. **این اجرا روی یک سایت زنده منتشر نشده است** چون دامنه/هاست هنوز در اختیار نشست نیست.",
  "",
  "## فایل‌ها",
  "",
  "- originaly-theme.zip: قالب راست‌چین Originaly؛ منطق محصول/سبد/checkout را به WooCommerce می‌سپارد.",
  "- originaly-catalog-importer.zip: افزونهٔ ورود ۲۹ محصول تأییدشده به‌صورت Draft و نگه‌داشتن ۴۳ محصول قبلی به‌صورت منتشرشده، ناموجود و بی‌قیمت.",
  "- woocommerce-product-data/originaly-products-toman.json: فهرست بررسی؛ ارقام قدیمی با برچسب صریح UNVERIFIED فقط برای مالک هستند.",
  "- woocommerce-product-data/ORIGINALY_IMPORT_REVIEW.csv: جدول ۷۲ کالا برای مرور یک‌به‌یک.",
  "",
  "## ترتیب پیشنهادی بعد از خرید هاست",
  "",
  "1. هاست Linux سازگار با WordPress، دامنه، دیتابیس پایدار و SSL تهیه کنید.",
  "2. WordPress و افزونهٔ رسمی WooCommerce را نصب و پیکربندی کنید. از دیتابیس و فایل‌ها پشتیبان بگیرید.",
  "3. واحد پول WooCommerce/افزونهٔ تومان را تنظیم و مبلغ پیش‌نمایش را کنترل کنید. دیتای فعال فروش برحسب تومان است؛ تا روشن‌شدن این تنظیم import نکنید.",
  "4. در WooCommerce → تنظیمات → محصولات → موجودی، گزینهٔ «مخفی‌کردن محصولات ناموجود از کاتالوگ» را غیرفعال کنید تا کالاهای قدیمیِ درحال‌بازبینی واقعاً در ویترین دیده شوند.",
  "5. قالب را نصب و فعال کنید؛ سپس افزونهٔ Originaly Catalogue Importer را نصب کنید و پیش‌نمایش وضعیت/قیمت را ببینید.",
  "6. پس از تأیید واحد تومان، import را اجرا کنید: محصولات تأییدشده Draft می‌مانند تا درگاه و فروشگاه آزموده شود؛ ۴۳ محصول قبلی منتشر می‌شوند ولی قیمت ندارند، موجودی‌شان صفر و وضعیتشان ناموجود است.",
  "7. محصول‌های بازبینی را در مدیریت WooCommerce یک‌به‌یک بررسی کنید. فقط پس از تأیید نام/عکس/برند/سایز، قیمت واقعی و موجودی فیزیکی را وارد و همان محصول را موجود/منتشر کنید.",
  "8. درگاه، ارسال/پس‌کرایه، مالیات، سیاست‌های فروش، ایمیل و پیامک را مالک تنظیم و در staging آزمایش کند؛ فقط بعد از آزمون، محصولات تأییدشده را منتشر کنید.",
  "",
  "## محدودیت‌ها",
  "",
  `- کاتالوگ: ${products.length} کالای تأییدشدهٔ تک‌سایز + ${reviewProducts.length} کالای قدیمیِ قابل مشاهده اما ناموجود = ${allProducts.length} ردیف.`,
  "- برای کالاهای بازبینی، قیمت/برند/سایز قدیمی در صفحهٔ عمومی افشا یا به‌عنوان مقدار جاری عرضه نمی‌شود؛ ارقام قبلی فقط در صفحهٔ مدیریتی/CSV مشخصاً برچسب‌خورده به مالک نشان داده می‌شوند.",
  "- بستهٔ نصب زنده نیست؛ پرداخت آنلاین، زرین‌پال، OTP، مالیات، حمل/پس‌کرایه و سیاست بازگشت هنوز به سرویس مالک متصل نشده‌اند.",
  "",
].join("\n");
fs.writeFileSync(path.join(artifacts, "WORDPRESS-LAUNCH-CHECKLIST-FA.md"), checklist);
fs.copyFileSync(path.join(root, "docs/WORDPRESS_MIGRATION.md"), path.join(artifacts, "WORDPRESS-MIGRATION-GUIDE-FA.md"));

const launchKit = path.join(artifacts, "Originaly-WordPress-Launch-Kit.zip");
execFileSync("zip", ["-q", "-r", launchKit, "originaly-theme.zip", "originaly-catalog-importer.zip", "woocommerce-product-data", "WORDPRESS-LAUNCH-CHECKLIST-FA.md", "WORDPRESS-MIGRATION-GUIDE-FA.md"], { cwd: artifacts });
fs.rmSync(stage, { recursive: true, force: true });
console.log(JSON.stringify({ availableProducts: products.length, reviewProducts: reviewProducts.length, totalProducts: allProducts.length, images: entries.length, themeZip, pluginZip, launchKit }, null, 2));
