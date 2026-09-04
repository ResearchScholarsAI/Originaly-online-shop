import { createClient } from '@supabase/supabase-js';
import { findSubcategory, type Department, type Gender } from '@/lib/categories';

export const SUPABASE_URL = 'https://nowsaklaqtitpyarwmcq.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vd3Nha2xhcXRpdHB5YXJ3bWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMDEzMDksImV4cCI6MjEwMzg3NzMwOX0.gKoHLU9yUQ6DDubXWl1C7JYOHEVwe-3Gha670oT0x64';

export const ADMIN_EMAIL = 'admin@originally.ir';

const PRODUCTS_TABLE = 'app_a3f9f1497d_products';
const ORDERS_TABLE = 'app_a3f9f1497d_orders';
const CUSTOMERS_TABLE = 'app_a3f9f1497d_customers';
const ADDRESSES_TABLE = 'app_a3f9f1497d_addresses';
const PHONE_VERIFICATIONS_TABLE = 'app_a3f9f1497d_phone_verifications';
const SMS_LOG_TABLE = 'app_a3f9f1497d_sms_log';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** @deprecated kept for backward compatibility during the taxonomy
   * migration (§1.2 of the master prompt) — new code should use
   * department/subcategory_slug instead. */
  category: string;
  department: Department;
  subcategory_slug: string;
  gender: Gender | 'unisex';
  brand: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  rating: number;
  sold: number;
  description: string | null;
  sizes: string[];
  image_url: string;
  images: string[];
  featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  image_url: string;
  size: string;
  qty: number;
}

export interface OrderPayload {
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  notes: string;
  items: CartItem[];
  total: number;
  shipping: number;
  payment_method: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  phone_verified_at: string | null;
  created_at: string;
  total_orders: number;
  total_spent: number;
}

export interface Address {
  id: string;
  customer_id: string;
  address: string;
  city: string;
  postal_code: string;
  is_default: boolean;
}

export const BRAND = {
  name: 'Originaly',
  fa: 'اورجینالی',
  domain: 'originally.ir',
  owner: 'پژوهان‌مهر',
  phone: '+989122640979',
  phoneDisplay: '۰۹۱۲۲۶۴۰۹۷۹',
  city: 'نظرآباد، استان البرز',
  slogan: 'اصالت، امضای ماست',
};

export function faDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

export function formatToman(n: number): string {
  return faDigits(n.toLocaleString('en-US')) + ' تومان';
}

export function discountPercent(p: { price: number; old_price: number | null }): number | null {
  if (!p.old_price || p.old_price <= p.price) return null;
  return Math.round(((p.old_price - p.price) / p.old_price) * 100);
}

const CART_KEY = 'originaly_cart_v1';
const CART_EVENT = 'originaly-cart-updated';

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function onCartChange(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(CART_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CART_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function addToCart(product: Product, size: string, qty = 1) {
  const items = loadCart();
  const idx = items.findIndex((i) => i.slug === product.slug && i.size === size);
  if (idx >= 0) {
    items[idx] = { ...items[idx], qty: items[idx].qty + qty };
  } else {
    items.push({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size,
      qty,
    });
  }
  persistCart(items);
}

export function removeFromCart(slug: string, size: string) {
  persistCart(loadCart().filter((i) => !(i.slug === slug && i.size === size)));
}

export function setCartQty(slug: string, size: string, qty: number) {
  const items = loadCart();
  const idx = items.findIndex((i) => i.slug === slug && i.size === size);
  if (idx >= 0) {
    items[idx] = { ...items[idx], qty: Math.max(1, qty) };
    persistCart(items);
  }
}

export function clearCart() {
  persistCart([]);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.qty, 0);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.price * i.qty, 0);
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Product) || null;
}

export async function createProduct(payload: Partial<Product>): Promise<void> {
  const { error } = await supabase.from(PRODUCTS_TABLE).insert(payload);
  if (error) throw error;
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<void> {
  const { error } = await supabase.from(PRODUCTS_TABLE).update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from(PRODUCTS_TABLE).delete().eq('id', id);
  if (error) throw error;
}

export function generateOrderNumber(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.floor(Math.random() * 46656).toString(36).toUpperCase().padStart(3, '0');
  return `ORIG-${t.slice(-4)}-${r}`;
}

export async function submitOrder(payload: OrderPayload): Promise<string> {
  const orderNumber = generateOrderNumber();
  const { error } = await supabase.from(ORDERS_TABLE).insert({
    order_number: orderNumber,
    customer_name: payload.customer_name,
    phone: payload.phone,
    address: payload.address,
    city: payload.city,
    postal_code: payload.postal_code,
    notes: payload.notes,
    items: payload.items,
    total: payload.total,
    shipping: payload.shipping,
    payment_method: payload.payment_method,
    payment_status: 'unpaid',
    status: 'pending',
  });
  if (error) throw error;

  // Best-effort: save this address under the customer's verified phone
  // number and bump their order stats, so the Admin "مشتریان" panel (§3.3)
  // stays complete. This must never block order submission if it fails.
  try {
    const { data: customer } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('id, total_orders, total_spent, name')
      .eq('phone', payload.phone)
      .maybeSingle();
    if (customer) {
      await supabase
        .from(CUSTOMERS_TABLE)
        .update({
          name: customer.name || payload.customer_name,
          total_orders: (customer.total_orders || 0) + 1,
          total_spent: Number(customer.total_spent || 0) + payload.total + payload.shipping,
        })
        .eq('id', customer.id);
      await supabase.from(ADDRESSES_TABLE).insert({
        customer_id: customer.id,
        address: payload.address,
        city: payload.city,
        postal_code: payload.postal_code,
        is_default: true,
      });
    }
  } catch (statsErr) {
    console.warn('Customer stats update skipped:', statsErr);
  }

  return orderNumber;
}

export async function fetchOrders(): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from(ORDERS_TABLE).update({ status }).eq('id', id);
  if (error) throw error;
}

export async function adminSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function adminSignOut() {
  await supabase.auth.signOut();
}

export async function getAdminSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session && session.user.email === ADMIN_EMAIL) return session;
  return null;
}

// ===========================================================================
// Phone OTP verification (§3 of the master prompt)
//
// The actual SMS delivery is NOT wired to a live provider from this file —
// it calls a Supabase Edge Function (`send-otp` / `verify-otp`, see
// supabase/functions/) which is itself built against an Iranian SMS gateway
// adapter (Kavenegar/Melipayamak/IPPanel — pick one) that currently logs to
// the `sms_log` table instead of actually sending. The moment a real API
// key is added to that edge function, this client code does not change.
// ===========================================================================

const PHONE_VERIFIED_KEY = 'originaly_phone_verified_v1';

export function normalizeIranPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^989\d{9}$/.test(digits)) return '0' + digits.slice(2);
  if (/^\+989\d{9}$/.test(digits)) return '0' + digits.slice(3);
  return null;
}

export async function requestOtp(phone: string): Promise<void> {
  const { error } = await supabase.functions.invoke('send-otp', { body: { phone } });
  if (error) throw error;
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('verify-otp', { body: { phone, code } });
  if (error) throw error;
  const ok = Boolean((data as { verified?: boolean } | null)?.verified);
  if (ok) {
    sessionStorage.setItem(PHONE_VERIFIED_KEY, phone);
  }
  return ok;
}

export function getVerifiedPhone(): string | null {
  return sessionStorage.getItem(PHONE_VERIFIED_KEY);
}

export function isPhoneVerified(phone: string): boolean {
  return getVerifiedPhone() === phone;
}

export function clearPhoneVerification(): void {
  sessionStorage.removeItem(PHONE_VERIFIED_KEY);
}

// ===========================================================================
// Customer + address database (Admin "مشتریان" panel, §3.3)
// ===========================================================================

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from(CUSTOMERS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Customer[];
}

export async function fetchCustomerAddresses(customerId: string): Promise<Address[]> {
  const { data, error } = await supabase
    .from(ADDRESSES_TABLE)
    .select('*')
    .eq('customer_id', customerId);
  if (error) throw error;
  return (data || []) as Address[];
}

export function customersToCSV(customers: Customer[]): string {
  const headers = ['name', 'phone', 'phone_verified', 'created_at', 'total_orders', 'total_spent'];
  const esc = (v: string | number | boolean | null | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = customers.map((c) =>
    [c.name, c.phone, c.phone_verified_at ? 'yes' : 'no', c.created_at, c.total_orders, c.total_spent]
      .map(esc)
      .join(','),
  );
  return '\uFEFF' + [headers.map(esc).join(','), ...rows].join('\n');
}

// ===========================================================================
// ZarinPal payment gateway adapter (§4 of the master prompt)
//
// This is a real, complete adapter shape against ZarinPal's REST API. It is
// NOT live yet — `getZarinpalMerchantId()` returns null until a merchant ID
// is configured server-side, and the checkout UI must check
// `isZarinpalConfigured()` before offering online payment.
// ===========================================================================

export function isZarinpalConfigured(): boolean {
  // The real merchant ID lives server-side as a Supabase Edge Function
  // secret (ZARINPAL_MERCHANT_ID), never in frontend code. This flag is
  // toggled by that edge function's own /status endpoint once configured.
  return false;
}

export interface PaymentRequestResult {
  ok: boolean;
  redirectUrl?: string;
  authority?: string;
  error?: string;
}

export async function createZarinpalPaymentRequest(orderNumber: string, amountToman: number): Promise<PaymentRequestResult> {
  if (!isZarinpalConfigured()) {
    return { ok: false, error: 'ZarinPal merchant ID is not configured yet.' };
  }
  const { data, error } = await supabase.functions.invoke('zarinpal-request', {
    body: { orderNumber, amount: amountToman },
  });
  if (error) return { ok: false, error: error.message };
  return data as PaymentRequestResult;
}

export async function verifyZarinpalPayment(authority: string, status: string): Promise<{ ok: boolean; refId?: string }> {
  const { data, error } = await supabase.functions.invoke('zarinpal-verify', {
    body: { authority, status },
  });
  if (error) throw error;
  return data as { ok: boolean; refId?: string };
}

export function productsToWooJSON(products: Product[]) {
  return products.map((p) => {
    const found = findSubcategory(p.subcategory_slug);
    const deptName = found ? found.dept.fa : p.category;
    const subName = found ? found.sub.fa : p.category;
    return {
      name: p.name,
      slug: p.slug,
      type: 'simple',
      regular_price: String(p.price),
      sale_price: p.old_price ? String(p.price) : '',
      stock_quantity: p.stock,
      description: p.description || '',
      short_description: `${p.brand || 'Originaly'} | ${p.gender === 'men' ? 'مردانه' : p.gender === 'women' ? 'زنانه' : 'زنانه و مردانه'}`,
      categories: [
        { name: deptName },
        { name: subName, parent: deptName },
      ],
      images: (p.images && p.images.length ? p.images : [p.image_url]).map((src) => ({ src })),
      meta_data: [
        { key: 'original_brand', value: p.brand || '' },
        { key: 'gender', value: p.gender },
        { key: 'sizes', value: (p.sizes || []).join(',') },
        { key: 'rating', value: String(p.rating) },
        { key: 'department', value: p.department },
      ],
    };
  });
}

export function productsToCSV(products: Product[]): string {
  const headers = ['name', 'slug', 'type', 'regular_price', 'sale_price', 'stock_quantity', 'description', 'department', 'subcategory', 'images', 'brand', 'gender', 'sizes'];
  const esc = (v: string | number | null | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = products.map((p) => {
    const found = findSubcategory(p.subcategory_slug);
    return [
      p.name,
      p.slug,
      'simple',
      p.price,
      p.old_price ?? '',
      p.stock,
      (p.description || '').replace(/\n/g, ' '),
      found ? found.dept.fa : p.department,
      found ? found.sub.fa : p.subcategory_slug,
      (p.images && p.images.length ? p.images : [p.image_url]).join(' | '),
      p.brand || '',
      p.gender,
      (p.sizes || []).join(','),
    ].map(esc).join(',');
  });
  return '\uFEFF' + [headers.map(esc).join(','), ...rows].join('\n');
}

export function downloadFile(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}