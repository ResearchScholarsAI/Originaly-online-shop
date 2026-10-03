import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  nameFa: string;
  image: string;
  price: number;
  size: string;
  stock: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  flyKey: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (productId: string, size: string, qty: number, maxStock?: number) => void;
  remove: (productId: string, size: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      flyKey: 0,
      add: (item, qty = 1) => {
        if (!Number.isInteger(item.stock) || item.stock < 1 || item.price < 1 || item.size.includes(",")) return;
        const items = [...get().items];
        const i = items.findIndex((x) => x.productId === item.productId && x.size === item.size);
        if (i >= 0) {
          const current = items[i]!;
          items[i] = { ...current, ...item, qty: Math.min(current.qty + qty, item.stock) };
        } else {
          items.push({ ...item, qty: Math.min(Math.max(1, qty), item.stock) });
        }
        set({ items, flyKey: get().flyKey + 1 });
      },
      setQty: (productId, size, qty, maxStock) => {
        if (qty <= 0) return get().remove(productId, size);
        set({
          items: get().items.map((item) => {
            if (item.productId !== productId || item.size !== size) return item;
            const limit = maxStock ?? (item.stock > 0 ? item.stock : item.qty);
            return { ...item, stock: maxStock ?? item.stock, qty: Math.max(1, Math.min(qty, limit)) };
          }),
        });
      },
      remove: (productId, size) =>
        set({ items: get().items.filter((item) => !(item.productId === productId && item.size === size)) }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "originaly-cart",
      version: 2,
      migrate: (persisted) => {
        const previous = persisted as { items?: Partial<CartItem>[] } | undefined;
        const items = Array.isArray(previous?.items)
          ? previous.items
              .filter((item) => typeof item.productId === "string" && typeof item.size === "string" && !item.size.includes(","))
              .map((item) => ({ ...item, stock: Number.isInteger(item.stock) ? Number(item.stock) : 0 }))
          : [];
        return { items, flyKey: 0 } as CartState;
      },
    },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((count, item) => count + item.qty, 0);
}

/** Snapshot estimate only; checkout always recalculates from the database. */
export function cartTotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.qty * item.price, 0);
}
