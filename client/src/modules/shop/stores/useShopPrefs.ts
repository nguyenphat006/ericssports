"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ShopPrefsState {
  /** Tỉnh khách chọn để ước tính phí ship (trang sản phẩm, giỏ hàng) — gợi ý sẵn ở bước thanh toán */
  provinceCode: number | null;
  setProvince: (code: number | null) => void;
}

/** Tùy chọn nhỏ của khách lưu trên trình duyệt (không phải dữ liệu quan trọng) */
export const useShopPrefs = create<ShopPrefsState>()(
  persist(
    (set) => ({
      provinceCode: null,
      setProvince: (provinceCode) => set({ provinceCode }),
    }),
    { name: "es_shop_prefs", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);
