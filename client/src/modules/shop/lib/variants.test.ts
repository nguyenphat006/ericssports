import { describe, expect, it } from "vitest";
import type { Product } from "../types";
import { findVariant, initialVariant, optionState, selectOption } from "./variants";

// Màu (đen / xám) × phiên bản (x5 / pro); không có tổ hợp xám + pro; đen + x5 hết hàng
const product = {
  variantAxes: [
    { id: "color", name: "Màu", values: [{ value: "den", label: "Đen" }, { value: "xam", label: "Xám" }] },
    { id: "version", name: "Phiên bản", values: [{ value: "x5", label: "X5" }, { value: "pro", label: "Pro" }] },
  ],
  variants: [
    { id: "v1", sku: "1", options: { color: "den", version: "x5" }, price: 1, stock: 0, weightKg: 1 },
    { id: "v2", sku: "2", options: { color: "den", version: "pro" }, price: 2, stock: 3, weightKg: 1 },
    { id: "v3", sku: "3", options: { color: "xam", version: "x5" }, price: 1, stock: 5, weightKg: 1 },
  ],
} as unknown as Product;

describe("biến thể", () => {
  it("tìm theo tổ hợp lựa chọn", () => {
    expect(findVariant(product, { color: "xam", version: "x5" })?.id).toBe("v3");
    expect(findVariant(product, { color: "xam", version: "pro" })).toBeUndefined();
  });

  it("biến thể mở đầu: ?v= hợp lệ, không thì còn hàng đầu tiên", () => {
    expect(initialVariant(product, "v1").id).toBe("v1");
    expect(initialVariant(product, "khong-co").id).toBe("v2");
    expect(initialVariant(product).id).toBe("v2");
  });

  it("trạng thái lựa chọn theo trục còn lại", () => {
    const selected = { color: "den", version: "pro" };
    expect(optionState(product, selected, "version", "x5")).toBe("out_of_stock");
    expect(optionState(product, selected, "color", "xam")).toBe("unavailable");
    expect(optionState(product, { color: "xam", version: "x5" }, "color", "den")).toBe("out_of_stock");
  });

  it("chọn giá trị tạo tổ hợp không có -> nhảy sang biến thể gần nhất có giá trị đó", () => {
    expect(selectOption(product, { color: "den", version: "pro" }, "color", "xam")?.id).toBe("v3");
    expect(selectOption(product, { color: "xam", version: "x5" }, "version", "pro")?.id).toBe("v2");
  });
});
