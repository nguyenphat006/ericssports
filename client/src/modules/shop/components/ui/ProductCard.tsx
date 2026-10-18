"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { discountPercent } from "../../lib/formatPrice";
import type { ProductSummary } from "../../types";
import { ShopBadge } from "./Badge";
import { Price } from "./Price";
import { Rating } from "./Rating";

interface ProductCardProps {
  product: ProductSummary;
  /** Đường dẫn trang sản phẩm. GĐ1 chưa có trang chi tiết -> bỏ trống thì thẻ không phải link. */
  href?: string;
  /** Ảnh trong màn hình đầu (hero / hàng đầu) -> tải ưu tiên */
  priority?: boolean;
  className?: string;
}

/**
 * Thẻ sản phẩm (spec 3.3): khung ảnh kem lồng trong thẻ trắng, nhãn góc trên trái, thương hiệu · tên ·
 * tối đa 3 thông số chính · giá + giá gạch · đánh giá / đã bán. Không viền, không đổ bóng.
 */
export function ProductCard({ product, href, priority = false, className }: ProductCardProps) {
  const t = useTranslations("shop.product");
  const pct = discountPercent(product.compareAtPrice, product.price);
  const isNew = product.badges?.includes("new");
  const specs = product.keySpecs.slice(0, 3);

  const body = (
    <>
      <div className="relative m-1.5 aspect-square overflow-hidden rounded-[4px] bg-[var(--shop-muted)] transition-colors group-hover:bg-[#EDE6DB]">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
          priority={priority}
        />
        {(pct || isNew) && (
          <div className="absolute top-1.5 left-1.5 flex gap-1">
            {pct && <ShopBadge tone="sale">{t("discount", { percent: pct })}</ShopBadge>}
            {isNew && <ShopBadge tone="ink">{t("new")}</ShopBadge>}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col px-3 pt-1 pb-3">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--c-text-tertiary)] uppercase">{product.brand}</p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.6em] text-sm leading-[1.3] font-medium text-[var(--shop-ink)]">
          {product.name}
        </h3>
        {specs.length > 0 && (
          <p className="mt-1 line-clamp-1 text-xs text-[var(--c-text-secondary)]">{specs.map((s) => s.value).join(" · ")}</p>
        )}
        <Price value={product.price} compareAt={product.compareAtPrice} size="sm" stacked className="mt-2" />
        <Rating value={product.rating} reviewCount={product.reviewCount} soldCount={product.soldCount} className="mt-1.5" />
      </div>
    </>
  );

  const classes = cn(
    "group flex h-full flex-col overflow-hidden rounded-[6px] bg-white text-left outline-none",
    "focus-visible:ring-[3px] focus-visible:ring-ring/50",
    className,
  );

  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <article className={classes}>{body}</article>
  );
}
