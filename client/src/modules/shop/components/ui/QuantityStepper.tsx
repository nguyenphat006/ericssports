"use client";

import { useTranslations } from "next-intl";
import { Minus, Plus } from "@/modules/shop/components/icons";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  max: number;
  onChange: (n: number) => void;
  size?: "sm" | "md";
  /** Tên sản phẩm để nhãn trình đọc màn hình rõ dòng nào (giỏ hàng nhiều dòng) */
  itemLabel?: string;
  className?: string;
}

/** Ô số lượng − n + (giới hạn 1..max). Gõ trực tiếp được; ký tự không phải số bị bỏ. */
export function QuantityStepper({ value, max, onChange, size = "md", itemLabel, className }: QuantityStepperProps) {
  const t = useTranslations("shop.product");
  const clamp = (n: number) => Math.max(1, Math.min(Math.max(1, max), Number.isFinite(n) ? Math.floor(n) : 1));
  const box = size === "sm" ? "size-9" : "size-11";
  const btn = cn("flex items-center justify-center text-[var(--shop-ink)] transition-colors hover:bg-[var(--shop-muted)] disabled:opacity-40", box);
  const suffix = itemLabel ? ` — ${itemLabel}` : "";
  return (
    <div className={cn("inline-flex items-center rounded-[4px] border border-[var(--c-border-strong)] bg-white", size === "sm" ? "h-9" : "h-11", className)}>
      <button type="button" className={btn} aria-label={t("decrease") + suffix} disabled={value <= 1} onClick={() => onChange(clamp(value - 1))}>
        <Minus className="size-4" aria-hidden />
      </button>
      <input
        aria-label={t("quantity") + suffix}
        inputMode="numeric"
        className={cn("h-full border-x border-[var(--c-border)] text-center text-sm font-semibold tabular-nums outline-none", size === "sm" ? "w-10" : "w-12")}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value.replace(/\D/g, "")) || 1))}
      />
      <button type="button" className={btn} aria-label={t("increase") + suffix} disabled={value >= max} onClick={() => onChange(clamp(value + 1))}>
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
