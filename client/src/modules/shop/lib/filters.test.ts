import { describe, expect, it } from "vitest";
import type { Attribute } from "../types";
import { countActiveFilters, parseProductQuery, parseRange, serializeProductQuery } from "./filters";

const ATTRS: Attribute[] = [
  { id: "power", slug: "cong-suat", name: "Công suất", kind: "range", unit: "HP" },
  { id: "foldable", slug: "gap-gon", name: "Gấp gọn", kind: "boolean" },
  {
    id: "material",
    slug: "chat-lieu",
    name: "Chất liệu",
    kind: "options",
    options: [
      { value: "cao-su", label: "Cao su" },
      { value: "gang", label: "Gang" },
    ],
  },
];

describe("parseRange", () => {
  it.each([
    ["1000-5000", { min: 1000, max: 5000 }],
    ["-5000", { max: 5000 }],
    ["1000-", { min: 1000 }],
    ["5000-1000", { min: 1000, max: 5000 }],
  ])("%s", (raw, expected) => {
    expect(parseRange(raw)).toEqual(expected);
  });

  it.each(["", "abc", "-", "1000", "x-y"])("sai định dạng: %s", (raw) => {
    expect(parseRange(raw)).toBeUndefined();
  });
});

describe("parseProductQuery", () => {
  it("đọc đủ tham số", () => {
    const q = parseProductQuery(
      new URLSearchParams("q=may chay&sap-xep=gia-tang&gia=1000000-5000000&thuong-hieu=es-cardio,es-pro&cong-suat=3-4&gap-gon=1&chat-lieu=gang&con-hang=1&trang=2"),
      ATTRS,
      { categoryId: "c1" },
    );
    expect(q).toEqual({
      categoryId: "c1",
      q: "may chay",
      brandSlugs: ["es-cardio", "es-pro"],
      price: { min: 1000000, max: 5000000 },
      attributes: {
        power: { kind: "range", min: 3, max: 4 },
        foldable: { kind: "boolean", value: true },
        material: { kind: "options", values: ["gang"] },
      },
      inStock: true,
      sort: "price_asc",
      page: 2,
      pageSize: 12,
    });
  });

  it("bỏ qua giá trị sai thay vì lỗi", () => {
    const q = parseProductQuery({ "sap-xep": "lung-tung", "chat-lieu": "nhom", "gap-gon": "co", trang: "-3" }, ATTRS);
    expect(q.sort).toBe("featured");
    expect(q.attributes).toEqual({});
    expect(q.page).toBe(1);
  });
});

describe("serializeProductQuery", () => {
  it("chỉ ghi tham số khác mặc định và parse lại ra đúng đối tượng", () => {
    const raw = "q=ta&sap-xep=ban-chay&gia=-2000000&cong-suat=3-&chat-lieu=cao-su,gang&trang=3";
    const query = parseProductQuery(new URLSearchParams(raw), ATTRS);
    const serialized = serializeProductQuery(query, ATTRS);
    expect(parseProductQuery(serialized, ATTRS)).toEqual(query);
    expect(serializeProductQuery(parseProductQuery(new URLSearchParams(""), ATTRS), ATTRS).toString()).toBe("");
  });

  it("đếm bộ lọc đang bật", () => {
    const q = parseProductQuery(new URLSearchParams("gia=1-2&thuong-hieu=a,b&gap-gon=1&con-hang=1&sap-xep=moi"), ATTRS);
    expect(countActiveFilters(q)).toBe(4);
  });
});
