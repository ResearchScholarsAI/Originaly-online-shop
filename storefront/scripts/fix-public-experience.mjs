import fs from 'node:fs';
const files = new Map([
  ['src/routes/index.tsx', [['import { listProducts } from "@/lib/store";', 'import { safeListProducts } from "@/lib/store";'], ['loader: () => listProducts({ data: {} })', 'loader: () => safeListProducts({})'], ['پوشاک و کفش اورجینال با دسته‌بندی دقیق مردانه و زنانه. پژوهان‌مهر — نظرآباد البرز.', 'پوشاک و کفش اورجینال با دسته‌بندی دقیق مردانه و زنانه.']]],
  ['src/routes/lookbook.tsx', [['import { listProducts } from "@/lib/store";', 'import { safeListProducts } from "@/lib/store";'], ['loader: () => listProducts({ data: { department: "footwear" } })', 'loader: () => safeListProducts({ department: "footwear" })'], ['const products = Route.useLoaderData().slice(0, 8);', 'const loaded = Route.useLoaderData();\n  const products = (Array.isArray(loaded) ? loaded : []).slice(0, 8);']]],
  ['src/routes/wishlist.tsx', [['import { listProducts } from "@/lib/store";', 'import { safeListProducts } from "@/lib/store";'], ['loader: () => listProducts({ data: {} })', 'loader: () => safeListProducts({})'], ['const products = Route.useLoaderData();', 'const loaded = Route.useLoaderData();\n  const products = Array.isArray(loaded) ? loaded : [];']]],
  ['src/routes/shop.tsx', [['import { listProducts } from "@/lib/store";', 'import { safeListProducts } from "@/lib/store";'], ['    listProducts({\n      data: { department: deps.dept, gender: deps.gender, subcategory: deps.sub },\n    })', '    safeListProducts({ department: deps.dept, gender: deps.gender, subcategory: deps.sub })'], ['const products = Route.useLoaderData();', 'const loaded = Route.useLoaderData();\n  const products = Array.isArray(loaded) ? loaded : [];']]],
  ['src/routes/product/$slug.tsx', [['import { listProducts, getProduct } from "@/lib/store";', 'import { safeListProducts, safeGetProduct } from "@/lib/store";'], ['const p = await getProduct({ data: { slug: params.slug } });', 'const p = await safeGetProduct(params.slug);'], ['const all = await listProducts({\n      data: { department: p?.department },\n    });', 'const all = await safeListProducts({ department: p?.department });']]],
  ['src/routes/about.tsx', [['پژوهان‌مهر — نظرآباد البرز. فروشگاه انتخاب‌شدهٔ پوشاک و کفش اورجینال؛ بدون هیاهو، با تأیید واقعی.', 'فروشگاه انتخاب‌شدهٔ پوشاک و کفش اورجینال؛ بدون هیاهو، با تأیید واقعی.']]],
  ['src/routes/product/$slug.tsx', [['موجودی: {p.stock} عدد · ارسال از نظرآباد · اصالت تضمین‌شده', 'موجودی: {p.stock} عدد · ارسال سریع · اصالت تضمین‌شده'], ['ارسال از نظرآباد · ۷ روز فرصت بازگشت.', 'ارسال سریع · ۷ روز فرصت بازگشت.']]],
  ['src/components/layout/footer.tsx', [['برای کسانی که فرق بین «خوب» و «واقعاً درست» را می‌دانند. پژوهان‌مهر — نظرآباد البرز.', 'برای کسانی که فرق بین «خوب» و «واقعاً درست» را می‌دانند.'], ['            <Link to="/admin" className="text-faint hover:text-primary">ورود مدیریت</Link>\n', '']]],
  ['src/routes/__root.tsx', [['فروشگاه اورجینال پوشاک و کفش — پژوهان‌مهر، نظرآباد البرز. Authentic fashion.', 'فروشگاه اورجینال پوشاک و کفش. Authentic fashion.']]],
  ['src/components/layout/header.tsx', [['className="rounded-full p-2 hover:bg-subtle"\n              aria-label="جستجو"', 'className="grid size-10 place-items-center rounded-full border border-primary/50 bg-primary text-primary-fg shadow-[0_0_18px_rgba(196,255,44,.28)] transition hover:scale-105"\n              aria-label="جستجوی محصولات"'], ['className="glass flex items-center gap-3 rounded-2xl px-4 py-3"', 'className="glass flex items-center gap-3 rounded-2xl border-primary/40 px-4 py-3"'], ['<Search className="size-4 text-faint" />', '<Search className="size-4 text-primary" />']]],
]);
for (const [path, reps] of files) {
  let s=fs.readFileSync(path,'utf8');
  for (const [a,b] of reps) { if (!s.includes(a)) console.warn(`missing in ${path}: ${a.slice(0,60)}`); s=s.replaceAll(a,b); }
  fs.writeFileSync(path,s);
}
let store=fs.readFileSync('src/lib/store.ts','utf8');
const marker='export const getProduct = createServerFn({ method: "GET" })';
const helpers=`export async function safeListProducts(data: { department?: string; gender?: string; subcategory?: string }) {\n  try {\n    const result = await listProducts({ data });\n    if (Array.isArray(result)) return result;\n  } catch {\n    // Static previews have no server function runtime; use the canonical catalog.\n  }\n  return SEED_PRODUCTS.filter((p) => (!data.department || p.department === data.department) && (!data.gender || p.gender === data.gender) && (!data.subcategory || p.subcategory === data.subcategory));\n}\n\n`;
if(!store.includes('export async function safeListProducts')) store=store.replace(marker,helpers+marker);
const getMarker='async function requireAdmin(userId: string)';
const safeGet=`export async function safeGetProduct(slug: string) {\n  try {\n    const result = await getProduct({ data: { slug } });\n    if (result) return result;\n  } catch {\n    // Static preview fallback.\n  }\n  return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;\n}\n\n`;
if(!store.includes('export async function safeGetProduct')) store=store.replace(getMarker,safeGet+getMarker);
fs.writeFileSync('src/lib/store.ts',store);
