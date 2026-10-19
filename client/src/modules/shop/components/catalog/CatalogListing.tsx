"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { countActiveFilters } from "../../lib/filters";
import { formatPrice } from "../../lib/formatPrice";
import { archivo } from "../../fonts";
import type { Attribute, Facet, ProductQuery, ProductSummary, SortKey } from "../../types";
import { ProductCard, ShopButton } from "../ui";
import { FilterPanel } from "./FilterPanel";
import { useCatalogNavigation } from "./useCatalogNavigation";

const SORTS: SortKey[] = ["featured", "bestseller", "newest", "price_asc", "price_desc"];

interface CatalogListingProps {
  /** Đường dẫn trang (không query string): "/danh-muc/cardio", "/tim-kiem" */
  basePath: string;
  query: ProductQuery;
  attributes: Attribute[];
  facets: Facet[];
  items: ProductSummary[];
  total: number;
  hasMore: boolean;
}

/** Khu vực danh sách sản phẩm: bộ lọc (cột trái / ngăn kéo mobile), sắp xếp, tag bộ lọc, lưới, "Xem thêm". */
export function CatalogListing({ basePath, query: serverQuery, attributes, facets, items, total, hasMore }: CatalogListingProps) {
  const t = useTranslations("shop.catalog");
  const { query, pending, update, hrefFor } = useCatalogNavigation(basePath, serverQuery, attributes);
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeCount = countActiveFilters(query);

  // Tag bộ lọc đang bật — mỗi tag biết cách tự gỡ
  const brandFacet = facets.find((f) => f.kind === "brand");
  const tags: { key: string; label: string; remove: Partial<ProductQuery> }[] = [];
  if (query.inStock) tags.push({ key: "stock", label: t("inStock"), remove: { inStock: false } });
  if (query.price) {
    const { min, max } = query.price;
    const label =
      min === undefined ? t("priceUnder", { max: formatPrice(max) }) : max === undefined ? t("priceOver", { min: formatPrice(min) }) : t("priceBetween", { min: formatPrice(min), max: formatPrice(max) });
    tags.push({ key: "price", label, remove: { price: undefined } });
  }
  for (const slug of query.brandSlugs) {
    tags.push({ key: `brand-${slug}`, label: brandFacet?.options.find((o) => o.value === slug)?.label ?? slug, remove: { brandSlugs: query.brandSlugs.filter((b) => b !== slug) } });
  }
  for (const [attrId, f] of Object.entries(query.attributes)) {
    const attr = attributes.find((a) => a.id === attrId);
    if (!attr) continue;
    const without = { ...query.attributes };
    delete without[attrId];
    if (f.kind === "options") {
      for (const v of f.values) {
        const rest = f.values.filter((x) => x !== v);
        tags.push({
          key: `${attrId}-${v}`,
          label: attr.options?.find((o) => o.value === v)?.label ?? v,
          remove: { attributes: rest.length ? { ...query.attributes, [attrId]: { kind: "options", values: rest } } : without },
        });
      }
    } else if (f.kind === "boolean") {
      tags.push({ key: attrId, label: attr.name, remove: { attributes: without } });
    } else {
      tags.push({ key: attrId, label: `${attr.name}: ${f.min ?? "…"} – ${f.max ?? "…"}${attr.unit ? ` ${attr.unit}` : ""}`, remove: { attributes: without } });
    }
  }
  const clearAll: Partial<ProductQuery> = { price: undefined, brandSlugs: [], attributes: {}, inStock: false };

  const panel = (
    <FilterPanel
      query={query}
      facets={facets}
      attributes={attributes}
      onChange={(patch) => update(patch)}
    />
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
      <aside className="hidden lg:block" aria-label={t("filters")}>
        <div className="sticky top-[132px] max-h-[calc(100vh-148px)] overflow-y-auto pr-2">{panel}</div>
      </aside>

      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--c-text-secondary)]" aria-live="polite">
            {t("resultCount", { count: total })}
          </p>
          <div className="flex items-center gap-2">
            <ShopButton variant="outline-ink" size="sm" className="lg:hidden" onClick={() => setSheetOpen(true)}>
              <SlidersHorizontal />
              {activeCount ? t("filtersWithCount", { count: activeCount }) : t("filters")}
            </ShopButton>
            <Select value={query.sort} onValueChange={(v) => v && update({ sort: v as SortKey })}>
              <SelectTrigger className="h-9 w-[180px] rounded-[4px] bg-white text-[13px]" aria-label={t("sortLabel")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={cn("shop-theme", archivo.variable)}>
                {SORTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`sort.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {tags.length > 0 && (
          <ul className="mb-4 flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <li key={tag.key}>
                <button
                  type="button"
                  onClick={() => update(tag.remove)}
                  aria-label={t("removeFilter", { label: tag.label })}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[4px] bg-[var(--shop-ink)] px-2.5 text-xs font-medium text-white hover:bg-[var(--shop-ink-soft)]"
                >
                  {tag.label}
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => update(clearAll)} className="h-8 px-2 text-xs font-semibold text-[var(--shop-primary)] hover:underline">
                {t("clearAll")}
              </button>
            </li>
          </ul>
        )}

        <div aria-busy={pending} className={cn("transition-opacity", pending && "pointer-events-none opacity-50")}>
          {items.length === 0 ? (
            <div className="rounded-[6px] bg-white px-6 py-14 text-center">
              <p className="shop-display-soft text-xl">{t("emptyTitle")}</p>
              <p className="mt-2 text-sm text-[var(--c-text-secondary)]">{t("emptyText")}</p>
              {activeCount > 0 && (
                <ShopButton variant="outline" className="mt-5" onClick={() => update(clearAll)}>
                  {t("clearAll")}
                </ShopButton>
              )}
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
                {items.map((p, i) => (
                  <li key={p.id}>
                    <ProductCard product={p} href={`/san-pham/${p.slug}`} priority={i < 3} />
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col items-center gap-3">
                <p className="text-xs text-[var(--c-text-tertiary)]">{t("shownOf", { shown: items.length, total })}</p>
                {hasMore && (
                  <ShopButton asChild variant="outline-ink">
                    {/* Link thật tới trang kế (?trang=n) -> chia sẻ / F5 giữ vị trí; không cuộn lên đầu */}
                    <Link href={hrefFor({ ...query, page: query.page + 1 })} scroll={false}>
                      {t("loadMore")}
                    </Link>
                  </ShopButton>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className={cn("shop-theme max-h-[88vh] gap-0 rounded-t-[12px] p-0", archivo.variable)}>
          <div className="border-b border-[var(--c-border)] px-4 py-3">
            <SheetTitle className="shop-display-soft text-lg">{t("filters")}</SheetTitle>
          </div>
          <div className="overflow-y-auto px-4 py-4">{panel}</div>
          <div className="flex gap-2 border-t border-[var(--c-border)] p-3">
            {activeCount > 0 && (
              <ShopButton variant="ghost" className="flex-1" onClick={() => update(clearAll)}>
                {t("clearAll")}
              </ShopButton>
            )}
            <ShopButton className="flex-[2]" loading={pending} onClick={() => setSheetOpen(false)}>
              {t("showResults", { count: total })}
            </ShopButton>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
