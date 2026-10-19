import type { ShippingMethod, ShippingQuote, ShippingZone } from "../types";

/**
 * Bảng phí vận chuyển MẪU (spec 5.4: vùng × khoảng cân nặng + ngưỡng miễn phí + phụ phí hàng cồng kềnh).
 * GĐ5: cấu hình trong trang quản trị. Mã tỉnh theo danh mục hành chính sau 01/07/2025 (public/shop/locations).
 */
export const SHIPPING_CONFIG = {
  freeShippingThreshold: 5_000_000,
  /** Vùng được miễn phí vận chuyển khi đạt ngưỡng */
  freeZones: ["inner", "near"] as ShippingZone[],
  zones: {
    /** Hà Nội, TP. Hồ Chí Minh */
    inner: [1, 79],
    /** Tỉnh lân cận hai đầu */
    near: [19, 24, 25, 31, 33, 37, 75, 80, 82, 86, 92],
  },
  /** Phí theo tổng khối lượng (kg): bậc đầu tiên có maxKg >= khối lượng */
  rates: {
    inner: [
      { maxKg: 5, fee: 30_000 },
      { maxKg: 30, fee: 80_000 },
      { maxKg: Number.POSITIVE_INFINITY, fee: 150_000 },
    ],
    near: [
      { maxKg: 5, fee: 45_000 },
      { maxKg: 30, fee: 120_000 },
      { maxKg: Number.POSITIVE_INFINITY, fee: 250_000 },
    ],
    far: [
      { maxKg: 5, fee: 60_000 },
      { maxKg: 30, fee: 180_000 },
      { maxKg: Number.POSITIVE_INFINITY, fee: 400_000 },
    ],
  } satisfies Record<ShippingZone, { maxKg: number; fee: number }[]>,
  /** Phụ phí hàng cồng kềnh (máy chạy, giàn tạ...) — không được miễn */
  bulkySurcharge: { inner: 0, near: 150_000, far: 300_000 } satisfies Record<ShippingZone, number>,
  etaDays: { inner: [1, 2], near: [2, 4], far: [3, 7] } satisfies Record<ShippingZone, [number, number]>,
  /** Giao nhanh chỉ hỗ trợ nội thành */
  express: { zones: ["inner"] as ShippingZone[], surcharge: 50_000, etaDays: [0, 1] as [number, number] },
};

export function shippingZone(provinceCode: number): ShippingZone {
  if (SHIPPING_CONFIG.zones.inner.includes(provinceCode)) return "inner";
  if (SHIPPING_CONFIG.zones.near.includes(provinceCode)) return "near";
  return "far";
}

export function availableShippingMethods(provinceCode: number): ShippingMethod[] {
  return SHIPPING_CONFIG.express.zones.includes(shippingZone(provinceCode)) ? ["standard", "express"] : ["standard"];
}

interface QuoteInput {
  provinceCode: number;
  method?: ShippingMethod;
  weightKg: number;
  bulky: boolean;
  subtotal: number;
}

/** Báo giá vận chuyển. Cách giao không hỗ trợ ở vùng đó -> tự về "standard". */
export function quoteShipping({ provinceCode, method = "standard", weightKg, bulky, subtotal }: QuoteInput): ShippingQuote {
  const zone = shippingZone(provinceCode);
  const effectiveMethod: ShippingMethod = availableShippingMethods(provinceCode).includes(method) ? method : "standard";
  const tier = SHIPPING_CONFIG.rates[zone].find((r) => weightKg <= r.maxKg) ?? SHIPPING_CONFIG.rates[zone].at(-1)!;
  const free = SHIPPING_CONFIG.freeZones.includes(zone) && subtotal >= SHIPPING_CONFIG.freeShippingThreshold;

  let fee = free ? 0 : tier.fee;
  if (bulky) fee += SHIPPING_CONFIG.bulkySurcharge[zone];
  if (effectiveMethod === "express") fee += SHIPPING_CONFIG.express.surcharge;

  return {
    zone,
    method: effectiveMethod,
    fee,
    etaDays: effectiveMethod === "express" ? SHIPPING_CONFIG.express.etaDays : SHIPPING_CONFIG.etaDays[zone],
    free: free && fee === 0,
  };
}
