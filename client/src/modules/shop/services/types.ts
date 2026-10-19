import type {
  Address,
  AddressInput,
  Attribute,
  Brand,
  CartLine,
  Category,
  CheckoutInput,
  Customer,
  Order,
  PricedCart,
  Product,
  ProductPage,
  ProductQuery,
  ProductSummary,
  Province,
  ReviewSummary,
  SearchSuggestions,
  ShippingMethod,
  Ward,
} from "../types";

/**
 * Hợp đồng lớp dữ liệu storefront. GĐ2: cài đặt `mock/`; GĐ4: cài đặt `api/` cùng interface (component không đổi).
 * Mọi hàm async như gọi API thật.
 */

export type ShopErrorCode = "not_found" | "cart_changed" | "invalid_credentials" | "already_exists" | "forbidden" | "payment_expired";

export class ShopServiceError extends Error {
  constructor(
    public readonly code: ShopErrorCode,
    message = code,
    /** Dữ liệu kèm theo (vd. giỏ hàng đã định giá lại khi `cart_changed`) */
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ShopServiceError";
  }
}

export interface CategoryWithPath extends Category {
  /** "/danh-muc/cardio/may-chay-bo" */
  path: string;
  /** Tổ tiên từ gốc xuống (không gồm chính nó) */
  ancestors: Category[];
  children: Category[];
}

/** Điều kiện của khối "Lưới sản phẩm" (spec 6.2: lưu điều kiện, không lưu dữ liệu chụp sẵn) */
export interface ProductSelection {
  source: "category" | "bestseller" | "new" | "sale" | "manual";
  categoryId?: string;
  productIds?: string[];
  limit: number;
}

export interface CatalogService {
  listCategories(): Promise<CategoryWithPath[]>;
  getCategoryByPath(slugs: string[]): Promise<CategoryWithPath | null>;
  listBrands(): Promise<Brand[]>;
  listAttributes(ids?: string[]): Promise<Attribute[]>;
  queryProducts(query: ProductQuery): Promise<ProductPage>;
  selectProducts(selection: ProductSelection): Promise<ProductSummary[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductsByIds(ids: string[]): Promise<ProductSummary[]>;
  suggest(q: string): Promise<SearchSuggestions>;
  getReviews(productId: string): Promise<ReviewSummary>;
}

export interface PricingService {
  priceCart(lines: CartLine[], ctx?: { provinceCode?: number; method?: ShippingMethod }): Promise<PricedCart>;
}

export type MockPaymentResult = "success" | "failed" | "cancelled";

export interface OrderService {
  /** Tính lại giá; giỏ có dòng lỗi -> ShopServiceError("cart_changed", data: PricedCart) */
  placeOrder(input: CheckoutInput): Promise<Order>;
  /** Đơn được xem khi: đặt trên trình duyệt này, thuộc khách đang đăng nhập, hoặc có SĐT khớp */
  getOrder(code: string, opts?: { phone?: string; customerId?: string }): Promise<Order>;
  listCustomerOrders(customerId: string): Promise<Order[]>;
  /** Đường dẫn cổng thanh toán cho đơn chờ thanh toán (mock: cổng giả lập) */
  getPaymentUrl(code: string): Promise<string>;
  /** Mô phỏng IPN của cổng thanh toán — chỉ cài đặt mock */
  completeMockPayment?(code: string, result: MockPaymentResult): Promise<Order>;
}

export interface CustomerService {
  register(input: { name: string; identifier: string; password: string }): Promise<Customer>;
  login(identifier: string, password: string): Promise<Customer>;
  listAddresses(customerId: string): Promise<Address[]>;
  saveAddress(customerId: string, input: AddressInput, id?: string): Promise<Address>;
  deleteAddress(customerId: string, id: string): Promise<void>;
  setDefaultAddress(customerId: string, id: string): Promise<void>;
}

export interface LocationService {
  listProvinces(): Promise<Province[]>;
  listWards(provinceCode: number): Promise<Ward[]>;
}
