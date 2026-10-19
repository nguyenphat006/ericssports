import { priceCart } from "../../lib/pricing";
import { normalizePhone } from "../../lib/validation";
import type { Order, OrderLine, OrderStatus } from "../../types";
import { ShopServiceError, type MockPaymentResult, type OrderService } from "../types";
import { findMockProduct } from "./catalog";
import { delay, readStore, writeStore } from "./storage";

/** Hạn thanh toán online (spec 5.4: quá hạn -> hủy đơn, trả tồn kho) */
export const PAYMENT_WINDOW_MINUTES = 15;

const ORDERS_KEY = "orders";
/** Mã đơn đặt trên trình duyệt này -> xem lại không cần SĐT */
const MINE_KEY = "my_order_codes";
const IDEMPOTENCY_KEY = "order_idempotency";

type OrderMap = Record<string, Order>;

function loadOrders(): OrderMap {
  return readStore<OrderMap>(ORDERS_KEY, {});
}

function saveOrder(order: Order) {
  writeStore(ORDERS_KEY, { ...loadOrders(), [order.code]: order });
}

function now(): string {
  return new Date().toISOString();
}

function newCode(): string {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `ES${ymd}${Math.floor(1000 + Math.random() * 9000)}`;
}

function withStatus(order: Order, status: OrderStatus): Order {
  return { ...order, status, timeline: [...order.timeline, { status, at: now() }] };
}

/** Đơn chờ thanh toán quá hạn -> hủy (mô phỏng tác vụ Celery ở GĐ6) */
function expireIfNeeded(order: Order): Order {
  if (order.status === "pending_payment" && order.paymentDeadline && Date.parse(order.paymentDeadline) < Date.now()) {
    const cancelled = withStatus(order, "cancelled");
    saveOrder(cancelled);
    return cancelled;
  }
  return order;
}

export const mockOrderService: OrderService = {
  async placeOrder(input) {
    await delay(600);
    const idem = readStore<Record<string, string>>(IDEMPOTENCY_KEY, {});
    const existing = idem[input.idempotencyKey] ? loadOrders()[idem[input.idempotencyKey]] : undefined;
    if (existing) return existing;

    const cart = priceCart(input.lines, findMockProduct, { provinceCode: input.address.provinceCode, method: input.shippingMethod });
    if (cart.hasIssues || cart.lines.length === 0 || !cart.shipping) throw new ShopServiceError("cart_changed", "cart_changed", cart);

    const online = input.paymentMethod === "vnpay" || input.paymentMethod === "momo";
    const createdAt = now();
    const status: OrderStatus = online ? "pending_payment" : "pending_confirmation";
    const lines: OrderLine[] = cart.lines.map((l) => ({
      productId: l.productId,
      productSlug: l.productSlug,
      variantId: l.variantId,
      name: l.name,
      variantLabel: l.variantLabel,
      sku: l.sku,
      image: l.image,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      services: l.services,
      lineTotal: l.lineTotal,
    }));
    const order: Order = {
      code: newCode(),
      createdAt,
      status,
      paymentMethod: input.paymentMethod,
      paymentStatus: "unpaid",
      ...(online && { paymentDeadline: new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60_000).toISOString() }),
      ...(input.customerId && { customerId: input.customerId }),
      contact: { ...input.contact, phone: normalizePhone(input.contact.phone) },
      address: { ...input.address, phone: normalizePhone(input.address.phone) },
      shippingMethod: cart.shipping.method,
      lines,
      subtotal: cart.subtotal,
      shippingFee: cart.shipping.fee,
      total: cart.total,
      ...(input.note && { note: input.note }),
      timeline: [{ status, at: createdAt }],
    };
    saveOrder(order);
    writeStore(IDEMPOTENCY_KEY, { ...idem, [input.idempotencyKey]: order.code });
    writeStore(MINE_KEY, [...new Set([order.code, ...readStore<string[]>(MINE_KEY, [])])].slice(0, 50));
    return order;
  },

  async getOrder(code, opts = {}) {
    await delay();
    const order = loadOrders()[code.trim().toUpperCase()];
    if (!order) throw new ShopServiceError("not_found");
    const mine = readStore<string[]>(MINE_KEY, []).includes(order.code);
    const ownedByCustomer = !!opts.customerId && order.customerId === opts.customerId;
    const phoneMatches = !!opts.phone && normalizePhone(opts.phone) === order.contact.phone;
    // Không tiết lộ đơn có tồn tại hay không khi không đủ quyền xem
    if (!mine && !ownedByCustomer && !phoneMatches) throw new ShopServiceError("not_found");
    return expireIfNeeded(order);
  },

  async listCustomerOrders(customerId) {
    await delay();
    return Object.values(loadOrders())
      .filter((o) => o.customerId === customerId)
      .map(expireIfNeeded)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getPaymentUrl(code) {
    const order = loadOrders()[code];
    if (!order) throw new ShopServiceError("not_found");
    if (expireIfNeeded(order).status !== "pending_payment") throw new ShopServiceError("payment_expired");
    return `/dev/cong-thanh-toan?don=${encodeURIComponent(code)}&cong=${order.paymentMethod}`;
  },

  async completeMockPayment(code, result: MockPaymentResult) {
    await delay(400);
    const order = loadOrders()[code];
    if (!order) throw new ShopServiceError("not_found");
    const current = expireIfNeeded(order);
    if (current.status !== "pending_payment") throw new ShopServiceError("payment_expired");
    const updated: Order =
      result === "success"
        ? { ...withStatus(current, "pending_confirmation"), paymentStatus: "paid" }
        : { ...current, paymentStatus: "failed" };
    saveOrder(updated);
    return updated;
  },
};
