"use client";

import { Star } from "@/modules/shop/components/icons";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatCount } from "../../lib/formatPrice";

interface RatingProps {
  value?: number | null;
  reviewCount?: number;
  soldCount?: number;
  /** Thẻ sản phẩm (hẹp): số đánh giá chỉ hiện "(740)", nhãn đầy đủ cho trình đọc màn hình */
  compact?: boolean;
  className?: string;
}

/** Điểm đánh giá · số đánh giá · đã bán (dòng phụ trên thẻ / trang sản phẩm). */
export function Rating({ value, reviewCount, soldCount, compact = false, className }: RatingProps) {
  const t = useTranslations("shop.product");
  const hasRating = typeof value === "number" && value > 0;
  if (!hasRating && !soldCount) return null;
  const reviews = reviewCount ? formatCount(reviewCount) : null;
  return (
    <div className={cn("flex flex-wrap items-center gap-x-1.5 text-xs text-[var(--c-text-secondary)]", className)}>
      {hasRating && (
        <span className="inline-flex items-center gap-1" title={t("rating", { rating: value.toFixed(1) })}>
          <Star className="size-3.5 text-[#E9A23B]" />
          <span className="font-semibold text-[var(--shop-ink)]">{value.toFixed(1)}</span>
          <span className="sr-only">{t("rating", { rating: value.toFixed(1) })}</span>
          {reviews &&
            (compact ? (
              <>
                <span aria-hidden>({reviews})</span>
                <span className="sr-only">{t("reviews", { count: reviews })}</span>
              </>
            ) : (
              <span>({t("reviews", { count: reviews })})</span>
            ))}
        </span>
      )}
      {/* Dấu chấm đi cùng "Đã bán" -> xuống dòng thì không bị dấu chấm mồ côi đầu dòng */}
      {!!soldCount && (
        <span className="whitespace-nowrap">
          {hasRating && <span aria-hidden>· </span>}
          {t("sold", { count: formatCount(soldCount) })}
        </span>
      )}
    </div>
  );
}
