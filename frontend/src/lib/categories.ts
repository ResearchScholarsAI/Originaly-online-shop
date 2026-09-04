// Nested category taxonomy: Department -> Gender -> Subcategory.
// This is the single source of truth for navigation, the mega-menu, and
// product filtering. When adding a subcategory, add it here only — every
// UI surface (mega-menu, Shop filters, Admin product form) reads from this.

export type Department = 'clothing' | 'footwear';
export type Gender = 'men' | 'women';

export interface Subcategory {
  slug: string;
  fa: string;
  en: string;
  /** Representative thumbnail shown in the mega-menu; falls back to a
   * gradient tile if not provided (see CategoryMegaMenu). */
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

export const CATEGORY_TREE: DepartmentTree[] = [
  {
    department: 'clothing',
    fa: 'پوشاک',
    en: 'Clothing',
    icon: 'shirt',
    branches: [
      {
        gender: 'men',
        fa: 'مردانه',
        en: 'Men',
        subcategories: [
          { slug: 'men-tshirt', fa: 'تیشرت اورجینال', en: 'Original T-Shirts' },
          { slug: 'men-apparel', fa: 'لباس اورجینال', en: 'Original Apparel' },
          { slug: 'men-jacket', fa: 'کاپشن اورجینال', en: 'Original Jackets' },
          { slug: 'men-hoodie', fa: 'هودی و سویشرت', en: 'Hoodies & Sweatshirts' },
          { slug: 'men-pants', fa: 'شلوار و دنیم', en: 'Pants & Denim' },
          { slug: 'men-trend-set', fa: 'ست ترند اورجینال', en: 'Original Trend Sets' },
          { slug: 'men-accessories', fa: 'اکسسوری', en: 'Accessories' },
        ],
      },
      {
        gender: 'women',
        fa: 'زنانه',
        en: 'Women',
        subcategories: [
          { slug: 'women-tshirt', fa: 'تیشرت اورجینال', en: 'Original T-Shirts' },
          { slug: 'women-manteau', fa: 'مانتو اورجینال', en: 'Original Manteau' },
          { slug: 'women-hoodie', fa: 'هودی و سویشرت', en: 'Hoodies & Sweatshirts' },
          { slug: 'women-pants', fa: 'شلوار و دنیم', en: 'Pants & Denim' },
          { slug: 'women-trend-set', fa: 'ست ترند اورجینال', en: 'Original Trend Sets' },
          { slug: 'women-accessories', fa: 'اکسسوری', en: 'Accessories' },
        ],
      },
    ],
  },
  {
    department: 'footwear',
    fa: 'کفش',
    en: 'Footwear',
    icon: 'footprints',
    branches: [
      {
        gender: 'men',
        fa: 'مردانه',
        en: 'Men',
        subcategories: [
          { slug: 'men-sneaker', fa: 'کتانی روزمره', en: 'Everyday Sneakers' },
          { slug: 'men-sport', fa: 'اسپرت', en: 'Sport' },
          { slug: 'men-running', fa: 'کتانی دویدن', en: 'Running' },
          { slug: 'men-hiking', fa: 'کوهستانی', en: 'Hiking / Outdoor' },
          { slug: 'men-sandal', fa: 'صندل و دمپایی', en: 'Sandals' },
        ],
      },
      {
        gender: 'women',
        fa: 'زنانه',
        en: 'Women',
        subcategories: [
          { slug: 'women-sneaker', fa: 'کتانی روزمره', en: 'Everyday Sneakers' },
          { slug: 'women-sport', fa: 'اسپرت', en: 'Sport' },
          { slug: 'women-running', fa: 'کتانی دویدن', en: 'Running' },
          { slug: 'women-hiking', fa: 'کوهستانی', en: 'Hiking / Outdoor' },
          { slug: 'women-sandal', fa: 'صندل و دمپایی', en: 'Sandals' },
        ],
      },
    ],
  },
];

export function findSubcategory(slug: string): { dept: DepartmentTree; branch: GenderBranch; sub: Subcategory } | null {
  for (const dept of CATEGORY_TREE) {
    for (const branch of dept.branches) {
      const sub = branch.subcategories.find((s) => s.slug === slug);
      if (sub) return { dept, branch, sub };
    }
  }
  return null;
}

export function departmentLabel(department: Department, lang: 'fa' | 'en' = 'fa'): string {
  const d = CATEGORY_TREE.find((x) => x.department === department);
  return d ? (lang === 'fa' ? d.fa : d.en) : department;
}
