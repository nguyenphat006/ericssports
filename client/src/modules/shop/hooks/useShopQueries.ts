"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { locationService, pricingService } from "../services";
import type { CartLine, ShippingMethod } from "../types";

/** Danh sách tỉnh / phường: file tĩnh, không đổi trong phiên -> cache vô hạn */
export function useProvinces() {
  return useQuery({ queryKey: ["shop", "provinces"], queryFn: () => locationService.listProvinces(), staleTime: Infinity, gcTime: Infinity });
}

export function useWards(provinceCode: number | null | undefined) {
  return useQuery({
    queryKey: ["shop", "wards", provinceCode],
    queryFn: () => locationService.listWards(provinceCode!),
    enabled: !!provinceCode,
    staleTime: Infinity,
  });
}

/**
 * Định giá giỏ hàng (giá, tồn kho, phí ship) — luôn tính từ dữ liệu mới nhất, không tin giá lưu trên trình duyệt.
 * Giữ kết quả cũ khi đổi số lượng / tỉnh để giao diện không nhảy.
 */
export function useCartPricing(lines: CartLine[], ctx: { provinceCode?: number | null; method?: ShippingMethod } = {}) {
  return useQuery({
    queryKey: ["shop", "pricing", lines, ctx.provinceCode ?? null, ctx.method ?? "standard"],
    queryFn: () => pricingService.priceCart(lines, { provinceCode: ctx.provinceCode ?? undefined, method: ctx.method }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
