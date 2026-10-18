"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends Omit<React.ComponentProps<"button">, "onChange"> {
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}

/** Nhãn lọc bật / tắt (bộ lọc nhanh, lựa chọn biến thể đơn giản). */
export function Chip({ selected = false, onSelectedChange, className, onClick, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) onSelectedChange?.(!selected);
      }}
      className={cn(
        "inline-flex h-9 items-center rounded-[4px] border px-3 text-[13px] font-medium transition-colors",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        selected
          ? "border-[var(--shop-ink)] bg-[var(--shop-ink)] text-white"
          : "border-[var(--c-border-strong)] bg-white text-[var(--shop-ink)] hover:border-[var(--shop-ink)]",
        className,
      )}
      {...props}
    />
  );
}
