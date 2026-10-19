"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Chip, Container, Price, ProductCard, Rating, SectionHeading, ShopBadge, ShopButton } from "../components/ui";
import { archivo } from "../fonts";
import { MOCK_PRODUCT_LIST, toSummary } from "../mocks/products";

/** Bảng màu + tỉ lệ tương phản đã đo (kế hoạch GĐ1, Q2). Dữ liệu kỹ thuật — không cần dịch. */
const SWATCHES = [
  { name: "primary", hex: "#D4321A", note: "4.92 : 1 trắng" },
  { name: "primary-bright", hex: "#EA3A1E", note: "chữ ≥ 24px / mảng màu" },
  { name: "ink", hex: "#1C1917", note: "16.37 : 1 trên kem" },
  { name: "bg", hex: "#FAF7F2", note: "nền trang" },
  { name: "muted", hex: "#F3EEE6", note: "khung ảnh" },
  { name: "accent-soft", hex: "#F3B8A8", note: "mảng phụ" },
  { name: "text-secondary", hex: "#6B635A", note: "5.52 : 1 trên kem" },
  { name: "text-tertiary", hex: "#78706A", note: "4.54 : 1 trên kem" },
];

const DIACRITICS = "Ầ Ẩ Ẫ Ậ Ề Ể Ễ Ệ Ở Ỡ Ợ Ừ Ử Ữ Ự · đặng ưởng ỹ · 12.990.000₫";
const STRETCHES = [62, 75, 85, 100] as const;
const PROVINCES = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ"];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--c-border)] py-8">
      <h2 className="shop-display-soft mb-4 text-lg">{title}</h2>
      {children}
    </section>
  );
}

/** UI kit storefront — trang nội bộ duyệt component (route chặn ở production). */
export function UiKitView() {
  const t = useTranslations("shop.uiKit");
  const [chips, setChips] = useState<Record<string, boolean>>({ under5m: true });
  const toggle = (key: string) => (v: boolean) => setChips((s) => ({ ...s, [key]: v }));

  return (
    <Container className="py-10">
      <SectionHeading as="h1" eyebrow="GĐ1" title={t("title")} />
      <p className="-mt-2 mb-6 text-sm text-[var(--c-text-secondary)]">{t("intro")}</p>

      <Block title={t("colors")}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SWATCHES.map((s) => (
            <li key={s.name} className="overflow-hidden rounded-[6px] bg-white">
              <div className="h-16" style={{ background: s.hex }} />
              <div className="p-2.5 text-xs">
                <p className="font-semibold">{s.name}</p>
                <p className="text-[var(--c-text-secondary)] tabular-nums">{s.hex}</p>
                <p className="text-[var(--c-text-tertiary)]">{s.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </Block>

      <Block title={t("typography")}>
        <p className="shop-eyebrow text-[var(--shop-primary)]">{t("eyebrowSample")}</p>
        <p className="shop-display mt-2 text-[56px] lg:text-[88px]">{t("sampleTitle")}</p>
        <p className="shop-display-soft mt-4 text-2xl">{t("sampleTitle")}</p>
        <p className="mt-3 max-w-2xl text-[15px]">{t("sampleBody")}</p>
        <p className="shop-price mt-3 text-[28px] text-[var(--shop-primary)]">12.990.000₫</p>
      </Block>

      <Block title={t("vietnameseTest")}>
        <div className="space-y-3">
          {STRETCHES.map((w) => (
            <div key={w} className="grid gap-1 sm:grid-cols-[96px_1fr] sm:items-baseline">
              <span className="text-xs text-[var(--c-text-tertiary)] tabular-nums">wdth {w}%</span>
              <div>
                <p className="text-2xl" style={{ fontStretch: `${w}%`, fontWeight: 900 }}>
                  {DIACRITICS}
                </p>
                <p className="text-base" style={{ fontStretch: `${w}%`, fontWeight: 400 }}>
                  {DIACRITICS}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block title={t("buttons")}>
        <div className="flex flex-wrap items-center gap-3">
          <ShopButton size="lg">{t("buyNow")}</ShopButton>
          <ShopButton variant="outline" size="lg">
            <ShoppingBag />
            {t("addToCart")}
          </ShopButton>
          <ShopButton variant="ink">{t("viewAll")}</ShopButton>
          <ShopButton variant="outline-ink">{t("viewAll")}</ShopButton>
          <ShopButton variant="ghost">{t("viewAll")}</ShopButton>
          <ShopButton loading>{t("buyNow")}</ShopButton>
          <ShopButton disabled>{t("buyNow")}</ShopButton>
          <ShopButton size="sm">{t("buyNow")}</ShopButton>
        </div>
      </Block>

      <Block title={t("badges")}>
        <div className="flex flex-wrap items-center gap-2">
          <ShopBadge tone="sale">-15%</ShopBadge>
          <ShopBadge tone="ink">{t("badgeNew")}</ShopBadge>
          <ShopBadge tone="soft">{t("badgeBestseller")}</ShopBadge>
          <ShopBadge tone="success">{t("badgeFreeInstall")}</ShopBadge>
          <span className="mx-2 h-6 w-px bg-[var(--c-border)]" />
          <Chip selected={!!chips.under5m} onSelectedChange={toggle("under5m")}>
            {t("chipUnder5m")}
          </Chip>
          <Chip selected={!!chips.foldable} onSelectedChange={toggle("foldable")}>
            {t("chipFoldable")}
          </Chip>
          <Chip selected={!!chips.inStock} onSelectedChange={toggle("inStock")}>
            {t("chipInStock")}
          </Chip>
        </div>
      </Block>

      <Block title={t("prices")}>
        <div className="flex flex-wrap items-end gap-8">
          <Price value={12990000} compareAt={15290000} size="lg" />
          <Price value={890000} size="md" />
          <Price value={350000} compareAt={450000} size="sm" stacked />
          <Rating value={4.8} reviewCount={126} soldCount={1200} />
        </div>
      </Block>

      <Block title={t("inputs")}>
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Input placeholder={t("inputPlaceholder")} className="h-11 rounded-[4px] bg-white" />
          <Select>
            <SelectTrigger className="h-11 w-full rounded-[4px] bg-white">
              <SelectValue placeholder={t("selectPlaceholder")} />
            </SelectTrigger>
            <SelectContent className={cn("shop-theme", archivo.variable)}>
              {PROVINCES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox defaultChecked />
            {t("checkboxLabel")}
          </label>
        </div>
      </Block>

      <Block title={t("productCards")}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {MOCK_PRODUCT_LIST.slice(0, 4).map(toSummary).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Block>
    </Container>
  );
}
