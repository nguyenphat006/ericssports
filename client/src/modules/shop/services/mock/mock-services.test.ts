import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SHOP_NAVIGATION } from "../../config/navigation";
import { DEFAULT_PAGE_SIZE } from "../../lib/filters";
import { MOCK_PRODUCT_LIST } from "../../mocks/products";
import { MOCK_ATTRIBUTES, MOCK_BRANDS, MOCK_CATEGORIES } from "../../mocks/taxonomy";
import type { CheckoutInput, ProductQuery } from "../../types";
import { ShopServiceError } from "../types";
import { mockCatalogService as catalog } from "./catalog";
import { mockCustomerService as customers } from "./customers";
import { mockOrderService as orders } from "./orders";

const baseQuery = (q: Partial<ProductQuery> = {}): ProductQuery => ({
  brandSlugs: [],
  attributes: {},
  inStock: false,
  sort: "featured",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  ...q,
});

describe("dữ liệu mẫu nhất quán", () => {
  it("slug, id sản phẩm và id biến thể không trùng", () => {
    const slugs = MOCK_PRODUCT_LIST.map((p) => p.slug);
    const variantIds = MOCK_PRODUCT_LIST.flatMap((p) => p.variants.map((v) => v.id));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(MOCK_PRODUCT_LIST.map((p) => p.id)).size).toBe(MOCK_PRODUCT_LIST.length);
    expect(new Set(variantIds).size).toBe(variantIds.length);
  });

  it("mọi tham chiếu (danh mục, thương hiệu, thuộc tính, sản phẩm mua kèm) đều tồn tại", () => {
    const catIds = new Set(MOCK_CATEGORIES.map((c) => c.id));
    const attrIds = new Set(MOCK_ATTRIBUTES.map((a) => a.id));
    const productIds = new Set(MOCK_PRODUCT_LIST.map((p) => p.id));
    for (const p of MOCK_PRODUCT_LIST) {
      expect(p.categoryIds.every((id) => catIds.has(id)), p.id).toBe(true);
      expect(MOCK_BRANDS.some((b) => b.id === p.brand.id), p.id).toBe(true);
      expect(Object.keys(p.attributes).every((id) => attrIds.has(id)), p.id).toBe(true);
      expect(p.boughtTogetherIds.every((id) => productIds.has(id)), p.id).toBe(true);
      expect(p.keySpecs).toHaveLength(4);
      expect(p.variants.length).toBeGreaterThan(0);
    }
    for (const c of MOCK_CATEGORIES) expect(c.filterAttributeIds.every((id) => attrIds.has(id)), c.id).toBe(true);
  });
});

describe("mockCatalogService", () => {
  it("lọc theo danh mục cha gồm cả danh mục con", async () => {
    const cardio = await catalog.queryProducts(baseQuery({ categoryId: "c-cardio", pageSize: 100 }));
    const treadmills = await catalog.queryProducts(baseQuery({ categoryId: "c-treadmills", pageSize: 100 }));
    expect(treadmills.total).toBeGreaterThan(0);
    expect(cardio.total).toBeGreaterThan(treadmills.total);
  });

  it("lọc khoảng thuộc tính, boolean, còn hàng và sắp xếp giá", async () => {
    const page = await catalog.queryProducts(
      baseQuery({
        categoryId: "c-treadmills",
        attributes: { "a-power": { kind: "range", min: 2.5 }, "a-foldable": { kind: "boolean", value: true } },
        inStock: true,
        sort: "price_asc",
      }),
    );
    expect(page.items.map((p) => p.id)).toEqual(["tm-x5"]);
  });

  it("phân trang cộng dồn (Xem thêm) và hasMore", async () => {
    const p1 = await catalog.queryProducts(baseQuery({ pageSize: 5 }));
    const p2 = await catalog.queryProducts(baseQuery({ pageSize: 5, page: 2 }));
    expect(p1.items).toHaveLength(5);
    expect(p2.items).toHaveLength(10);
    expect(p2.items.slice(0, 5)).toEqual(p1.items);
    expect(p1.hasMore).toBe(true);
  });

  it("facet thương hiệu và thuộc tính của danh mục", async () => {
    const page = await catalog.queryProducts(baseQuery({ categoryId: "c-dumbbells" }));
    expect(page.facets.find((f) => f.kind === "brand")).toBeTruthy();
    expect(page.facets.some((f) => f.kind === "attribute" && f.attributeId === "a-material")).toBe(true);
  });

  it("tìm kiếm và gợi ý không dấu", async () => {
    const s = await catalog.suggest("may chay");
    expect(s.products.length).toBeGreaterThan(0);
    expect(s.products.every((p) => p.name.toLowerCase().includes("máy"))).toBe(true);
    expect((await catalog.suggest("tham")).categories.map((c) => c.slug)).toContain("tham-tap");
  });

  it("mọi link danh mục trong menu header trỏ tới danh mục có thật", async () => {
    const paths = new Set((await catalog.listCategories()).map((c) => c.path));
    const hrefs = SHOP_NAVIGATION.flatMap((i) => [i.href, ...(i.children ?? []).map((c) => c.href)]).filter((h) => h.startsWith("/danh-muc/"));
    expect(hrefs.filter((h) => !paths.has(h))).toEqual([]);
  });

  it("đường dẫn danh mục cha/con", async () => {
    const c = await catalog.getCategoryByPath(["cardio", "may-chay-bo"]);
    expect(c?.id).toBe("c-treadmills");
    expect(c?.ancestors.map((a) => a.id)).toEqual(["c-cardio"]);
    expect(await catalog.getCategoryByPath(["may-chay-bo"])).toBeNull();
  });
});

describe("mockOrderService", () => {
  const HCM = 79;
  const input = (over: Partial<CheckoutInput> = {}): CheckoutInput => ({
    contact: { name: "Nguyễn Văn A", phone: "0912 345 678" },
    address: { recipient: "Nguyễn Văn A", phone: "0912345678", provinceCode: HCM, provinceName: "TP. Hồ Chí Minh", wardCode: 1, wardName: "Phường X", street: "1 Lê Lợi" },
    shippingMethod: "standard",
    paymentMethod: "cod",
    lines: [{ productId: "db-rubber", variantId: "db-rubber-v1", quantity: 2, serviceIds: [] }],
    idempotencyKey: Math.random().toString(36),
    ...over,
  });

  beforeEach(() => localStorage.clear());
  afterEach(() => vi.useRealTimers());

  it("COD -> chờ xác nhận; xem lại được trên trình duyệt đã đặt", async () => {
    const order = await orders.placeOrder(input());
    expect(order.status).toBe("pending_confirmation");
    expect(order.total).toBe(order.subtotal + order.shippingFee);
    expect((await orders.getOrder(order.code)).code).toBe(order.code);
  });

  it("gửi lặp cùng khóa idempotency trả lại đúng đơn cũ", async () => {
    const i = input();
    const a = await orders.placeOrder(i);
    const b = await orders.placeOrder(i);
    expect(b.code).toBe(a.code);
  });

  it("giỏ có hàng hết -> cart_changed, không tạo đơn", async () => {
    const err = await orders
      .placeOrder(input({ lines: [{ productId: "tm-x3", variantId: "tm-x3-v1", quantity: 1, serviceIds: [] }] }))
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ShopServiceError);
    expect((err as ShopServiceError).code).toBe("cart_changed");
  });

  it("VNPay: chờ thanh toán -> thất bại vẫn thanh toán lại được -> thành công", async () => {
    const order = await orders.placeOrder(input({ paymentMethod: "vnpay" }));
    expect(order.status).toBe("pending_payment");
    expect(await orders.getPaymentUrl(order.code)).toContain(order.code);
    expect((await orders.completeMockPayment!(order.code, "failed")).paymentStatus).toBe("failed");
    const paid = await orders.completeMockPayment!(order.code, "success");
    expect(paid).toMatchObject({ status: "pending_confirmation", paymentStatus: "paid" });
  });

  it("quá hạn thanh toán -> đơn bị hủy", async () => {
    const order = await orders.placeOrder(input({ paymentMethod: "momo" }));
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 16 * 60_000);
    expect((await orders.getOrder(order.code)).status).toBe("cancelled");
  });

  it("người khác không xem được đơn nếu SĐT không khớp", async () => {
    const order = await orders.placeOrder(input());
    localStorage.removeItem("es_shop_mock_my_order_codes");
    await expect(orders.getOrder(order.code, { phone: "0999999999" })).rejects.toMatchObject({ code: "not_found" });
    expect((await orders.getOrder(order.code, { phone: "+84912345678" })).code).toBe(order.code);
  });
});

describe("mockCustomerService", () => {
  beforeEach(() => localStorage.clear());

  it("đăng ký, đăng nhập bằng SĐT hoặc email; sai mật khẩu bị từ chối; không lưu mật khẩu thô", async () => {
    await customers.register({ name: "Chị B", identifier: "0987 654 321", password: "matkhau123" });
    expect((await customers.login("0987654321", "matkhau123")).name).toBe("Chị B");
    await expect(customers.login("0987654321", "sai")).rejects.toMatchObject({ code: "invalid_credentials" });
    await expect(customers.register({ name: "X", identifier: "+84987654321", password: "x" })).rejects.toMatchObject({ code: "already_exists" });
    expect(JSON.stringify(localStorage)).not.toContain("matkhau123");
  });

  it("sổ địa chỉ: địa chỉ đầu tiên là mặc định, đổi mặc định, xóa mặc định thì chuyển sang địa chỉ khác", async () => {
    const base = { recipient: "A", phone: "0912345678", provinceCode: 1, provinceName: "Hà Nội", wardCode: 4, wardName: "Phường Ba Đình", street: "1" };
    const a = await customers.saveAddress("cus_1", base);
    const b = await customers.saveAddress("cus_1", { ...base, street: "2" });
    expect(a.isDefault).toBe(true);
    expect(b.isDefault).toBe(false);
    await customers.setDefaultAddress("cus_1", b.id);
    await customers.deleteAddress("cus_1", b.id);
    const list = await customers.listAddresses("cus_1");
    expect(list).toHaveLength(1);
    expect(list[0].isDefault).toBe(true);
  });
});
