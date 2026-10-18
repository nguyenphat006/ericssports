/**
 * Kiểu dữ liệu storefront. GĐ1–3 dùng dữ liệu mẫu (mocks/); GĐ4 ánh xạ từ API (api.generated.ts) về các kiểu này.
 */

/** Thông số chính hiển thị trên thẻ / cạnh giá (vd. { label: "Động cơ", value: "3.0HP" }) */
export interface ProductKeySpec {
  label: string;
  value: string;
}

export type ProductBadge = "new";

/** Sản phẩm dạng rút gọn cho lưới / thẻ sản phẩm */
export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: { src: string; alt: string };
  /** Tối đa 3 thông số chính hiển thị trên thẻ */
  keySpecs: ProductKeySpec[];
  /** Giá bán (VND) */
  price: number;
  /** Giá gốc trước giảm (VND) — có thì hiện giá gạch + nhãn % giảm */
  compareAtPrice?: number | null;
  badges?: ProductBadge[];
  /** Điểm đánh giá 0–5 */
  rating?: number | null;
  reviewCount?: number;
  soldCount?: number;
}
