import { describe, expect, it } from "vitest";
import { discountPercent, formatPrice } from "./formatPrice";

describe("formatPrice", () => {
  it.each([
    [0, "0₫"],
    [890000, "890.000₫"],
    [12990000, "12.990.000₫"],
    [1250000.6, "1.250.001₫"],
    [-50000, "-50.000₫"],
  ])("%s -> %s", (value, expected) => {
    expect(formatPrice(value)).toBe(expected);
  });

  it("giá trị không hợp lệ trả chuỗi rỗng", () => {
    expect(formatPrice(null)).toBe("");
    expect(formatPrice(undefined)).toBe("");
    expect(formatPrice(Number.NaN)).toBe("");
  });
});

describe("discountPercent", () => {
  it("tính phần trăm giảm làm tròn", () => {
    expect(discountPercent(15290000, 12990000)).toBe(15);
    expect(discountPercent(1000000, 600000)).toBe(40);
  });

  it("không giảm hoặc thiếu giá gốc -> null", () => {
    expect(discountPercent(null, 500000)).toBeNull();
    expect(discountPercent(500000, 500000)).toBeNull();
    expect(discountPercent(400000, 500000)).toBeNull();
  });
});
