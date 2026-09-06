// Originaly commerce taxonomy — intentionally limited to the store's real
// assortment: six product families, each available for men and women.
export type Department = 'clothing' | 'footwear';
export type Gender = 'men' | 'women';

export interface Subcategory {
  slug: string;
  fa: string;
  en: string;
  thumbnail?: string;
}

export interface GenderBranch {
  gender: Gender;
  fa: string;
  en: string;
  subcategories: Subcategory[];
}

export interface DepartmentTree {
  department: Department;
  fa: string;
  en: string;
  icon: 'shirt' | 'footprints';
  branches: GenderBranch[];
}

const PRODUCT_FAMILIES = [
  { key: 'sneakers', fa: 'کتونی', en: 'Sneakers', department: 'footwear' as Department },
  { key: 'tshirt', fa: 'تیشرت', en: 'T-Shirts', department: 'clothing' as Department },
  { key: 'socks', fa: 'جوراب', en: 'Socks', department: 'clothing' as Department },
  { key: 'cap', fa: 'کلاه', en: 'Caps', department: 'clothing' as Department },
  { key: 'jacket', fa: 'کاپشن', en: 'Jackets', department: 'clothing' as Department },
  { key: 'warmwear', fa: 'لباس گرم', en: 'Warmwear', department: 'clothing' as Department },
] as const;

export const CATEGORY_TREE: DepartmentTree[] = [
  { department: 'clothing', fa: 'پوشاک', en: 'Clothing', icon: 'shirt', branches: [
    { gender: 'men', fa: 'مردانه', en: 'Men', subcategories: PRODUCT_FAMILIES.filter((x) => x.department === 'clothing').map((x) => ({ slug: `men-${x.key}`, fa: x.fa, en: x.en })) },
    { gender: 'women', fa: 'زنانه', en: 'Women', subcategories: PRODUCT_FAMILIES.filter((x) => x.department === 'clothing').map((x) => ({ slug: `women-${x.key}`, fa: x.fa, en: x.en })) },
  ] },
  { department: 'footwear', fa: 'کفش', en: 'Footwear', icon: 'footprints', branches: [
    { gender: 'men', fa: 'مردانه', en: 'Men', subcategories: PRODUCT_FAMILIES.filter((x) => x.department === 'footwear').map((x) => ({ slug: `men-${x.key}`, fa: x.fa, en: x.en })) },
    { gender: 'women', fa: 'زنانه', en: 'Women', subcategories: PRODUCT_FAMILIES.filter((x) => x.department === 'footwear').map((x) => ({ slug: `women-${x.key}`, fa: x.fa, en: x.en })) },
  ] },
];

export function findSubcategory(slug: string): { dept: DepartmentTree; branch: GenderBranch; sub: Subcategory } | null {
  for (const dept of CATEGORY_TREE) {
    for (const branchItem of dept.branches) {
      const sub = branchItem.subcategories.find((s) => s.slug === slug);
      if (sub) return { dept, branch: branchItem, sub };
    }
  }
  return null;
}

export function departmentLabel(department: Department, lang: 'fa' | 'en' = 'fa'): string {
  const d = CATEGORY_TREE.find((x) => x.department === department);
  return d ? (lang === 'fa' ? d.fa : d.en) : department;
}

export function genderLabel(gender: Gender | 'unisex'): string {
  return gender === 'men' ? 'مردانه' : gender === 'women' ? 'زنانه' : 'زنانه و مردانه';
}

export function categoryPathLabel(product: { department?: Department; gender?: Gender | 'unisex'; subcategory_slug?: string; category?: string }): string {
  const found = product.subcategory_slug ? findSubcategory(product.subcategory_slug) : null;
  if (found) return `${found.dept.fa} / ${found.branch.fa} / ${found.sub.fa}`;
  return `${product.department ? departmentLabel(product.department) : product.category || 'محصول'} / ${genderLabel(product.gender || 'unisex')}`;
}
