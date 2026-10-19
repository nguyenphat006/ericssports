import type { Attribute, Facet, FacetOption, Product, ProductPage, ProductQuery, ProductSummary, SearchSuggestions } from "../../types";
import { matchesQuery } from "../../lib/text";
import { MOCK_PRODUCT_LIST, toSummary } from "../../mocks/products";
import { mockReviews } from "../../mocks/reviews";
import { MOCK_ATTRIBUTES, MOCK_BRANDS, MOCK_CATEGORIES } from "../../mocks/taxonomy";
import type { CatalogService, CategoryWithPath, ProductSelection } from "../types";

/** Catalog mock: lọc / sắp xếp / phân trang / facet trên dữ liệu mẫu — mô phỏng việc server làm (client chỉ nhận trang hiện tại). */

const CATEGORY_TREE: CategoryWithPath[] = (() => {
  const byId = new Map(MOCK_CATEGORIES.map((c) => [c.id, c]));
  return MOCK_CATEGORIES.map((c) => {
    const ancestors = [];
    let parent = c.parentId ? byId.get(c.parentId) : undefined;
    while (parent) {
      ancestors.unshift(parent);
      parent = parent.parentId ? byId.get(parent.parentId) : undefined;
    }
    return {
      ...c,
      ancestors,
      path: `/danh-muc/${[...ancestors, c].map((a) => a.slug).join("/")}`,
      children: MOCK_CATEGORIES.filter((ch) => ch.parentId === c.id).sort((a, b) => a.sortOrder - b.sortOrder),
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
})();

const PRODUCT_BY_ID = new Map(MOCK_PRODUCT_LIST.map((p) => [p.id, p]));
const SUMMARY_BY_ID = new Map(MOCK_PRODUCT_LIST.map((p) => [p.id, toSummary(p)]));

export function findMockProduct(id: string): Product | undefined {
  return PRODUCT_BY_ID.get(id);
}

function searchText(p: Product): string {
  const cats = p.categoryIds.map((id) => CATEGORY_TREE.find((c) => c.id === id)?.name ?? "").join(" ");
  return `${p.name} ${p.brand.name} ${cats} ${p.shortDescription}`;
}

function numericAttr(p: Product, attrId: string): number | undefined {
  const v = p.attributes[attrId];
  return typeof v === "number" ? v : undefined;
}

function matchesAttributes(p: Product, query: ProductQuery, skipAttrId?: string): boolean {
  return Object.entries(query.attributes).every(([attrId, f]) => {
    if (attrId === skipAttrId) return true;
    const v = p.attributes[attrId];
    if (f.kind === "range") {
      const n = numericAttr(p, attrId);
      return n !== undefined && (f.min === undefined || n >= f.min) && (f.max === undefined || n <= f.max);
    }
    if (f.kind === "options") return Array.isArray(v) && v.some((x) => f.values.includes(x));
    return v === true;
  });
}

/** Tập cơ sở (danh mục + từ khóa) — facet đếm trên tập này để lựa chọn không "biến mất" khi đang lọc */
function baseSet(query: ProductQuery): Product[] {
  return MOCK_PRODUCT_LIST.filter(
    (p) => (!query.categoryId || p.categoryIds.includes(query.categoryId)) && (!query.q || matchesQuery(searchText(p), query.q)),
  );
}

function applyFilters(products: Product[], query: ProductQuery): Product[] {
  return products.filter((p) => {
    const s = SUMMARY_BY_ID.get(p.id)!;
    if (query.brandSlugs.length && !query.brandSlugs.includes(p.brand.slug)) return false;
    if (query.price?.min !== undefined && s.price < query.price.min) return false;
    if (query.price?.max !== undefined && s.price > query.price.max) return false;
    if (query.inStock && !s.inStock) return false;
    return matchesAttributes(p, query);
  });
}

function sortProducts(list: Product[], sort: ProductQuery["sort"]): Product[] {
  const s = (p: Product) => SUMMARY_BY_ID.get(p.id)!;
  const sorted = [...list];
  switch (sort) {
    case "bestseller":
      return sorted.sort((a, b) => b.soldCount - a.soldCount);
    case "newest":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "price_asc":
      return sorted.sort((a, b) => s(a).price - s(b).price);
    case "price_desc":
      return sorted.sort((a, b) => s(b).price - s(a).price);
    default:
      // Nổi bật: còn hàng trước, nhãn bán chạy trước, rồi theo lượng bán
      return sorted.sort(
        (a, b) =>
          Number(s(b).inStock) - Number(s(a).inStock) ||
          Number(b.badges.includes("bestseller")) - Number(a.badges.includes("bestseller")) ||
          b.soldCount - a.soldCount,
      );
  }
}

function buildFacets(base: Product[], attributes: Attribute[]): Facet[] {
  const facets: Facet[] = [];
  const brandCounts = new Map<string, number>();
  base.forEach((p) => brandCounts.set(p.brand.slug, (brandCounts.get(p.brand.slug) ?? 0) + 1));
  facets.push({
    kind: "brand",
    options: MOCK_BRANDS.filter((b) => brandCounts.has(b.slug)).map((b) => ({ value: b.slug, label: b.name, count: brandCounts.get(b.slug)! })),
  });
  const prices = base.map((p) => SUMMARY_BY_ID.get(p.id)!.price);
  if (prices.length) facets.push({ kind: "price", min: Math.min(...prices), max: Math.max(...prices) });

  for (const attr of attributes) {
    if (attr.kind === "range") {
      const values = base.map((p) => numericAttr(p, attr.id)).filter((v): v is number => v !== undefined);
      if (values.length > 1 && Math.min(...values) !== Math.max(...values)) {
        facets.push({ kind: "attribute", attributeId: attr.id, attributeKind: "range", min: Math.min(...values), max: Math.max(...values) });
      }
    } else if (attr.kind === "options") {
      const options: FacetOption[] = (attr.options ?? [])
        .map((o) => ({ ...o, count: base.filter((p) => (p.attributes[attr.id] as string[] | undefined)?.includes(o.value)).length }))
        .filter((o) => o.count > 0);
      if (options.length) facets.push({ kind: "attribute", attributeId: attr.id, attributeKind: "options", options });
    } else {
      const count = base.filter((p) => p.attributes[attr.id] === true).length;
      if (count > 0) facets.push({ kind: "attribute", attributeId: attr.id, attributeKind: "boolean", count });
    }
  }
  return facets;
}

export const mockCatalogService: CatalogService = {
  async listCategories() {
    return CATEGORY_TREE;
  },

  async getCategoryByPath(slugs) {
    const path = `/danh-muc/${slugs.join("/")}`;
    return CATEGORY_TREE.find((c) => c.path === path) ?? null;
  },

  async listBrands() {
    return MOCK_BRANDS;
  },

  async listAttributes(ids) {
    if (!ids) return MOCK_ATTRIBUTES;
    return ids.map((id) => MOCK_ATTRIBUTES.find((a) => a.id === id)).filter((a): a is Attribute => !!a);
  },

  async queryProducts(query): Promise<ProductPage> {
    const base = baseSet(query);
    const category = query.categoryId ? CATEGORY_TREE.find((c) => c.id === query.categoryId) : undefined;
    const attrs = category
      ? category.filterAttributeIds.map((id) => MOCK_ATTRIBUTES.find((a) => a.id === id)).filter((a): a is Attribute => !!a)
      : [];
    const filtered = sortProducts(applyFilters(base, query), query.sort);
    const end = query.page * query.pageSize;
    return {
      items: filtered.slice(0, end).map((p) => SUMMARY_BY_ID.get(p.id)!),
      total: filtered.length,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: end < filtered.length,
      facets: buildFacets(base, attrs),
    };
  },

  async selectProducts(selection: ProductSelection): Promise<ProductSummary[]> {
    let list: Product[];
    switch (selection.source) {
      case "manual":
        list = (selection.productIds ?? []).map((id) => PRODUCT_BY_ID.get(id)).filter((p): p is Product => !!p);
        break;
      case "category":
        list = sortProducts(MOCK_PRODUCT_LIST.filter((p) => !selection.categoryId || p.categoryIds.includes(selection.categoryId)), "featured");
        break;
      case "new":
        list = sortProducts(MOCK_PRODUCT_LIST, "newest");
        break;
      case "sale":
        list = sortProducts(MOCK_PRODUCT_LIST.filter((p) => !!SUMMARY_BY_ID.get(p.id)!.compareAtPrice), "featured");
        break;
      default:
        list = sortProducts(MOCK_PRODUCT_LIST, "bestseller");
    }
    return list.slice(0, selection.limit).map((p) => SUMMARY_BY_ID.get(p.id)!);
  },

  async getProductBySlug(slug) {
    return MOCK_PRODUCT_LIST.find((p) => p.slug === slug) ?? null;
  },

  async getProductsByIds(ids) {
    return ids.map((id) => SUMMARY_BY_ID.get(id)).filter((s): s is ProductSummary => !!s);
  },

  async suggest(q): Promise<SearchSuggestions> {
    if (!q.trim()) return { products: [], categories: [] };
    return {
      products: sortProducts(MOCK_PRODUCT_LIST.filter((p) => matchesQuery(searchText(p), q)), "bestseller")
        .slice(0, 5)
        .map((p) => SUMMARY_BY_ID.get(p.id)!),
      categories: CATEGORY_TREE.filter((c) => matchesQuery(c.name, q)).slice(0, 3),
    };
  },

  async getReviews(productId) {
    const p = PRODUCT_BY_ID.get(productId);
    return p ? mockReviews(p) : { average: null, count: 0, distribution: [0, 0, 0, 0, 0], items: [] };
  },
};
