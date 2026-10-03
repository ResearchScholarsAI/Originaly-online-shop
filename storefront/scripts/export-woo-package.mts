import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canPurchaseProduct, SEED_PRODUCTS } from "../src/lib/catalog.ts";
import { productsToCSV, productsToWooJSON } from "../src/lib/woo.ts";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const out = path.join(root, "artifacts/woocommerce-export");
const publicBaseUrl = (process.env.ORIGINALY_PUBLIC_BASE_URL ?? process.env.PUBLIC_SITE_URL ?? "").trim() || undefined;
const products = SEED_PRODUCTS.filter(canPurchaseProduct);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "images"), { recursive: true });

const copied = new Set<string>();
for (const product of products) {
  const relative = product.image.replace(/^\/+/, "");
  const source = path.join(root, "public", relative);
  if (!fs.existsSync(source)) {
    console.warn(`Missing product photo: ${relative}`);
    continue;
  }
  const destination = path.join(out, "images", relative.replace(/^products\//, ""));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (!copied.has(relative)) fs.copyFileSync(source, destination);
  copied.add(relative);
}

// Include all Drop 04 photos, even those intentionally withheld from the public catalogue pending owner review.
const drop4Source = path.join(root, "public/products/drop4");
const drop4Destination = path.join(out, "images/drop4-review-only");
if (fs.existsSync(drop4Source)) {
  for (const name of fs.readdirSync(drop4Source)) {
    const source = path.join(drop4Source, name);
    if (fs.statSync(source).isFile()) {
      fs.mkdirSync(drop4Destination, { recursive: true });
      fs.copyFileSync(source, path.join(drop4Destination, name));
    }
  }
}

fs.writeFileSync(path.join(out, "originaly-woo.json"), JSON.stringify(productsToWooJSON(products, publicBaseUrl), null, 2));
fs.writeFileSync(path.join(out, "originaly-woo.csv"), `${productsToCSV(products, publicBaseUrl)}\n`);
const readme = [
  "# Originaly — WooCommerce product import",
  "",
  `- Products exported: **${products.length}** orderable, single-size products.`,
  "- WooCommerce type: `simple` (not variable); the recorded size is a visible, non-variation attribute.",
  "- Price values are in the storefront's current unit, toman. Confirm the target WooCommerce currency and unit before importing.",
  "- Out-of-stock or ambiguous products are not exported as purchasable. Drop 04 photos still under owner review are stored in `images/drop4-review-only/` and intentionally have no purchasable product rows.",
  "- Shipping, taxes, refunds, and payment methods are not configured by this data export.",
  "",
  "## Product images",
  "",
  publicBaseUrl
    ? `The export used public base URL: \`${publicBaseUrl}\`.`
    : "No public base URL was configured, so the Images column contains the app's relative asset paths.",
  "",
  "For WooCommerce's built-in CSV importer, the Images column must contain publicly reachable image URLs. After the domain/hosting is connected, either serve the images under the same paths and rerun with `ORIGINALY_PUBLIC_BASE_URL=https://your-domain.example`, or upload them into WordPress Media and replace the Images column with those media URLs. Do not import while the image paths are unresolved.",
  "",
  "## Import",
  "",
  "1. Back up the WordPress database and media library.",
  "2. Ensure currency is configured intentionally; confirm that the store's smallest currency unit matches the exported toman values.",
  "3. Make product images publicly reachable as described above.",
  "4. In WordPress, open **Products → Import**, select `originaly-woo.csv`, map the SKU, price, stock, category and attribute fields, and review the preview.",
  "5. Import a small test set first; check product URLs, images, stock, and checkout behavior before importing the rest.",
  "",
  "`originaly-woo.json` is for a WooCommerce REST API importer after credentials and public image URLs are configured; this package does not contain API secrets.",
  "",
].join("\n");
fs.writeFileSync(path.join(out, "README.md"), readme);

console.log(`Exported ${products.length} simple products and ${copied.size} linked images to ${out}`);
console.log(publicBaseUrl ? `Image base URL: ${publicBaseUrl}` : "Warning: set ORIGINALY_PUBLIC_BASE_URL after the site is publicly hosted to make CSV image links importable.");
