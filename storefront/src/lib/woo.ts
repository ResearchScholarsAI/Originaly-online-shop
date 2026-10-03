import type { SeedProduct } from "./catalog.ts";
import { canPurchaseProduct, categoryPathFa, findSub } from "./catalog.ts";

function eligible(products: SeedProduct[]) {
  return products.filter(canPurchaseProduct);
}

function imageUrl(src: string, baseUrl?: string) {
  const base = baseUrl?.trim().replace(/\/+$/, "");
  if (!base || /^https?:\/\//i.test(src)) return src;
  return `${base}${src.startsWith("/") ? src : `/${src}`}`;
}

export function productsToWooJSON(products: SeedProduct[], baseUrl?: string) {
  return eligible(products).map((p) => {
    const { dept, gender, sub } = findSub(p.department, p.gender, p.subcategory);
    const categories: { name: string; parent?: string }[] = [];
    if (dept) categories.push({ name: dept.nameFa });
    if (dept && gender) categories.push({ name: gender.nameFa, parent: dept.nameFa });
    if (gender && sub) categories.push({ name: sub.nameFa, parent: gender.nameFa });
    const hasDiscount = Boolean(p.compareAt && p.compareAt > p.price);
    return {
      sku: p.id,
      name: p.nameFa,
      slug: p.slug,
      type: "simple",
      status: "draft",
      catalog_visibility: "hidden",
      regular_price: String(hasDiscount ? p.compareAt : p.price),
      sale_price: hasDiscount ? String(p.price) : "",
      description: p.descriptionFa,
      categories,
      images: [{ src: imageUrl(p.image, baseUrl) }],
      manage_stock: true,
      stock_quantity: p.stock,
      stock_status: p.stock > 0 ? "instock" : "outofstock",
      attributes: [
        { name: "برند", options: [p.brand], visible: true, variation: false },
        { name: "سایز", options: [p.sizes.trim()], visible: true, variation: false },
        {
          name: "جنسیت",
          options: [gender?.nameFa ?? (p.gender === "unisex" ? "یونیسکس" : p.gender === "men" ? "مردانه" : "زنانه")],
          visible: true,
          variation: false,
        },
      ],
    };
  });
}

export function productsToCSV(products: SeedProduct[], baseUrl?: string) {
  const header = [
    "Type",
    "SKU",
    "Name",
    "Published",
    "Regular price",
    "Sale price",
    "Categories",
    "Images",
    "In stock?",
    "Stock",
    "Attribute 1 name",
    "Attribute 1 value(s)",
    "Attribute 1 visible",
    "Attribute 1 global",
    "Attribute 2 name",
    "Attribute 2 value(s)",
    "Attribute 2 visible",
    "Attribute 2 global",
  ];
  const rows = eligible(products).map((p) => {
    const category = categoryPathFa(p.department, p.gender, p.subcategory).replace(/ \/ /g, " > ");
    const hasDiscount = Boolean(p.compareAt && p.compareAt > p.price);
    const values = [
      "simple",
      p.id,
      p.nameFa,
      "0",
      String(hasDiscount ? p.compareAt : p.price),
      hasDiscount ? String(p.price) : "",
      category,
      imageUrl(p.image, baseUrl),
      p.stock > 0 ? "1" : "0",
      String(p.stock),
      "سایز",
      p.sizes.trim(),
      "1",
      "0",
      "برند",
      p.brand,
      "1",
      "0",
    ];
    // Keep WooCommerce's CSV column positions and escape user-visible text safely.
    return values.map((value, index) => (index === 0 || index === 3 || index === 8 || index === 9 || index >= 12 && [12, 13, 16, 17].includes(index) ? value : csv(value))).join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

function csv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
