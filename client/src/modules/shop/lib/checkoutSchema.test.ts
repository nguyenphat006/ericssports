import { describe, expect, it } from "vitest";
import { CHECKOUT_DEFAULTS, checkoutSchema } from "./checkoutSchema";

const valid = { ...CHECKOUT_DEFAULTS, name: "Nguyễn Văn A", phone: "0912 345 678", provinceCode: 79, wardCode: 26734, street: "12 Nguyễn Huệ" };

function errorKeys(values: object) {
  const r = checkoutSchema.safeParse(values);
  return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [i.path.join("."), i.message]));
}

describe("checkoutSchema", () => {
  it("form hợp lệ (email bỏ trống được)", () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it("form trống báo đúng khóa lỗi cho từng ô", () => {
    expect(errorKeys(CHECKOUT_DEFAULTS)).toEqual({
      name: "nameRequired",
      phone: "phoneInvalid",
      provinceCode: "provinceRequired",
      wardCode: "wardRequired",
      street: "streetRequired",
    });
  });

  it("email sai, SĐT sai, ghi chú quá dài", () => {
    expect(errorKeys({ ...valid, email: "abc", phone: "12345", note: "x".repeat(501) })).toEqual({
      email: "emailInvalid",
      phone: "phoneInvalid",
      note: "noteTooLong",
    });
  });
});
