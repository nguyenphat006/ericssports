"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartLine } from "../types";

/** Giới hạn số lượng một dòng (chặn nhập nhầm); tồn kho thật kiểm ở bước định giá */
export const MAX_LINE_QUANTITY = 99;

/** Khóa dòng: cùng biến thể + cùng tập dịch vụ thêm = một dòng */
export function lineKey(line: Pick<CartLine, "variantId" | "serviceIds">): string {
  return `${line.variantId}|${[...line.serviceIds].sort().join(",")}`;
}

interface CartState {
  lines: CartLine[];
  /** Ngăn kéo giỏ hàng (không lưu) */
  drawerOpen: boolean;
  add: (line: CartLine) => void;
  setQuantity: (key: string, quantity: number) => void;
  setServices: (key: string, serviceIds: string[]) => void;
  remove: (key: string) => CartLine | undefined;
  /** Hoàn tác xóa: đặt lại dòng vào đúng vị trí cũ */
  restore: (line: CartLine, index: number) => void;
  clear: () => void;
  openDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
}

const clamp = (n: number) => Math.max(1, Math.min(MAX_LINE_QUANTITY, Math.floor(n)));

/**
 * Giỏ hàng trên trình duyệt (khách chưa đăng nhập cũng dùng được) — chỉ lưu dòng hàng, KHÔNG lưu giá:
 * giá / tồn kho luôn tính lại khi hiển thị và khi đặt hàng (spec 5.3). GĐ4: đăng nhập thì gộp với giỏ server.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      drawerOpen: false,
      add: (line) =>
        set((s) => {
          const key = lineKey(line);
          const existing = s.lines.find((l) => lineKey(l) === key);
          return {
            lines: existing
              ? s.lines.map((l) => (l === existing ? { ...l, quantity: clamp(l.quantity + line.quantity) } : l))
              : [...s.lines, { ...line, quantity: clamp(line.quantity), serviceIds: [...line.serviceIds].sort() }],
          };
        }),
      setQuantity: (key, quantity) => set((s) => ({ lines: s.lines.map((l) => (lineKey(l) === key ? { ...l, quantity: clamp(quantity) } : l)) })),
      setServices: (key, serviceIds) =>
        set((s) => {
          const target = s.lines.find((l) => lineKey(l) === key);
          if (!target) return s;
          const updated = { ...target, serviceIds: [...serviceIds].sort() };
          const mergeInto = s.lines.find((l) => l !== target && lineKey(l) === lineKey(updated));
          // Đổi dịch vụ trùng với dòng khác -> gộp số lượng
          if (mergeInto) {
            return { lines: s.lines.filter((l) => l !== target).map((l) => (l === mergeInto ? { ...l, quantity: clamp(l.quantity + target.quantity) } : l)) };
          }
          return { lines: s.lines.map((l) => (l === target ? updated : l)) };
        }),
      remove: (key) => {
        const removed = get().lines.find((l) => lineKey(l) === key);
        set((s) => ({ lines: s.lines.filter((l) => lineKey(l) !== key) }));
        return removed;
      },
      restore: (line, index) =>
        set((s) => {
          if (s.lines.some((l) => lineKey(l) === lineKey(line))) return s;
          const lines = [...s.lines];
          lines.splice(Math.min(index, lines.length), 0, line);
          return { lines };
        }),
      clear: () => set({ lines: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      setDrawerOpen: (open) => set({ drawerOpen: open }),
    }),
    {
      name: "es_shop_cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
    },
  ),
);

/** Tổng số sản phẩm (badge header) */
export const selectItemCount = (s: CartState) => s.lines.reduce((sum, l) => sum + l.quantity, 0);
