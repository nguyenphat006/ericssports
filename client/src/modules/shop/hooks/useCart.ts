"use client";

import { useEffect } from "react";
import { useMounted } from "@/hooks/useMounted";
import { useCartStore } from "../stores/useCartStore";
import { useShopPrefs } from "../stores/useShopPrefs";
import type { CartLine, ShippingMethod } from "../types";
import { useCartPricing } from "./useShopQueries";

const NO_LINES: CartLine[] = [];

/**
 * Giỏ hàng đã định giá: dòng hàng (localStorage) + giá / tồn kho / phí ship mới nhất.
 * Trước khi mount trả giỏ rỗng để HTML khớp server (tránh lệch hydration — bẫy đã ghi ở rules).
 */
export function useCart(opts: { method?: ShippingMethod; provinceCode?: number | null } = {}) {
  const mounted = useMounted();
  const storedLines = useCartStore((s) => s.lines);
  const savedProvince = useShopPrefs((s) => s.provinceCode);
  const lines = mounted ? storedLines : NO_LINES;
  const provinceCode = opts.provinceCode !== undefined ? opts.provinceCode : mounted ? savedProvince : null;
  const pricing = useCartPricing(lines, { provinceCode, method: opts.method });
  return { mounted, lines, provinceCode, cart: lines.length ? pricing.data : undefined, isLoading: lines.length > 0 && !pricing.data };
}

/** Đồng bộ giỏ giữa các tab trình duyệt: tab khác sửa giỏ -> nạp lại từ localStorage */
export function useCartTabSync() {
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "es_shop_cart" || e.key === "es_shop_prefs") {
        void useCartStore.persist.rehydrate();
        void useShopPrefs.persist.rehydrate();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
}
