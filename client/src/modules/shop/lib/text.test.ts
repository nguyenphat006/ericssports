import { describe, expect, it } from "vitest";
import { matchesQuery, normalizeVietnamese, slugify } from "./text";

describe("normalizeVietnamese", () => {
  it("bỏ dấu, đ -> d, chữ thường, gộp khoảng trắng", () => {
    expect(normalizeVietnamese("  Máy CHẠY   bộ Đa năng ")).toBe("may chay bo da nang");
    expect(normalizeVietnamese("Ầ Ẩ Ẫ Ậ Ữ Ự ỹ")).toBe("a a a a u u y");
  });
});

describe("slugify", () => {
  it("tạo slug URL", () => {
    expect(slugify("Máy chạy bộ X5 (gấp gọn)")).toBe("may-chay-bo-x5-gap-gon");
    expect(slugify("Tạ đơn 2–24kg")).toBe("ta-don-2-24kg");
  });
});

describe("matchesQuery", () => {
  it("khớp không dấu, mọi từ phải có", () => {
    expect(matchesQuery("Máy chạy bộ điện X5", "may chay")).toBe(true);
    expect(matchesQuery("Máy chạy bộ điện X5", "MÁY x5")).toBe(true);
    expect(matchesQuery("Máy chạy bộ điện X5", "may tap")).toBe(false);
    expect(matchesQuery("Máy chạy bộ", "   ")).toBe(false);
  });
});
