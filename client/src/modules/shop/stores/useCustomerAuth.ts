"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Customer } from "../types";

interface CustomerAuthState {
  customer: Customer | null;
  setCustomer: (customer: Customer) => void;
  logout: () => void;
}

/**
 * Phiên đăng nhập của KHÁCH HÀNG storefront — tách hẳn tài khoản nhân viên (useAuthStore / JWT /admin).
 * GĐ2: mock (lưu thông tin khách đã đăng nhập ở trình duyệt). GĐ4: phiên thật từ API (cookie httpOnly).
 */
export const useCustomerAuth = create<CustomerAuthState>()(
  persist(
    (set) => ({
      customer: null,
      setCustomer: (customer) => set({ customer }),
      logout: () => set({ customer: null }),
    }),
    { name: "es_shop_customer", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);
