"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { formatPrice } from "../../lib/formatPrice";
import type { Attribute, AttributeFilter, Facet, ProductQuery } from "../../types";
import { Chip } from "../ui";

interface FilterPanelProps {
  /** Tiền tố id — bảng lọc render 2 nơi (cột trái + ngăn kéo mobile), id phải khác nhau để nhãn trỏ đúng ô */
  idPrefix: string;
  query: ProductQuery;
  facets: Facet[];
  attributes: Attribute[];
  onChange: (patch: Partial<ProductQuery>) => void;
}

const PRICE_PRESETS: { min?: number; max?: number }[] = [
  { max: 2_000_000 },
  { min: 2_000_000, max: 5_000_000 },
  { min: 5_000_000, max: 10_000_000 },
  { min: 10_000_000 },
];

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="border-b border-[var(--c-border)] py-4 first:pt-0">
      <CollapsibleTrigger className="group flex w-full items-center justify-between text-left text-sm font-semibold text-[var(--shop-ink)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        {title}
        <ChevronDown className="size-4 text-[var(--c-text-tertiary)] transition-transform group-data-[state=open]:rotate-180" aria-hidden />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function CheckboxRow({ id, label, count, checked, onChange }: { id: string; label: string; count?: number; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 py-1 text-sm">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-[var(--c-text-tertiary)] tabular-nums">{count}</span>}
    </label>
  );
}

/** Hai ô số "Từ – Đến" + nút áp dụng (giá, thuộc tính dạng khoảng). Giá trị ban đầu lấy từ URL. */
function RangeInputs({
  idPrefix,
  min,
  max,
  placeholderMin,
  placeholderMax,
  onApply,
}: {
  idPrefix: string;
  min?: number;
  max?: number;
  placeholderMin: string;
  placeholderMax: string;
  onApply: (range: { min?: number; max?: number } | undefined) => void;
}) {
  const t = useTranslations("shop.catalog");
  const [lo, setLo] = useState(min?.toString() ?? "");
  const [hi, setHi] = useState(max?.toString() ?? "");
  const toNum = (s: string) => (s.trim() === "" || !Number.isFinite(Number(s)) ? undefined : Math.max(0, Number(s)));
  const apply = () => {
    const a = toNum(lo);
    const b = toNum(hi);
    onApply(a === undefined && b === undefined ? undefined : { ...(a !== undefined && { min: a }), ...(b !== undefined && { max: b }) });
  };
  const input = "h-9 w-full min-w-0 rounded-[4px] border border-[var(--c-border-strong)] bg-white px-2.5 text-sm tabular-nums outline-none focus:border-[var(--shop-ink)]";
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <label htmlFor={`${idPrefix}-min`} className="sr-only">
        {t("priceFrom")}
      </label>
      <input id={`${idPrefix}-min`} inputMode="numeric" className={input} placeholder={placeholderMin} value={lo} onChange={(e) => setLo(e.target.value)} />
      <span aria-hidden>–</span>
      <label htmlFor={`${idPrefix}-max`} className="sr-only">
        {t("priceTo")}
      </label>
      <input id={`${idPrefix}-max`} inputMode="numeric" className={input} placeholder={placeholderMax} value={hi} onChange={(e) => setHi(e.target.value)} />
      <button type="submit" className="h-9 shrink-0 rounded-[4px] bg-[var(--shop-ink)] px-3 text-xs font-semibold text-white hover:bg-[var(--shop-ink-soft)]">
        {t("apply")}
      </button>
    </form>
  );
}

/** Bảng lọc: sinh từ facet (thương hiệu, giá, thuộc tính của danh mục) + còn hàng. Dùng chung cho cột trái và ngăn kéo mobile. */
export function FilterPanel({ idPrefix, query, facets, attributes, onChange }: FilterPanelProps) {
  const t = useTranslations("shop.catalog");
  const presetLabel = (p: { min?: number; max?: number }) => {
    if (p.min === undefined) return t("priceUnder", { max: formatPrice(p.max) });
    if (p.max === undefined) return t("priceOver", { min: formatPrice(p.min) });
    return t("priceBetween", { min: formatPrice(p.min), max: formatPrice(p.max) });
  };
  const brandFacet = facets.find((f) => f.kind === "brand");
  const priceFacet = facets.find((f) => f.kind === "price");

  const setAttr = (attrId: string, filter: AttributeFilter | undefined) => {
    const next = { ...query.attributes };
    if (filter) next[attrId] = filter;
    else delete next[attrId];
    onChange({ attributes: next });
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-[var(--c-border)] pb-4">
        <label htmlFor={`${idPrefix}-in-stock`} className="text-sm font-semibold">
          {t("inStock")}
        </label>
        <Switch id={`${idPrefix}-in-stock`} checked={query.inStock} onCheckedChange={(v) => onChange({ inStock: v })} />
      </div>

      {priceFacet && (
        <Section title={t("price")}>
          <div className="mb-3 flex flex-wrap gap-2">
            {PRICE_PRESETS.map((p) => {
              const selected = query.price?.min === p.min && query.price?.max === p.max;
              return (
                <Chip key={`${p.min}-${p.max}`} selected={selected} onSelectedChange={(on) => onChange({ price: on ? p : undefined })} className="h-8 px-2.5 text-xs">
                  {presetLabel(p)}
                </Chip>
              );
            })}
          </div>
          <RangeInputs
            key={`price-${query.price?.min}-${query.price?.max}`}
            idPrefix={`${idPrefix}-price`}
            min={query.price?.min}
            max={query.price?.max}
            placeholderMin={t("priceFrom")}
            placeholderMax={t("priceTo")}
            onApply={(price) => onChange({ price })}
          />
        </Section>
      )}

      {brandFacet && brandFacet.options.length > 0 && (
        <Section title={t("brand")}>
          {brandFacet.options.map((o) => (
            <CheckboxRow
              key={o.value}
              id={`${idPrefix}-brand-${o.value}`}
              label={o.label}
              count={o.count}
              checked={query.brandSlugs.includes(o.value)}
              onChange={(on) => onChange({ brandSlugs: on ? [...query.brandSlugs, o.value] : query.brandSlugs.filter((b) => b !== o.value) })}
            />
          ))}
        </Section>
      )}

      {facets.map((f) => {
        if (f.kind !== "attribute") return null;
        const attr = attributes.find((a) => a.id === f.attributeId);
        if (!attr) return null;
        const current = query.attributes[attr.id];
        if (f.attributeKind === "options") {
          const values = current?.kind === "options" ? current.values : [];
          return (
            <Section key={attr.id} title={attr.name}>
              {f.options.map((o) => (
                <CheckboxRow
                  key={o.value}
                  id={`${idPrefix}-${attr.slug}-${o.value}`}
                  label={o.label}
                  count={o.count}
                  checked={values.includes(o.value)}
                  onChange={(on) => {
                    const next = on ? [...values, o.value] : values.filter((v) => v !== o.value);
                    setAttr(attr.id, next.length ? { kind: "options", values: next } : undefined);
                  }}
                />
              ))}
            </Section>
          );
        }
        if (f.attributeKind === "boolean") {
          return (
            <Section key={attr.id} title={attr.name}>
              <CheckboxRow
                id={`${idPrefix}-${attr.slug}`}
                label={t("yes")}
                count={f.count}
                checked={current?.kind === "boolean"}
                onChange={(on) => setAttr(attr.id, on ? { kind: "boolean", value: true } : undefined)}
              />
            </Section>
          );
        }
        const range = current?.kind === "range" ? current : undefined;
        return (
          <Section key={attr.id} title={`${attr.name}${attr.unit ? ` (${attr.unit})` : ""}`}>
            <RangeInputs
              key={`${attr.id}-${range?.min}-${range?.max}`}
              idPrefix={`${idPrefix}-${attr.slug}`}
              min={range?.min}
              max={range?.max}
              placeholderMin={String(f.min)}
              placeholderMax={String(f.max)}
              onApply={(r) => setAttr(attr.id, r ? { kind: "range", ...r } : undefined)}
            />
          </Section>
        );
      })}
    </div>
  );
}

