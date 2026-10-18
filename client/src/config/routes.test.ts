import { describe, expect, it } from "vitest";
import { adminPath, isAdminPath, stripAdminBase } from "./routes";

describe("adminPath", () => {
  it.each([
    ["/", "/admin"],
    ["", "/admin"],
    ["/users", "/admin/users"],
    ["users/5", "/admin/users/5"],
    ["/master-data/customers?q=KH001", "/admin/master-data/customers?q=KH001"],
    ["/?tab=a", "/admin?tab=a"],
  ])("thêm tiền tố: %s -> %s", (input, expected) => {
    expect(adminPath(input)).toBe(expected);
  });

  it("không nhân đôi tiền tố", () => {
    expect(adminPath("/admin")).toBe("/admin");
    expect(adminPath("/admin/users/5")).toBe("/admin/users/5");
  });

  it("giữ nguyên URL ngoài", () => {
    expect(adminPath("https://example.com/a")).toBe("https://example.com/a");
    expect(adminPath("mailto:a@b.vn")).toBe("mailto:a@b.vn");
    expect(adminPath("//cdn.example.com/x")).toBe("//cdn.example.com/x");
  });

  it("đường dẫn bắt đầu bằng chữ 'admin' nhưng không phải tiền tố vẫn được thêm", () => {
    expect(adminPath("/administrator")).toBe("/admin/administrator");
  });
});

describe("isAdminPath / stripAdminBase", () => {
  it("nhận diện khu quản trị", () => {
    expect(isAdminPath("/admin")).toBe(true);
    expect(isAdminPath("/admin/users")).toBe(true);
    expect(isAdminPath("/administrator")).toBe(false);
    expect(isAdminPath("/")).toBe(false);
    expect(isAdminPath("/san-pham/x")).toBe(false);
  });

  it("bỏ tiền tố", () => {
    expect(stripAdminBase("/admin")).toBe("/");
    expect(stripAdminBase("/admin/users/5")).toBe("/users/5");
    expect(stripAdminBase("/san-pham/x")).toBe("/san-pham/x");
  });
});
