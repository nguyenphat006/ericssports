"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface RatingProps {
  value?: number | null;
  reviewCount?: number;
  soldCount?: number;
  className?: string;
}

const compact = new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 });

/** Điểm đánh giá · số đánh giá · đã bán (dòng phụ trên thẻ / trang sản phẩm). */
export function Rating({ value, reviewCount, soldCount, className }: RatingProps) {
  const t = useTranslations("shop.product");
  const hasRating = typeof value === "number" && value > 0;
  if (!hasRating && !soldCount) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-x-1.5 text-xs text-[var(--c-text-secondary)]", className)}>
      {hasRating && (
        <span className="inline-flex items-center gap-1" title={t("rating", { rating: value.toFixed(1) })}>
          <Star className="size-3.5 fill-[#E9A23B] text-[#E9A23B]" aria-hidden />
          <span className="font-semibold text-[var(--shop-ink)]">{value.toFixed(1)}</span>
          <span className="sr-only">{t("rating", { rating: value.toFixed(1) })}</span>
          {!!reviewCount && <span>({t("reviews", { count: compact.format(reviewCount) })})</span>}
        </span>
      )}
      {hasRating && !!soldCount && <span aria-hidden>·</span>}
      {!!soldCount && <span>{t("sold", { count: compact.format(soldCount) })}</span>}
    </div>
  );
}
