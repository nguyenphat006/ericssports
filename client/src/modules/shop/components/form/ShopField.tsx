"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/** Lớp ô nhập storefront (dùng cho input / textarea) */
export const SHOP_INPUT =
  "h-11 w-full rounded-[4px] border border-[var(--c-border-strong)] bg-white px-3 text-sm text-[var(--shop-ink)] outline-none transition-colors placeholder:text-[var(--c-text-tertiary)] focus:border-[var(--shop-ink)] focus:ring-[3px] focus:ring-ring/20 aria-[invalid=true]:border-[var(--c-error)]";

interface ShopFieldProps {
  id: string;
  label: string;
  /** Khóa lỗi trong `shop.checkout.errors` */
  error?: string;
  hint?: string;
  className?: string;
  /** Ô nhập (input, textarea, Combobox...) — được gắn id, aria-invalid, aria-describedby */
  children: React.ReactElement<Record<string, unknown>>;
}

/** Nhãn + ô nhập + gợi ý + lỗi (gắn aria-describedby / aria-invalid cho ô nhập con). */
export function ShopField({ id, label, error, hint, className, children }: ShopFieldProps) {
  const t = useTranslations("shop.checkout.errors");
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-[var(--shop-ink)]">
        {label}
      </label>
      {React.cloneElement(children, { id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-[var(--c-text-secondary)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs font-medium text-[var(--c-error)]">
          {t.has(error as never) ? t(error as never) : error}
        </p>
      )}
    </div>
  );
}

export function FormCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[6px] bg-white p-4 lg:p-6", className)}>
      <h2 className="shop-display-soft mb-4 text-lg">{title}</h2>
      {children}
    </section>
  );
}
