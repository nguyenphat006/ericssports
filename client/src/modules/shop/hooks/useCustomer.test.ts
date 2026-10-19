import { describe, expect, it } from "vitest";
import { safeNextPath } from "./useCustomer";

describe("safeNextPath", () => {
  it("giữ đường dẫn nội bộ", () => {
    expect(safeNextPath("/thanh-toan")).toBe("/thanh-toan");
    expect(safeNextPath("/tai-khoan/dia-chi?x=1")).toBe("/tai-khoan/dia-chi?x=1");
  });

  it.each(["//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)", "", null, undefined])("chặn chuyển hướng ra ngoài: %s", (next) => {
    expect(safeNextPath(next)).toBe("/tai-khoan/don-hang");
  });
});
