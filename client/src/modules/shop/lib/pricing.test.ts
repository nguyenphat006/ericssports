import { describe, expect, it } from "vitest";
import type { Product } from "../types";
import { priceCart, variantLabel } from "./pricing";
import { SHIPPING_CONFIG, availableShippingMethods, quoteShipping, shippingZone } from "./shipping";

const HCM = 79;
const DONG_NAI = 75;
const CA_MAU = 96;

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    slug: "may-chay-x5",
    name: "Máy chạy X5",
    brand: { id: "b1", slug: "es-cardio", name: "ES Cardio" },
    primaryCategoryId: "c1",
    categoryIds: ["c1"],
    shortDescription: "",
    media: [
      { kind: "image", src: "/a.svg", alt: "A" },
      { kind: "image", src: "/b.svg", alt: "B" },
    ],
    variantAxes: [
      { id: "color", name: "Màu", values: [{ value: "den", label: "Đen" }, { value: "xam", label: "Xám" }] },
      { id: "version", name: "Phiên bản", values: [{ value: "x5", label: "X5" }] },
    ],
    variants: [
      { id: "v1", sku: "X5-DEN", options: { color: "den", version: "x5" }, price: 10_000_000, stock: 5, weightKg: 70 },
      { id: "v2", sku: "X5-XAM", options: { color: "xam", version: "x5" }, price: 11_000_000, stock: 0, weightKg: 70, mediaIndex: 1 },
    ],
    keySpecs: [],
    specGroups: [],
    services: [
      { id: "install", name: "Lắp đặt", price: 200_000 },
      { id: "warranty", name: "Gia hạn bảo hành", price: 500_000 },
    ],
    description: { type: "doc", content: [] },
    attributes: {},
    documents: [],
    badges: [],
    rating: null,
    reviewCount: 0,
    soldCount: 0,
    bulky: true,
    relatedIds: [],
    boughtTogetherIds: [],
    createdAt: "2026-01-01",
    ...overrides,
  };
}

const small = product({
  id: "p2",
  bulky: false,
  services: [],
  variantAxes: [],
  variants: [{ id: "s1", sku: "TA-5", options: {}, price: 300_000, stock: 10, weightKg: 2 }],
});
const catalog = new Map([
  ["p1", product()],
  ["p2", small],
]);
const find = (id: string) => catalog.get(id);

describe("shipping", () => {
  it("xác định vùng theo mã tỉnh", () => {
    expect(shippingZone(HCM)).toBe("inner");
    expect(shippingZone(DONG_NAI)).toBe("near");
    expect(shippingZone(CA_MAU)).toBe("far");
  });

  it("giao nhanh chỉ có ở nội thành, chọn ở vùng khác tự về tiêu chuẩn", () => {
    expect(availableShippingMethods(HCM)).toEqual(["standard", "express"]);
    expect(availableShippingMethods(CA_MAU)).toEqual(["standard"]);
    expect(quoteShipping({ provinceCode: CA_MAU, method: "express", weightKg: 1, bulky: false, subtotal: 0 }).method).toBe("standard");
  });

  it("phí theo bậc cân nặng + phụ phí cồng kềnh + giao nhanh", () => {
    expect(quoteShipping({ provinceCode: HCM, weightKg: 3, bulky: false, subtotal: 100_000 }).fee).toBe(30_000);
    expect(quoteShipping({ provinceCode: DONG_NAI, weightKg: 20, bulky: true, subtotal: 100_000 }).fee).toBe(120_000 + 150_000);
    expect(quoteShipping({ provinceCode: HCM, method: "express", weightKg: 3, bulky: false, subtotal: 100_000 }).fee).toBe(80_000);
  });

  it("đạt ngưỡng: miễn phí ở vùng trong/lân cận, vùng xa vẫn tính; phụ phí cồng kềnh không được miễn", () => {
    const threshold = SHIPPING_CONFIG.freeShippingThreshold;
    expect(quoteShipping({ provinceCode: HCM, weightKg: 70, bulky: true, subtotal: threshold })).toMatchObject({ fee: 0, free: true });
    expect(quoteShipping({ provinceCode: DONG_NAI, weightKg: 70, bulky: true, subtotal: threshold })).toMatchObject({ fee: 150_000, free: false });
    expect(quoteShipping({ provinceCode: CA_MAU, weightKg: 70, bulky: false, subtotal: threshold }).fee).toBe(400_000);
  });
});

describe("priceCart", () => {
  it("cộng giá biến thể + dịch vụ thêm theo số lượng", () => {
    const cart = priceCart([{ productId: "p1", variantId: "v1", quantity: 2, serviceIds: ["install"] }], find);
    expect(cart.lines[0]).toMatchObject({ unitPrice: 10_000_000, servicesUnitPrice: 200_000, lineTotal: 20_400_000, variantLabel: "Đen · X5" });
    expect(cart.subtotal).toBe(20_400_000);
    expect(cart.itemCount).toBe(2);
    expect(cart.shipping).toBeNull();
    expect(cart.hasIssues).toBe(false);
  });

  it("bỏ dịch vụ không thuộc sản phẩm", () => {
    const cart = priceCart([{ productId: "p2", variantId: "s1", quantity: 1, serviceIds: ["install"] }], find);
    expect(cart.lines[0].services).toEqual([]);
    expect(cart.lines[0].lineTotal).toBe(300_000);
  });

  it("hết hàng / không còn bán: báo lỗi, không cộng tiền; thiếu hàng: cộng tiền nhưng báo lỗi", () => {
    const cart = priceCart(
      [
        { productId: "p1", variantId: "v2", quantity: 1, serviceIds: [] },
        { productId: "p9", variantId: "x", quantity: 1, serviceIds: [] },
        { productId: "p2", variantId: "s1", quantity: 11, serviceIds: [] },
      ],
      find,
    );
    expect(cart.lines.map((l) => l.issue)).toEqual(["out_of_stock", "unavailable", "insufficient_stock"]);
    expect(cart.subtotal).toBe(3_300_000);
    expect(cart.hasIssues).toBe(true);
  });

  it("có tỉnh thì tính phí ship theo tổng cân nặng và hàng cồng kềnh", () => {
    const cart = priceCart(
      [
        { productId: "p2", variantId: "s1", quantity: 1, serviceIds: [] },
        { productId: "p1", variantId: "v1", quantity: 1, serviceIds: [] },
      ],
      find,
      { provinceCode: CA_MAU },
    );
    // 72kg -> bậc cuối vùng xa (400k) + phụ phí cồng kềnh vùng xa (300k)
    expect(cart.shipping).toMatchObject({ zone: "far", fee: 700_000 });
    expect(cart.total).toBe(cart.subtotal + 700_000);
    expect(cart.amountToFreeShipping).toBe(0);
  });

  it("nhãn biến thể bỏ trục không có giá trị", () => {
    expect(variantLabel(product(), { color: "xam" })).toBe("Xám");
  });
});
