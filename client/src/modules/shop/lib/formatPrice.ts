/**
 * Giá storefront theo định dạng Việt Nam cố định: 12990000 -> "12.990.000₫".
 * Không phụ thuộc cấu hình định dạng số của trang quản trị (useNumberFormat).
 */
const VND = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "";
  // Intl vi-VN dùng dấu chấm phân nhóm; chuẩn hóa khoảng trắng không ngắt (nếu có) cho chắc
  return `${VND.format(Math.round(value)).replace(/\s/g, "")}₫`;
}

/** Phần trăm giảm giá làm tròn: (15290000, 12990000) -> 15. Không giảm / dữ liệu sai -> null */
export function discountPercent(compareAt: number | null | undefined, price: number): number | null {
  if (!compareAt || compareAt <= price || price < 0) return null;
  const pct = Math.round(((compareAt - price) / compareAt) * 100);
  return pct > 0 ? pct : null;
}
