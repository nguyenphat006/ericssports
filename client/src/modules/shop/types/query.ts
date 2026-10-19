import type { Category, ProductSummary } from "./catalog";

export type SortKey = "featured" | "bestseller" | "newest" | "price_asc" | "price_desc";

export type AttributeFilter =
  | { kind: "range"; min?: number; max?: number }
  | { kind: "options"; values: string[] }
  | { kind: "boolean"; value: true };

/** Điều kiện lấy danh sách sản phẩm (trang danh mục, tìm kiếm, khối lưới sản phẩm) */
export interface ProductQuery {
  categoryId?: string;
  q?: string;
  brandSlugs: string[];
  price?: { min?: number; max?: number };
  /** Theo id thuộc tính */
  attributes: Record<string, AttributeFilter>;
  inStock: boolean;
  sort: SortKey;
  /** Trang 1.. — "Xem thêm" tải trang 1..page */
  page: number;
  pageSize: number;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

/** Dữ liệu dựng bộ lọc: lựa chọn + số lượng theo kết quả hiện tại */
export type Facet =
  | { kind: "brand"; options: FacetOption[] }
  | { kind: "price"; min: number; max: number }
  | { kind: "attribute"; attributeId: string; attributeKind: "options"; options: FacetOption[] }
  | { kind: "attribute"; attributeId: string; attributeKind: "range"; min: number; max: number }
  | { kind: "attribute"; attributeId: string; attributeKind: "boolean"; count: number };

export interface ProductPage {
  items: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  facets: Facet[];
}

export interface SearchSuggestions {
  products: ProductSummary[];
  categories: (Category & { path: string })[];
}
