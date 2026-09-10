import fs from "node:fs";
import { SEED_PRODUCTS, categoryPathFa, findSub } from "../src/lib/catalog.ts";

const products = SEED_PRODUCTS.map((p) => {
  const { dept, gender, sub } = findSub(p.department, p.gender, p.subcategory);
  const categories: { name: string; parent?: string }[] = [];
  if (dept) categories.push({ name: dept.nameFa });
  if (dept && gender) categories.push({ name: gender.nameFa, parent: dept.nameFa });
  if (gender && sub) categories.push({ name: sub.nameFa, parent: gender.nameFa });
  return {
    sku: p.id, name: p.nameFa, slug: p.slug, type: "variable",
    regular_price: String(p.compareAt ?? p.price), sale_price: p.compareAt ? String(p.price) : "",
    description: p.descriptionFa, categories, images: [{ src: p.image }],
    attributes: [{ name: "برند", options: [p.brand] }, { name: "سایز", options: p.sizes.split(",") }, { name: "جنسیت", options: [p.gender === "men" ? "مردانه" : "زنانه"] }],
  };
});
const csv = (v: string) => /[",\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v;
const rows = products.map((p, i) => {
  const source = SEED_PRODUCTS[i];
  return [i + 1, p.sku, csv(p.name), csv(categoryPathFa(source.department, source.gender, source.subcategory).replaceAll(" / ", " > ")), p.regular_price, p.sale_price, p.images[0].src, "سایز", csv(source.sizes.replaceAll(",", " | ")), "برند", csv(source.brand)].join(",");
});
const out = "artifacts/woocommerce-export";
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(`${out}/originaly-woo.json`, JSON.stringify(products, null, 2));
fs.writeFileSync(`${out}/originaly-woo.csv`, ["ID,SKU,Name,Categories,Regular price,Sale price,Images,Attribute 1 name,Attribute 1 value(s),Attribute 2 name,Attribute 2 value(s)", ...rows].join("\n"));
console.log(`exported ${products.length} products`);
