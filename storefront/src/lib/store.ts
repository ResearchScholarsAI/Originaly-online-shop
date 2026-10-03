import { createHash, randomInt, randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { canPurchaseProduct, SEED_PRODUCTS, type SeedProduct } from "@/lib/catalog";
import { productsToCSV, productsToWooJSON } from "@/lib/woo";
import { resolveSmsProvider } from "@/lib/sms";

export type ProductRow = SeedProduct;

export type ProfileDTO = {
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  phone_verified_at: string | null;
  is_admin: boolean;
};

export type AddressDTO = {
  id: string;
  user_id: string;
  title: string;
  address: string;
  city: string;
  postal_code: string;
  is_default: boolean;
};

export type OrderDTO = {
  id: string;
  user_id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  customer_name: string | null;
  customer_phone: string | null;
  city: string | null;
  postal_code: string | null;
  address: string | null;
  created_at: string;
};

export type CustomerDTO = ProfileDTO & {
  total_orders: number;
  total_spent: number;
};

function str(v: unknown) {
  return v == null ? null : String(v);
}
function num(v: unknown) {
  return Number(v ?? 0);
}
function bool(v: unknown) {
  return Boolean(v);
}

function rowToProduct(r: Record<string, unknown>): SeedProduct {
  const available = r.catalog_status === "available";
  return {
    id: String(r.id),
    slug: String(r.slug),
    nameFa: String(r.name_fa),
    nameEn: available ? String(r.name_en) : "",
    brand: available ? String(r.brand) : "در حال بررسی",
    descriptionFa: available ? String(r.description_fa) : "این محصول از فهرست پیشین فروشگاه نگه داشته شده است. نام/مدل، برند، قیمت و سایز نیازمند بازبینی‌اند؛ فعلاً ناموجود است و سفارش نمی‌پذیرد.",
    department: r.department as SeedProduct["department"],
    gender: r.gender as SeedProduct["gender"],
    subcategory: String(r.subcategory),
    price: available ? Number(r.price) : 0,
    compareAt: !available || r.compare_at == null ? undefined : Number(r.compare_at),
    image: String(r.image),
    sizes: available ? String(r.sizes) : "در حال بررسی",
    stock: available ? Number(r.stock) : 0,
    catalogStatus: available ? "available" : "under_review",
  };
}

function rowToProfile(r: Record<string, unknown>): ProfileDTO {
  return {
    user_id: String(r.user_id),
    name: str(r.name),
    email: str(r.email),
    phone: str(r.phone),
    phone_verified_at: str(r.phone_verified_at),
    is_admin: bool(r.is_admin),
  };
}

function rowToAddress(r: Record<string, unknown>): AddressDTO {
  return {
    id: String(r.id),
    user_id: String(r.user_id),
    title: String(r.title ?? "منزل"),
    address: String(r.address),
    city: String(r.city),
    postal_code: String(r.postal_code ?? ""),
    is_default: bool(r.is_default),
  };
}

function rowToOrder(r: Record<string, unknown>): OrderDTO {
  return {
    id: String(r.id),
    user_id: String(r.user_id),
    status: String(r.status),
    payment_method: String(r.payment_method),
    payment_status: String(r.payment_status),
    total: num(r.total),
    customer_name: str(r.customer_name),
    customer_phone: str(r.customer_phone),
    city: str(r.city),
    postal_code: str(r.postal_code),
    address: str(r.address),
    created_at: String(r.created_at ?? ""),
  };
}

export const ensureCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  for (const p of SEED_PRODUCTS) {
    await sql`
      insert into products (id, slug, name_fa, name_en, brand, description_fa, department, gender, subcategory, price, compare_at, image, sizes, stock, catalog_status)
      values (
        ${p.id}, ${p.slug}, ${p.nameFa}, ${p.nameEn}, ${p.brand}, ${p.descriptionFa},
        ${p.department}, ${p.gender}, ${p.subcategory}, ${p.price}, ${p.compareAt ?? null},
        ${p.image}, ${p.sizes}, ${p.stock}, ${p.catalogStatus ?? "under_review"}
      )
      on conflict (id) do update set
        name_fa = excluded.name_fa, name_en = excluded.name_en, brand = excluded.brand,
        description_fa = excluded.description_fa, price = excluded.price,
        compare_at = excluded.compare_at, sizes = excluded.sizes, stock = excluded.stock,
        catalog_status = excluded.catalog_status
      where products.catalog_status = 'under_review' and excluded.catalog_status = 'available'
    `;
  }
  return { ok: true, seeded: true };
});


export const listProducts = createServerFn({ method: "GET" })
  .validator(
    z.object({
      department: z.string().optional(),
      gender: z.string().optional(),
      subcategory: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await ensureCatalog();
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select * from products
      where (${data.department ?? null}::text is null or department = ${data.department ?? null})
        and (${data.gender ?? null}::text is null or gender = ${data.gender ?? null})
        and (${data.subcategory ?? null}::text is null or subcategory = ${data.subcategory ?? null})
      order by created_at desc
    `;
    return rows.map(rowToProduct);
  });

export async function safeListProducts(data: { department?: string; gender?: string; subcategory?: string }) {
  try {
    const result = await listProducts({ data });
    if (Array.isArray(result)) return result;
  } catch {
    // Static previews have no server function runtime; use the canonical catalog.
  }
  return SEED_PRODUCTS.filter((p) => (!data.department || p.department === data.department) && (!data.gender || p.gender === data.gender) && (!data.subcategory || p.subcategory === data.subcategory));
}

export const getProduct = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    await ensureCatalog();
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`select * from products where slug = ${data.slug} limit 1`;
    const product = rows[0] ? rowToProduct(rows[0]) : null;
    return product;
  });

async function ensureProfile(userId: string, email?: string | null, name?: string | null) {
  const sql = await getSql();
  await sql`
    insert into profiles (user_id, email, name)
    values (${userId}, ${email ?? null}, ${name ?? null})
    on conflict (user_id) do update set
      email = coalesce(excluded.email, profiles.email),
      name = coalesce(excluded.name, profiles.name),
      updated_at = now()
  `;
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(context.userId);
    const rows = await sql<Record<string, unknown>>`select * from profiles where user_id = ${context.userId} limit 1`;
    return rows[0] ? rowToProfile(rows[0]) : null;
  });

export const saveProfileName = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ name: z.string().min(2).max(80) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(context.userId);
    await sql`update profiles set name = ${data.name}, updated_at = now() where user_id = ${context.userId}`;
    return { ok: true };
  });

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function genCode() {
  return String(randomInt(100000, 999999));
}

/** Adapter: log by default. Swap SMS_PROVIDER=kavenegar|bird when keys exist. */
async function sendOtpSms(phone: string, code: string) {
  const provider = resolveSmsProvider();
  const result = await provider.sendOtp(phone, code);
  const sql = await getSql();
  const id = `sms_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  await sql`
    insert into sms_log (id, phone, payload, provider, status)
    values (${id}, ${phone}, ${`OTP`}, ${result.provider}, ${result.status})
  `;
  return result;
}

export const requestOtp = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ phone: z.string().min(10).max(14) }))
  .handler(async ({ context, data }) => {
    const phone = data.phone.replace(/\s/g, "");
    if (!/^09\d{9}$/.test(phone)) throw new Error("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد");
    const sql = await getSql();
    await ensureProfile(context.userId);
    const recent = await sql<{ n: number }>`
      select count(*)::int as n from phone_verifications
      where user_id = ${context.userId} and created_at > now() - interval '60 seconds'
    `;
    if ((recent[0]?.n ?? 0) > 0) throw new Error("برای درخواست کد بعدی یک دقیقه صبر کنید");
    const daily = await sql<{ n: number }>`
      select count(*)::int as n from phone_verifications
      where user_id = ${context.userId} and created_at > now() - interval '24 hours'
    `;
    if ((daily[0]?.n ?? 0) >= 6) throw new Error("سقف روزانهٔ ارسال کد برای این حساب تکمیل شده است");
    const code = genCode();
    const id = `otp_${Date.now()}`;
    await sql`
      insert into phone_verifications (id, user_id, phone, code_hash, expires_at)
      values (${id}, ${context.userId}, ${phone}, ${hashCode(code)}, now() + interval '5 minutes')
    `;
    const sent = await sendOtpSms(phone, code);
    const live = sent.status === "sent" && sent.provider !== "log";
    if (!live) await sql`update phone_verifications set consumed = true where id = ${id}`;
    const development = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
    return {
      ok: live,
      demoCode: live || !development ? undefined : code,
      message: live
        ? "کد تأیید پیامک شد"
        : development
          ? "سرویس پیامک واقعی متصل نیست؛ این کد فقط برای آزمون محیط توسعه است"
          : "سرویس پیامک هنوز پیکربندی نشده است؛ هیچ پیامکی ارسال نشد",
    };
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ phone: z.string().regex(/^09\d{9}$/), code: z.string().regex(/^\d{6}$/) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select * from phone_verifications
      where user_id = ${context.userId} and phone = ${data.phone} and consumed = false
      order by created_at desc limit 1
    `;
    const row = rows[0];
    if (!row) throw new Error("کدی یافت نشد. دوباره ارسال کنید");
    if (Number(row.attempts ?? 0) >= 5) {
      await sql`update phone_verifications set consumed = true where id = ${String(row.id)}`;
      throw new Error("تعداد تلاش‌ها بیش از حد مجاز بود؛ کد تازه درخواست کنید");
    }
    if (new Date(String(row.expires_at)).getTime() < Date.now()) throw new Error("کد منقضی شده است");
    if (String(row.code_hash) !== hashCode(data.code)) {
      await sql`update phone_verifications set attempts = attempts + 1, consumed = (attempts >= 4) where id = ${String(row.id)}`;
      throw new Error("کد نادرست است");
    }
    await sql`update phone_verifications set consumed = true where id = ${String(row.id)}`;
    await sql`
      update profiles set phone = ${data.phone}, phone_verified_at = now(), updated_at = now()
      where user_id = ${context.userId}
    `;
    return { ok: true };
  });

export const listAddresses = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`select * from addresses where user_id = ${context.userId} order by is_default desc, created_at desc`;
    return rows.map(rowToAddress);
  });

export const saveAddress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      title: z.string().min(1),
      address: z.string().min(8),
      city: z.string().min(2),
      postalCode: z.string().min(5),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = `addr_${Date.now()}`;
    await sql`update addresses set is_default = false where user_id = ${context.userId}`;
    await sql`
      insert into addresses (id, user_id, title, address, city, postal_code, is_default)
      values (${id}, ${context.userId}, ${data.title}, ${data.address}, ${data.city}, ${data.postalCode}, true)
    `;
    return { ok: true, id };
  });

const placeSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      size: z.string().min(1).max(24),
      qty: z.number().int().min(1).max(10),
    }),
  ).min(1).max(20),
  paymentMethod: z.enum(["offline", "zarinpal"]),
  addressId: z.string(),
});

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(placeSchema)
  .handler(async ({ context, data }) => {
    if (data.paymentMethod === "zarinpal") {
      throw new Error("درگاه زرین‌پال هنوز به جریان درخواست و راستی‌آزمایی واقعی متصل نشده است");
    }
    const paymentInstructions = process.env.OFFLINE_PAYMENT_INSTRUCTIONS?.trim();
    if (!paymentInstructions) throw new Error("روش پرداخت هنوز پیکربندی نشده است؛ ثبت سفارش فعلاً ممکن نیست");
    if (new Set(data.items.map((item) => item.productId)).size !== data.items.length) {
      throw new Error("هر کالا را فقط یک‌بار با سایز ثبت‌شده به سبد اضافه کنید");
    }
    const sql = await getSql();
    return sql.transaction(async (tx) => {
      const profiles = await tx<Record<string, unknown>>`select * from profiles where user_id = ${context.userId} limit 1`;
      const profile = profiles[0];
      if (!profile?.phone_verified_at) throw new Error("برای ثبت سفارش باید شمارهٔ موبایل تأیید شود");
      const addrs = await tx<Record<string, unknown>>`
        select * from addresses where id = ${data.addressId} and user_id = ${context.userId} limit 1
      `;
      const addr = addrs[0];
      if (!addr) throw new Error("آدرس نامعتبر است");

      const verifiedItems: { product: SeedProduct; qty: number; size: string }[] = [];
      let total = 0;
      for (const item of data.items) {
        const rows = await tx<Record<string, unknown>>`
          select * from products where id = ${item.productId} limit 1 for update
        `;
        if (!rows[0]) throw new Error("یکی از کالاهای سبد دیگر در فهرست نیست");
        const product = rowToProduct(rows[0]);
        if (!canPurchaseProduct(product)) {
          throw new Error(`«${product.nameFa}» هنوز برای خرید تأیید نشده یا موجود نیست`);
        }
        if (product.sizes.trim() !== item.size) {
          throw new Error(`سایز ثبت‌شدهٔ «${product.nameFa}» تغییر کرده؛ سبد را به‌روزرسانی کنید`);
        }
        if (product.stock < item.qty) throw new Error(`موجودی «${product.nameFa}» برای این تعداد کافی نیست`);
        verifiedItems.push({ product, qty: item.qty, size: product.sizes.trim() });
        total += product.price * item.qty;
      }

      const id = `ord_${randomUUID()}`;
      await tx`
        insert into orders (id, user_id, status, payment_method, payment_status, total, customer_name, customer_phone, city, postal_code, address)
        values (
          ${id}, ${context.userId}, ${"pending"}, ${"offline"}, ${"pending_offline"}, ${total},
          ${String(profile.name ?? "")}, ${String(profile.phone ?? "")},
          ${String(addr.city)}, ${String(addr.postal_code)}, ${String(addr.address)}
        )
      `;
      for (const item of verifiedItems) {
        const changed = await tx<Record<string, unknown>>`
          update products set stock = stock - ${item.qty}
          where id = ${item.product.id} and stock >= ${item.qty}
          returning id
        `;
        if (!changed.length) throw new Error(`موجودی «${item.product.nameFa}» هم‌زمان تغییر کرد؛ دوباره بررسی کنید`);
        const itemId = `oi_${randomUUID()}`;
        await tx`
          insert into order_items (id, order_id, product_id, name_fa, size, qty, price)
          values (${itemId}, ${id}, ${item.product.id}, ${item.product.nameFa}, ${item.size}, ${item.qty}, ${item.product.price})
        `;
      }
      return { ok: true, orderId: id, total, paymentInstructions };
    });
  });

export const myOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`select * from orders where user_id = ${context.userId} order by created_at desc`;
    return rows.map(rowToOrder);
  });

export async function safeGetProduct(slug: string) {
  try {
    const result = await getProduct({ data: { slug } });
    if (result) return result;
  } catch {
    // Static preview fallback.
  }
  return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

async function requireAdmin(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ is_admin: boolean }>`select is_admin from profiles where user_id = ${userId} limit 1`;
  if (!rows[0]?.is_admin) throw new Error("دسترسی مدیریت ندارید");
}

export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const allowedEmails = new Set(
      (process.env.HQ_ADMIN_EMAILS ?? "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    );
    if (allowedEmails.size === 0) {
      throw new Error("راه‌اندازی مدیر اولیه در محیط سرور پیکربندی نشده است");
    }
    const sql = await getSql();
    await ensureProfile(context.userId);
    return sql.transaction(async (tx) => {
      // Serialize simultaneous first-admin claims; only one approved account can win.
      await tx`select pg_advisory_xact_lock(hashtextextended('originaly:initial-admin', 0))`;
      const profiles = await tx<{ email: string | null }>`
        select email from profiles where user_id = ${context.userId} limit 1
      `;
      const email = (profiles[0]?.email ?? "").trim().toLowerCase();
      if (!email || !allowedEmails.has(email)) {
        throw new Error("ایمیل این حساب در allowlist مدیران اولیه نیست");
      }
      const admins = await tx<{ n: number }>`
        select count(*)::int as n from profiles where is_admin = true
      `;
      if ((admins[0]?.n ?? 0) > 0) throw new Error("مدیر از قبل تعیین شده است");
      const updated = await tx<{ user_id: string }>`
        update profiles set is_admin = true where user_id = ${context.userId} and is_admin = false
        returning user_id
      `;
      if (updated.length === 0) throw new Error("حساب مدیر قابل ارتقا نیست");
      return { ok: true };
    });
  });

export const adminCustomers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const people = await sql<Record<string, unknown>>`
      select p.*,
        coalesce((select count(*) from orders o where o.user_id = p.user_id), 0)::int as total_orders,
        coalesce((select sum(total) from orders o where o.user_id = p.user_id), 0)::int as total_spent
      from profiles p
      order by p.created_at desc
    `;
    const addrs = await sql<Record<string, unknown>>`select * from addresses`;
    return {
      people: people.map((p) => ({
        ...rowToProfile(p),
        total_orders: num(p.total_orders),
        total_spent: num(p.total_spent),
      })),
      addrs: addrs.map(rowToAddress),
    };
  });

export const adminOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`select * from orders order by created_at desc`;
    return rows.map(rowToOrder);
  });

export const exportCustomersCsv = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select p.name, p.phone, p.phone_verified_at, p.email,
        a.city, a.postal_code, a.address,
        coalesce((select count(*) from orders o where o.user_id = p.user_id), 0)::int as total_orders,
        coalesce((select sum(total) from orders o where o.user_id = p.user_id), 0)::int as total_spent,
        (select string_agg(created_at::text, ' | ') from orders o where o.user_id = p.user_id) as order_dates
      from profiles p
      left join addresses a on a.user_id = p.user_id and a.is_default = true
      order by p.created_at desc
    `;
    const header = "name,verified_phone,city,postal_code,address,total_orders,total_spent,order_dates,email";
    const lines = rows.map((r) =>
      [
        r.name ?? "",
        r.phone ?? "",
        r.city ?? "",
        r.postal_code ?? "",
        String(r.address ?? "").replace(/,/g, " "),
        r.total_orders ?? 0,
        r.total_spent ?? 0,
        r.order_dates ?? "",
        r.email ?? "",
      ].join(","),
    );
    return `${header}\n${lines.join("\n")}`;
  });

export const exportWoo = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    await ensureCatalog();
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`select * from products`;
    const products = rows.map(rowToProduct).filter(canPurchaseProduct);
    const publicBaseUrl = process.env.PUBLIC_SITE_URL?.trim() || undefined;
    return {
      json: JSON.stringify(productsToWooJSON(products, publicBaseUrl), null, 2),
      csv: productsToCSV(products, publicBaseUrl),
    };
  });

export const zarinpalReady = createServerFn({ method: "GET" }).handler(async () => {
  return {
    ready: false,
    offlineReady: Boolean(process.env.OFFLINE_PAYMENT_INSTRUCTIONS?.trim()),
    offlineInstructions: process.env.OFFLINE_PAYMENT_INSTRUCTIONS?.trim() ?? null,
  };
});
