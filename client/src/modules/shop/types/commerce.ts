/** Giỏ hàng, vận chuyển, đơn hàng, khách hàng, địa giới. */

/** Dòng giỏ hàng lưu trên trình duyệt — KHÔNG lưu giá (giá luôn tính lại khi hiển thị / đặt hàng) */
export interface CartLine {
  productId: string;
  variantId: string;
  quantity: number;
  serviceIds: string[];
}

export type CartLineIssue = "unavailable" | "out_of_stock" | "insufficient_stock";

export interface PricedCartLine extends CartLine {
  productSlug: string;
  name: string;
  image: { src: string; alt: string };
  /** "Đen đỏ · X5 – 3.0HP" */
  variantLabel: string;
  sku: string;
  unitPrice: number;
  compareAtPrice?: number | null;
  services: { id: string; name: string; price: number }[];
  /** Mọi dịch vụ thêm sản phẩm này có (trang giỏ cho bật / tắt) */
  availableServices: { id: string; name: string; price: number }[];
  /** Giá dịch vụ thêm cho 1 sản phẩm */
  servicesUnitPrice: number;
  lineTotal: number;
  stock: number;
  weightKg: number;
  bulky: boolean;
  issue?: CartLineIssue;
}

export type ShippingZone = "inner" | "near" | "far";
export type ShippingMethod = "standard" | "express";

export interface ShippingQuote {
  zone: ShippingZone;
  method: ShippingMethod;
  fee: number;
  /** Số ngày giao dự kiến [nhanh nhất, chậm nhất] */
  etaDays: [number, number];
  free: boolean;
}

export interface PricedCart {
  lines: PricedCartLine[];
  itemCount: number;
  subtotal: number;
  /** null khi chưa chọn tỉnh */
  shipping: ShippingQuote | null;
  /** Các cách giao hỗ trợ cho tỉnh đã chọn */
  availableMethods: ShippingMethod[];
  total: number;
  freeShippingThreshold: number;
  /** Còn thiếu bao nhiêu để được miễn phí vận chuyển (0 = đã đạt) */
  amountToFreeShipping: number;
  hasIssues: boolean;
}

export type PaymentMethod = "cod" | "bank_transfer" | "vnpay" | "momo";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

/** Trạng thái đơn theo spec 5.4 */
export type OrderStatus =
  | "pending_payment"
  | "pending_confirmation"
  | "processing"
  | "shipping"
  | "completed"
  | "cancelled"
  | "refunded"
  | "returned";

export interface Province {
  code: number;
  name: string;
  type: string;
}

export interface Ward {
  code: number;
  name: string;
  type: string;
}

export interface Address {
  id: string;
  recipient: string;
  phone: string;
  provinceCode: number;
  provinceName: string;
  wardCode: number;
  wardName: string;
  street: string;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, "id" | "isDefault"> & { isDefault?: boolean };

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface OrderLine {
  productId: string;
  productSlug: string;
  variantId: string;
  name: string;
  variantLabel: string;
  sku: string;
  image: { src: string; alt: string };
  quantity: number;
  unitPrice: number;
  services: { id: string; name: string; price: number }[];
  lineTotal: number;
}

export interface Order {
  code: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  /** Hạn thanh toán online (đơn chờ thanh toán quá hạn sẽ bị hủy) */
  paymentDeadline?: string;
  customerId?: string;
  contact: { name: string; phone: string; email?: string };
  address: Omit<Address, "id" | "isDefault">;
  shippingMethod: ShippingMethod;
  lines: OrderLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  note?: string;
  timeline: { status: OrderStatus; at: string }[];
}

export interface CheckoutInput {
  contact: { name: string; phone: string; email?: string };
  address: Omit<Address, "id" | "isDefault">;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  note?: string;
  lines: CartLine[];
  /** Khóa chống gửi lặp (mỗi lần bấm "Đặt hàng") */
  idempotencyKey: string;
  customerId?: string;
}
