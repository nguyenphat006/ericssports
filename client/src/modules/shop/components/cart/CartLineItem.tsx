"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { formatPrice } from "../../lib/formatPrice";
import { MAX_LINE_QUANTITY, lineKey, useCartStore } from "../../stores/useCartStore";
import type { PricedCartLine } from "../../types";
import { QuantityStepper } from "../ui";

interface CartLineItemProps {
  line: PricedCartLine;
  /** Trang giỏ: cho bật / tắt dịch vụ thêm */
  editableServices?: boolean;
  compact?: boolean;
  onNavigate?: () => void;
}

/** Một dòng giỏ hàng: ảnh, tên, biến thể, dịch vụ, số lượng, thành tiền, cảnh báo tồn kho; xóa có hoàn tác. */
export function CartLineItem({ line, editableServices = false, compact = false, onNavigate }: CartLineItemProps) {
  const t = useTranslations("shop.cart");
  const key = lineKey(line);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const setServices = useCartStore((s) => s.setServices);
  const remove = useCartStore((s) => s.remove);
  const restore = useCartStore((s) => s.restore);

  const onRemove = () => {
    const index = useCartStore.getState().lines.findIndex((l) => lineKey(l) === key);
    const removed = remove(key);
    if (!removed) return;
    toast(t("removed", { name: line.name }), { action: { label: t("undo"), onClick: () => restore(removed, index) } });
  };

  const issue =
    line.issue === "unavailable"
      ? t("issueUnavailable")
      : line.issue === "out_of_stock"
        ? t("issueOutOfStock")
        : line.issue === "insufficient_stock"
          ? t("issueInsufficient", { stock: line.stock })
          : null;
  const href = line.productSlug ? `/san-pham/${line.productSlug}?v=${line.variantId}` : undefined;
  const thumb = compact ? "size-16" : "size-20 sm:size-24";

  return (
    <li className={cn("flex gap-3 py-4", line.issue && line.issue !== "insufficient_stock" && "opacity-70")}>
      <div className={cn("relative shrink-0 overflow-hidden rounded-[4px] bg-[var(--shop-muted)]", thumb)}>
        <Image src={line.image.src} alt={line.image.alt} fill sizes="96px" className="object-contain p-1.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            {href ? (
              <Link href={href} onClick={onNavigate} className="line-clamp-2 text-sm font-medium hover:underline">
                {line.name}
              </Link>
            ) : (
              <p className="text-sm font-medium">{line.name}</p>
            )}
            {line.variantLabel && <p className="mt-0.5 text-xs text-[var(--c-text-secondary)]">{line.variantLabel}</p>}
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={t("remove", { name: line.name })}
            className="-mt-1 -mr-1 flex size-8 shrink-0 items-center justify-center rounded-[4px] text-[var(--c-text-tertiary)] hover:bg-[var(--shop-muted)] hover:text-[var(--c-error)]"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>

        {editableServices && line.availableServices.length > 0 ? (
          <fieldset className="mt-2 space-y-1">
            <legend className="sr-only">{t("services")}</legend>
            {line.availableServices.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-2 text-xs">
                <Checkbox
                  checked={line.serviceIds.includes(s.id)}
                  onCheckedChange={(on) => setServices(key, on === true ? [...line.serviceIds, s.id] : line.serviceIds.filter((x) => x !== s.id))}
                />
                <span className="flex-1">{s.name}</span>
                <span className="tabular-nums text-[var(--c-text-secondary)]">+{formatPrice(s.price)}</span>
              </label>
            ))}
          </fieldset>
        ) : (
          line.services.length > 0 && <p className="mt-1 text-xs text-[var(--c-text-secondary)]">+ {line.services.map((s) => s.name).join(", ")}</p>
        )}

        {issue && (
          <p className="mt-1.5 text-xs font-medium text-[var(--c-error)]" role="alert">
            {issue}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          {line.issue === "unavailable" || line.issue === "out_of_stock" ? (
            <span />
          ) : (
            <QuantityStepper
              size="sm"
              value={line.quantity}
              max={Math.min(MAX_LINE_QUANTITY, Math.max(line.stock, line.quantity))}
              onChange={(n) => setQuantity(key, n)}
              itemLabel={line.name}
            />
          )}
          <div className="text-right">
            <p className="shop-price text-[15px] text-[var(--shop-primary)]">{formatPrice(line.lineTotal)}</p>
            {line.quantity > 1 && line.lineTotal > 0 && (
              <p className="text-[11px] text-[var(--c-text-tertiary)] tabular-nums">
                {line.quantity} × {formatPrice(line.unitPrice + line.servicesUnitPrice)}
              </p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
