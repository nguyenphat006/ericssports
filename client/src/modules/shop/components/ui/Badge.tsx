import * as React from "react";
import { cn } from "@/lib/utils";

const TONES = {
  /** Giảm giá: nền đỏ */
  sale: "bg-[var(--shop-primary)] text-white",
  /** Mới / nổi bật: nền đen */
  ink: "bg-[var(--shop-ink)] text-white",
  /** Nhẹ: nền hồng cam */
  soft: "bg-[var(--shop-accent-soft)] text-[var(--shop-ink)]",
  /** Thành công: miễn phí, còn hàng */
  success: "bg-[var(--c-success-bg)] text-[var(--c-success)]",
} as const;

export type ShopBadgeTone = keyof typeof TONES;

interface ShopBadgeProps extends React.ComponentProps<"span"> {
  tone?: ShopBadgeTone;
}

/** Nhãn nhỏ (-15%, Mới, Miễn phí). Đặt góc ảnh: bọc trong khối `relative` và truyền className vị trí. */
export function ShopBadge({ tone = "ink", className, ...props }: ShopBadgeProps) {
  return (
    <span
      className={cn("shop-display-soft inline-flex h-6 items-center rounded-[3px] px-2 text-xs", TONES[tone], className)}
      {...props}
    />
  );
}
