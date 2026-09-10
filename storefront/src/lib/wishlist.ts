import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishState = {
  ids: string[];
  toggle: (id: string) => boolean;
  has: (id: string) => boolean;
};

export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (id) => get().ids.includes(id),
      toggle: (id) => {
        const on = get().ids.includes(id);
        set({ ids: on ? get().ids.filter((x) => x !== id) : [...get().ids, id] });
        return !on;
      },
    }),
    { name: "originaly-wish" },
  ),
);
