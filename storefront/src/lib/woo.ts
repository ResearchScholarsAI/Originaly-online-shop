import type { SeedProduct } from "./catalog";
import { categoryPathFa, findSub } from "./catalog";

export function productsToWooJSON(products: SeedProduct[]) {
  return products.map((p) => {
    const { dept, gender, sub } = findSub(p.department, p.gender, p.subcategory);
    const cats: { name: string; parent?: string }[] = [];
    if (dept) cats.push({ name: dept.nameFa });
    if (dept && gender) cats.push({ name: gender.nameFa, parent: dept.nameFa });
    if (gender && sub) cats.push({ name: sub.nameFa, parent: gender.nameFa });
    return {
      sku: p.id,
      name: p.nameFa,
      slug: p.slug,
      type: "variable",
      regular_price: String(p.compareAt ?? p.price),
      sale_price: p.compareAt ? String(p.price) : "",
      description: p.descriptionFa,
      categories: cats,
      images: [{ src: p.image }],
      attributes: [
        { name: "برند", options: [p.brand] },
        { name: "سایز", options: p.sizes.split(",") },
        { name: "جنسیت", options: [p.gender === "men" ? "مردانه" : "زنانه"] },
      ],
    };
  });
}

export function productsToCSV(products: SeedProduct[]) {
  const header = [
    "ID",
    "SKU",
    "Name",
    "Categories",
    "Regular price",
    "Sale price",
    "Images",
    "Attribute 1 name",
    "Attribute 1 value(s)",
    "Attribute 2 name",
    "Attribute 2 value(s)",
  ];
  const rows = products.map((p) => {
    const path = categoryPathFa(p.department, p.gender, p.subcategory).replace(/ \/ /g, " > ");
    return [
      p.id,
      p.id,
      csv(p.nameFa),
      csv(path),
      String(p.compareAt ?? p.price),
      p.compareAt ? String(p.price) : "",
      p.image,
      "سایز",
      csv(p.sizes.replace(/,/g, " | ")),
      "برند",
      csv(p.brand),
    ].join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

function csv(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
