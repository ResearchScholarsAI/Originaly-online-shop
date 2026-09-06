import type { Product } from './catalog';

export type CartLine = { productId: string; size: string; quantity: number };
const CART_KEY = 'originaly-next-cart';
const WISH_KEY = 'originaly-next-wishlist';

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback)) as T; } catch { return fallback; }
}
function write<T>(key: string, value: T) { if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(value)); }

export function loadCart(): CartLine[] { return read<CartLine[]>(CART_KEY, []); }
export function saveCart(items: CartLine[]) { write(CART_KEY, items); window.dispatchEvent(new Event('originaly-cart')); }
export function loadWishlist(): string[] { return read<string[]>(WISH_KEY, []); }
export function saveWishlist(items: string[]) { write(WISH_KEY, items); window.dispatchEvent(new Event('originaly-wishlist')); }
export function addLine(items: CartLine[], product: Product, size: string) {
  const found = items.find((item) => item.productId === product.id && item.size === size);
  if (found) return items.map((item) => item === found ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item);
  return [...items, { productId: product.id, size, quantity: 1 }];
}
export function lineCount(items: CartLine[]) { return items.reduce((total, item) => total + item.quantity, 0); }
export function lineTotal(items: CartLine[], products: Product[]) { return items.reduce((total, item) => total + (products.find((p) => p.id === item.productId)?.price || 0) * item.quantity, 0); }
export function toggleWishlist(items: string[], productId: string) { return items.includes(productId) ? items.filter((id) => id !== productId) : [...items, productId]; }
