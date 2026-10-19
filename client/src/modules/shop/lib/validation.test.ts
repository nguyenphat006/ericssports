import { describe, expect, it } from "vitest";
import { isVietnamesePhone, normalizePhone } from "./validation";

describe("số điện thoại Việt Nam", () => {
  it.each(["0912345678", "091 234 5678", "0912.345.678", "+84912345678", "0281234567 8".replace(" ", ""), "0386123456"])("hợp lệ: %s", (p) => {
    expect(isVietnamesePhone(p)).toBe(true);
  });

  it.each(["091234567", "09123456789", "0112345678", "abc", ""])("không hợp lệ: %s", (p) => {
    expect(isVietnamesePhone(p)).toBe(false);
  });

  it("chuẩn hóa +84 và ký tự phân cách", () => {
    expect(normalizePhone("+84 912-345.678")).toBe("0912345678");
  });
});
