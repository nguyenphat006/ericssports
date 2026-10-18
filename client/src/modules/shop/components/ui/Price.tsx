"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatPrice } from "../../lib/formatPrice";

const SIZES = {
  sm: { price: "text-[15px]", compare: "text-xs" },
  md: { price: "text-lg", compare: "text-[13px]" },
  lg: { price: "text-[28px]", compare: "text-sm" },
} as const;

interface PriceProps {
  value: number;
  /** Giá gốc trước giảm — chỉ hiện khi lớn hơn giá bán */
  compareAt?: number | null;
  size?: keyof typeof SIZES;
  /** Giá gạch xuống dòng (thẻ hẹp) hay cùng dòng */
  stacked?: boolean;
  className?: string;
}

/** Giá bán (đỏ, số thẳng cột) + giá gốc gạch ngang. */
export function Price({ value, compareAt, size = "md", stacked = false, className }: PriceProps) {
  const t = useTranslations("shop.product");
  const showCompare = !!compareAt && compareAt > value;
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2", stacked && "flex-col gap-0", className)}>
      <span className={cn("shop-price text-[var(--shop-primary)]", SIZES[size].price)}>{formatPrice(value)}</span>
      {showCompare && (
        <>
          <s className={cn("text-[var(--c-text-tertiary)] tabular-nums", SIZES[size].compare)} aria-hidden>
            {formatPrice(compareAt)}
          </s>
          {/* Thẻ <s> không được trình đọc màn hình đọc là "giá cũ" -> thêm nhãn rõ nghĩa */}
          <span className="sr-only">{t("compareAt", { price: formatPrice(compareAt) })}</span>
        </>
      )}
    </div>
  );
}
