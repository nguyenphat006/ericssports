"use client";

import { useTranslations } from "next-intl";
import { Truck } from "@/modules/shop/components/icons";
import { cn } from "@/lib/utils";
import { formatPrice } from "../../lib/formatPrice";
import type { PricedCart } from "../../types";

/** Thanh tiến độ "Mua thêm X để được miễn phí vận chuyển" */
export function FreeShippingProgress({ cart }: { cart: PricedCart }) {
  const t = useTranslations("shop.cart");
  const pct = Math.min(100, Math.round((cart.subtotal / cart.freeShippingThreshold) * 100));
  const reached = cart.amountToFreeShipping === 0;
  return (
    <div className="rounded-[6px] bg-[var(--shop-muted)] p-3 text-xs">
      <p className="flex items-center gap-2">
        <Truck className={cn("size-4 shrink-0", reached ? "text-[var(--c-success)]" : "text-[var(--shop-primary)]")} aria-hidden />
        {reached ? t("freeShippingReached") : t("freeShippingProgress", { amount: formatPrice(cart.amountToFreeShipping) })}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className={cn("h-full rounded-full transition-all", reached ? "bg-[var(--c-success)]" : "bg-[var(--shop-primary)]")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Tạm tính / phí ship / tổng — dùng ở ngăn kéo, trang giỏ, trang thanh toán. */
export function CartTotals({ cart, showShipping = true }: { cart: PricedCart; showShipping?: boolean }) {
  const t = useTranslations("shop.cart");
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-[var(--c-text-secondary)]">{t("subtotal")}</dt>
        <dd className="font-semibold tabular-nums">{formatPrice(cart.subtotal)}</dd>
      </div>
      {showShipping && (
        <div className="flex justify-between">
          <dt className="text-[var(--c-text-secondary)]">{t("shipping")}</dt>
          <dd className={cn("tabular-nums", cart.shipping?.fee === 0 && "font-semibold text-[var(--c-success)]")}>
            {!cart.shipping ? <span className="text-[var(--c-text-tertiary)]">{t("shippingChooseProvince")}</span> : cart.shipping.fee === 0 ? t("shippingFree") : formatPrice(cart.shipping.fee)}
          </dd>
        </div>
      )}
      <div className="flex items-baseline justify-between border-t border-[var(--c-border)] pt-3">
        <dt className="font-semibold">{t("total")}</dt>
        <dd className="text-right">
          <span className="shop-price block text-[22px] text-[var(--shop-primary)]">{formatPrice(showShipping ? cart.total : cart.subtotal)}</span>
          <span className="text-[11px] text-[var(--c-text-tertiary)]">{t("vatNote")}</span>
        </dd>
      </div>
    </dl>
  );
}
