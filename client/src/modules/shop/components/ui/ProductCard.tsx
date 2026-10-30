"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { discountPercent } from "../../lib/formatPrice";
import { useCartStore } from "../../stores/useCartStore";
import type { ProductSummary } from "../../types";
import { Plus, ShoppingBag } from "../icons";
import { ShopBadge } from "./Badge";
import { Price } from "./Price";
import { Rating } from "./Rating";

interface ProductCardProps {
  product: ProductSummary;
  /** Đường dẫn trang sản phẩm. Bỏ trống thì thẻ không phải link (vd. trang UI kit). */
  href?: string;
  /** Ảnh trong màn hình đầu (hero / hàng đầu) -> tải ưu tiên */
  priority?: boolean;
  className?: string;
}

const MAX_SWATCHES = 4;

/** Nút tròn góc ảnh: thêm nhanh (1 biến thể) / chọn phân loại (nhiều biến thể) */
const QUICK_BUTTON = cn(
  "absolute right-2 bottom-2 z-10 grid size-10 place-items-center rounded-full bg-white text-[var(--shop-ink)] shadow-[0_2px_8px_rgb(28_25_23/0.12)] outline-none transition",
  "hover:bg-[var(--shop-primary)] hover:text-white focus-visible:ring-[3px] focus-visible:ring-ring/50",
  // Máy tính: hiện khi rê chuột / focus; điện thoại (không hover) luôn hiện
  "lg:translate-y-1 lg:opacity-0 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:opacity-100",
);

/**
 * Thẻ sản phẩm (spec 3.3, cập nhật 2026-10-30): ảnh nền kem + nhãn góc + nút thêm nhanh · chấm màu ·
 * giá trước tên · tên · thương hiệu · đánh giá / đã bán. Không viền, không đổ bóng.
 * Cả thẻ bấm được nhờ link phủ trên tên (không bọc thẻ trong <a>) -> nút thêm giỏ không bị lồng trong link.
 */
export function ProductCard({ product, href, priority = false, className }: ProductCardProps) {
  const t = useTranslations("shop.product");
  const addToCart = useCartStore((s) => s.add);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const pct = discountPercent(product.compareAtPrice, product.price);
  const badges = [
    pct ? { key: "sale", tone: "sale" as const, label: t("discount", { percent: pct }) } : null,
    product.badges?.includes("new") ? { key: "new", tone: "ink" as const, label: t("new") } : null,
    product.badges?.includes("bestseller") ? { key: "best", tone: "soft" as const, label: t("bestseller") } : null,
  ]
    .filter((b) => b !== null)
    .slice(0, 2);
  const swatches = product.swatches ?? [];
  const outOfStock = product.inStock === false;

  const quickAdd = () => {
    if (!product.quickAddVariantId) return;
    addToCart({ productId: product.id, variantId: product.quickAddVariantId, quantity: 1, serviceIds: [] });
    openDrawer();
  };

  let quickAction: ReactNode = null;
  if (outOfStock) {
    quickAction = (
      <span className="absolute right-2 bottom-2 inline-flex h-7 items-center rounded-full bg-white/90 px-2.5 text-xs font-semibold text-[var(--c-text-secondary)]">
        {t("outOfStock")}
      </span>
    );
  } else if (product.quickAddVariantId) {
    quickAction = (
      <button type="button" onClick={quickAdd} aria-label={t("quickAdd", { name: product.name })} className={QUICK_BUTTON}>
        <Plus className="size-[18px]" />
      </button>
    );
  } else if (href) {
    quickAction = (
      <Link href={href} aria-label={t("chooseOptions", { name: product.name })} className={QUICK_BUTTON}>
        <ShoppingBag className="size-[18px]" />
      </Link>
    );
  }

  return (
    <article
      className={cn(
        // relative: chứa link phủ + các span sr-only (absolute) — không thì chúng thoát khỏi vùng cuộn ngang và làm tràn trang
        "group relative flex h-full flex-col overflow-hidden rounded-[6px] bg-white text-left",
        "has-[a[data-card-link]:focus-visible]:ring-[3px] has-[a[data-card-link]:focus-visible]:ring-ring/50",
        className,
      )}
    >
      <div className="relative m-1.5 aspect-square overflow-hidden rounded-[4px] bg-[var(--shop-muted)] transition-colors group-hover:bg-[#EDE6DB]">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
          className={cn("object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]", outOfStock && "opacity-60")}
          priority={priority}
        />
        {badges.length > 0 && (
          <div className="absolute top-1.5 left-1.5 flex gap-1">
            {badges.map((b) => (
              <ShopBadge key={b.key} tone={b.tone}>
                {b.label}
              </ShopBadge>
            ))}
          </div>
        )}
        {quickAction}
      </div>

      <div className="flex flex-1 flex-col px-3 pt-1 pb-3">
        {/* Hàng chấm màu luôn giữ chỗ -> giá / tên các thẻ trong cùng hàng thẳng nhau */}
        {swatches.length > 0 ? (
          <ul className="mb-1.5 flex h-3.5 items-center gap-1" aria-label={t("colors", { list: swatches.map((s) => s.label).join(", ") })}>
            {swatches.slice(0, MAX_SWATCHES).map((s) => (
              <li key={s.label} title={s.label} className="size-3.5 rounded-full border border-black/10" style={{ backgroundColor: s.color }} />
            ))}
            {swatches.length > MAX_SWATCHES && (
              <li className="text-[11px] font-medium text-[var(--c-text-secondary)]">{t("moreColors", { count: swatches.length - MAX_SWATCHES })}</li>
            )}
          </ul>
        ) : (
          <div className="mb-1.5 h-3.5" aria-hidden />
        )}
        <Price value={product.price} compareAt={product.compareAtPrice} size="sm" />
        <h3 className="mt-1 line-clamp-2 min-h-[2.6em] text-sm leading-[1.3] font-medium text-[var(--shop-ink)]">
          {href ? (
            <Link href={href} data-card-link className="outline-none after:absolute after:inset-0">
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </h3>
        <p className="mt-1 text-[11px] font-semibold tracking-[0.08em] text-[var(--c-text-tertiary)] uppercase">{product.brand}</p>
        <Rating value={product.rating} reviewCount={product.reviewCount} soldCount={product.soldCount} compact className="mt-1.5" />
      </div>
    </article>
  );
}
