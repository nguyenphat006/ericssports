import type { Attribute, AttributeFilter, ProductQuery, SortKey } from "../types";

/**
 * Trạng thái lọc / sắp xếp / trang của trang danh mục & tìm kiếm <-> tham số URL (tiếng Việt không dấu):
 *   ?q=may+chay&sap-xep=gia-tang&gia=1000000-5000000&thuong-hieu=es-cardio,es-pro&cong-suat=3-4&gap-gon=1&con-hang=1&trang=2
 * Giá trị sai / không thuộc danh sách lựa chọn bị bỏ qua (link chia sẻ hỏng vẫn mở được).
 */

export const DEFAULT_PAGE_SIZE = 12;

const SORT_PARAMS: Record<Exclude<SortKey, "featured">, string> = {
  bestseller: "ban-chay",
  newest: "moi",
  price_asc: "gia-tang",
  price_desc: "gia-giam",
};
const SORT_BY_PARAM = Object.fromEntries(Object.entries(SORT_PARAMS).map(([k, v]) => [v, k])) as Record<string, SortKey>;

const P = { q: "q", sort: "sap-xep", price: "gia", brand: "thuong-hieu", inStock: "con-hang", page: "trang" } as const;

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function read(params: ParamSource, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

function parseNumber(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** "1000000-5000000" | "-5000000" | "1000000-" -> { min, max }; sai định dạng -> undefined */
export function parseRange(raw: string | undefined): { min?: number; max?: number } | undefined {
  if (!raw || !raw.includes("-")) return undefined;
  const [a, b] = raw.split("-", 2);
  let min = parseNumber(a);
  let max = parseNumber(b);
  if (min === undefined && max === undefined) return undefined;
  if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
  return { ...(min !== undefined && { min }), ...(max !== undefined && { max }) };
}

function formatRange(range: { min?: number; max?: number }): string {
  return `${range.min ?? ""}-${range.max ?? ""}`;
}

function parseList(raw: string | undefined): string[] {
  return raw ? [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))] : [];
}

export function parseProductQuery(
  params: ParamSource,
  attributes: Attribute[],
  base: { categoryId?: string; pageSize?: number } = {},
): ProductQuery {
  const attrFilters: Record<string, AttributeFilter> = {};
  for (const attr of attributes) {
    const raw = read(params, attr.slug);
    if (!raw) continue;
    if (attr.kind === "range") {
      const range = parseRange(raw);
      if (range) attrFilters[attr.id] = { kind: "range", ...range };
    } else if (attr.kind === "options") {
      const allowed = new Set(attr.options?.map((o) => o.value));
      const values = parseList(raw).filter((v) => allowed.has(v));
      if (values.length) attrFilters[attr.id] = { kind: "options", values };
    } else if (raw === "1") {
      attrFilters[attr.id] = { kind: "boolean", value: true };
    }
  }

  const page = Math.floor(parseNumber(read(params, P.page)) ?? 1);
  const q = read(params, P.q)?.trim();
  const price = parseRange(read(params, P.price));

  return {
    ...(base.categoryId && { categoryId: base.categoryId }),
    ...(q && { q }),
    brandSlugs: parseList(read(params, P.brand)),
    ...(price && { price }),
    attributes: attrFilters,
    inStock: read(params, P.inStock) === "1",
    sort: SORT_BY_PARAM[read(params, P.sort) ?? ""] ?? "featured",
    page: page >= 1 ? page : 1,
    pageSize: base.pageSize ?? DEFAULT_PAGE_SIZE,
  };
}

/** Ngược lại: chỉ ghi tham số khác mặc định; categoryId nằm trên đường dẫn nên không ghi. */
export function serializeProductQuery(query: ProductQuery, attributes: Attribute[]): URLSearchParams {
  const out = new URLSearchParams();
  if (query.q) out.set(P.q, query.q);
  if (query.sort !== "featured") out.set(P.sort, SORT_PARAMS[query.sort]);
  if (query.price && (query.price.min !== undefined || query.price.max !== undefined)) out.set(P.price, formatRange(query.price));
  if (query.brandSlugs.length) out.set(P.brand, query.brandSlugs.join(","));
  for (const attr of attributes) {
    const f = query.attributes[attr.id];
    if (!f) continue;
    if (f.kind === "range" && (f.min !== undefined || f.max !== undefined)) out.set(attr.slug, formatRange(f));
    if (f.kind === "options" && f.values.length) out.set(attr.slug, f.values.join(","));
    if (f.kind === "boolean") out.set(attr.slug, "1");
  }
  if (query.inStock) out.set(P.inStock, "1");
  if (query.page > 1) out.set(P.page, String(query.page));
  return out;
}

/** Số bộ lọc đang bật (hiển thị "Bộ lọc (n)") — không tính sắp xếp, trang, từ khóa */
export function countActiveFilters(query: ProductQuery): number {
  return (query.price ? 1 : 0) + (query.brandSlugs.length ? 1 : 0) + Object.keys(query.attributes).length + (query.inStock ? 1 : 0);
}
