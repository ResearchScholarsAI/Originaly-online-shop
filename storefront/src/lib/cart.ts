import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  nameFa: string;
  image: string;
  price: number;
  size: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  flyKey: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (productId: string, size: string, qty: number) => void;
  remove: (productId: string, size: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      flyKey: 0,
      add: (item, qty = 1) => {
        const items = [...get().items];
        const i = items.findIndex((x) => x.productId === item.productId && x.size === item.size);
        if (i >= 0) items[i] = { ...items[i]!, qty: items[i]!.qty + qty };
        else items.push({ ...item, qty });
        set({ items, flyKey: get().flyKey + 1 });
      },
      setQty: (productId, size, qty) => {
        if (qty <= 0) return get().remove(productId, size);
        set({
          items: get().items.map((x) =>
            x.productId === productId && x.size === size ? { ...x, qty } : x,
          ),
        });
      },
      remove: (productId, size) =>
        set({ items: get().items.filter((x) => !(x.productId === productId && x.size === size)) }),
      clear: () => set({ items: [] }),
    }),
    { name: "originaly-cart" },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((n, i) => n + i.qty, 0);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((n, i) => n + i.qty * i.price, 0);
}
