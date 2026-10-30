"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShoppingBag } from "@/modules/shop/components/icons";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { archivo } from "../../fonts";
import { useCart } from "../../hooks/useCart";
import { useCartStore } from "../../stores/useCartStore";
import { ShopButton } from "../ui";
import { CartLineItem } from "./CartLineItem";
import { CartTotals, FreeShippingProgress } from "./CartSummary";

/** Ngăn kéo giỏ hàng (mở sau khi thêm sản phẩm hoặc bấm icon giỏ). */
export function CartDrawer() {
  const t = useTranslations("shop.cart");
  const open = useCartStore((s) => s.drawerOpen);
  const setOpen = useCartStore((s) => s.setDrawerOpen);
  const { lines, cart } = useCart();
  const close = () => setOpen(false);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className={cn("shop-theme flex w-full max-w-md flex-col gap-0 p-0", archivo.variable)}>
        <div className="border-b border-[var(--c-border)] px-4 py-4">
          <SheetTitle className="shop-display-soft text-lg">{t("drawerTitle", { count })}</SheetTitle>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <ShoppingBag className="size-10 text-[var(--c-text-tertiary)]" aria-hidden />
            <p className="font-semibold">{t("empty")}</p>
            <ShopButton variant="outline-ink" onClick={close} asChild>
              <Link href="/">{t("continueShopping")}</Link>
            </ShopButton>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              {cart && (
                <div className="pt-4">
                  <FreeShippingProgress cart={cart} />
                </div>
              )}
              <ul className="divide-y divide-[var(--c-border)]">
                {cart?.lines.map((l) => <CartLineItem key={`${l.variantId}|${l.serviceIds.join(",")}`} line={l} compact onNavigate={close} />)}
              </ul>
            </div>
            {cart && (
              <div className="space-y-3 border-t border-[var(--c-border)] p-4">
                <CartTotals cart={cart} showShipping={false} />
                {cart.hasIssues && <p className="text-xs text-[var(--c-error)]">{t("fixIssues")}</p>}
                <div className="flex gap-2">
                  <ShopButton variant="outline-ink" className="flex-1" asChild>
                    <Link href="/gio-hang" onClick={close}>
                      {t("viewCart")}
                    </Link>
                  </ShopButton>
                  {cart.hasIssues ? (
                    <ShopButton className="flex-1" disabled>
                      {t("checkout")}
                    </ShopButton>
                  ) : (
                    <ShopButton className="flex-1" asChild>
                      <Link href="/thanh-toan" onClick={close}>
                        {t("checkout")}
                      </Link>
                    </ShopButton>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
