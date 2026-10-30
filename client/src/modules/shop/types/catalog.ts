import type { RichTextDoc } from "@/modules/cms/richtext/types";

/** Ảnh dùng chung */
export interface MediaImage {
  src: string;
  alt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  description?: string;
  image?: MediaImage;
  /** Thuộc tính dùng làm bộ lọc ở trang danh mục (theo thứ tự hiển thị) */
  filterAttributeIds: string[];
  sortOrder: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
}

/**
 * Thuộc tính lọc:
 * - `range`: số (công suất, tải trọng, khối lượng) — lọc theo khoảng
 * - `options`: chọn nhiều (chất liệu, kiểu kháng lực)
 * - `boolean`: có / không (gấp gọn, bluetooth)
 */
export type AttributeKind = "range" | "options" | "boolean";

export interface Attribute {
  id: string;
  /** Tên tham số trên URL, vd. "cong-suat" */
  slug: string;
  name: string;
  kind: AttributeKind;
  unit?: string;
  options?: { value: string; label: string }[];
}

export type AttributeValue = number | string | string[] | boolean;

export type ProductBadge = "new" | "bestseller";

/** Thông số chính hiển thị trên thẻ / cạnh giá (vd. { label: "Động cơ", value: "3.0HP" }) */
export interface ProductKeySpec {
  label: string;
  value: string;
}

/** Sản phẩm dạng rút gọn cho lưới / thẻ sản phẩm / gợi ý tìm kiếm */
export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: MediaImage;
  /** Tối đa 3 thông số chính hiển thị trên thẻ */
  keySpecs: ProductKeySpec[];
  /** Giá thấp nhất trong các biến thể (VND) */
  price: number;
  /** Giá gốc tương ứng — có thì hiện giá gạch + nhãn % giảm */
  compareAtPrice?: number | null;
  badges?: ProductBadge[];
  rating?: number | null;
  reviewCount?: number;
  soldCount?: number;
  inStock?: boolean;
  /** Màu các biến thể (chấm màu trên thẻ) — suy ra từ trục "color" của biến thể */
  swatches?: { label: string; color: string }[];
  /** Có đúng 1 biến thể còn hàng -> thẻ thêm thẳng vào giỏ; null = phải chọn phân loại ở trang sản phẩm */
  quickAddVariantId?: string | null;
}

export type ProductMedia = ({ kind: "image" } & MediaImage) | { kind: "video"; youtubeId: string; title: string; poster: MediaImage };

export interface VariantAxis {
  id: string;
  name: string;
  values: { value: string; label: string; swatch?: string }[];
}

export interface Variant {
  id: string;
  sku: string;
  /** Giá trị theo từng trục: { color: "den-do", version: "x5" } */
  options: Record<string, string>;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  /** Khối lượng khi giao (kg) — tính phí vận chuyển */
  weightKg: number;
  /** Vị trí ảnh trong `media` hiển thị khi chọn biến thể */
  mediaIndex?: number;
}

export interface SpecGroup {
  name: string;
  items: { label: string; value: string }[];
}

/** Dịch vụ thêm có giá (lắp đặt, gia hạn bảo hành) — tính theo từng sản phẩm trong dòng */
export interface ProductService {
  id: string;
  name: string;
  description?: string;
  price: number;
}

export interface ProductDocument {
  name: string;
  url: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: Brand;
  primaryCategoryId: string;
  categoryIds: string[];
  shortDescription: string;
  media: ProductMedia[];
  variantAxes: VariantAxis[];
  variants: Variant[];
  /** 4 thông số chính cạnh giá (3 thông số đầu dùng cho thẻ) */
  keySpecs: ProductKeySpec[];
  specGroups: SpecGroup[];
  services: ProductService[];
  description: RichTextDoc;
  attributes: Record<string, AttributeValue>;
  documents: ProductDocument[];
  badges: ProductBadge[];
  rating: number | null;
  reviewCount: number;
  soldCount: number;
  /** Hàng cồng kềnh — phụ phí vận chuyển */
  bulky: boolean;
  relatedIds: string[];
  boughtTogetherIds: string[];
  createdAt: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
  variantLabel?: string;
  verified: boolean;
}

export interface ReviewSummary {
  average: number | null;
  count: number;
  /** Số đánh giá theo 5 → 1 sao */
  distribution: [number, number, number, number, number];
  items: Review[];
}
