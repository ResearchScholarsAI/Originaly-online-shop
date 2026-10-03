import assert from "node:assert/strict";
import test from "node:test";
import { canPurchaseProduct, isSingleSizeProduct, SEED_PRODUCTS } from "../src/lib/catalog.ts";
import { productsToCSV, productsToWooJSON } from "../src/lib/woo.ts";

const sellable = SEED_PRODUCTS.filter(canPurchaseProduct);
const review = SEED_PRODUCTS.filter((product) => product.catalogStatus === "under_review");

test("legacy products remain in the catalogue but are all zero-stock and unpriced for shoppers", () => {
  assert.equal(review.length, 43);
  assert.ok(review.every((product) => product.stock === 0 && product.price === 0));
  assert.ok(review.every((product) => product.descriptionFa.includes("در حال بازبینی")));
  assert.ok(review.every((product) => !canPurchaseProduct(product)));
});

test("only 29 positively priced, single-size, in-stock approved products are purchasable", () => {
  assert.equal(sellable.length, 29);
  assert.ok(sellable.every((product) => isSingleSizeProduct(product)));
  assert.ok(sellable.every((product) => product.price > 0 && product.stock > 0));
  assert.ok(sellable.every((product) => product.catalogStatus === "available"));
});

test("WooCommerce export excludes every review product and creates simple drafts", () => {
  const exported = productsToWooJSON(SEED_PRODUCTS);
  assert.equal(exported.length, sellable.length);
  assert.ok(exported.every((product) => product.type === "simple"));
  assert.ok(exported.every((product) => product.status === "draft" && product.catalog_visibility === "hidden"));
  assert.ok(exported.every((product) => product.attributes.find((attribute) => attribute.name === "سایز")?.options.length === 1));
  assert.ok(exported.every((product) => product.manage_stock && product.stock_quantity > 0));
});

test("public image base URL is applied without changing product paths", () => {
  const exported = productsToWooJSON(SEED_PRODUCTS, "https://shop.example/");
  assert.ok(exported.every((product) => product.images[0]?.src.startsWith("https://shop.example/products/")));
});

test("CSV declares only confirmed purchasable products and fixed size attributes", () => {
  const csv = productsToCSV(SEED_PRODUCTS, "https://shop.example");
  const rows = csv.split("\n");
  assert.match(rows[0] ?? "", /Type,SKU,Name,Published/);
  assert.equal(rows.slice(1).length, sellable.length);
  assert.ok(rows.slice(1).every((row) => row.startsWith("simple,")));
  assert.ok(rows.slice(1).every((row) => row.split(",")[3] === "0"));
  assert.ok(!csv.includes(",variable,"));
  assert.ok(!csv.includes("https://shop.example//products/"));
});
