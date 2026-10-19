"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { archivo } from "../fonts";
import { useCart } from "../hooks/useCart";
import { useProvinces } from "../hooks/useShopQueries";
import { useShopPrefs } from "../stores/useShopPrefs";
import { Container, ShopButton } from "../components/ui";
import { CartLineItem } from "../components/cart/CartLineItem";
import { CartTotals, FreeShippingProgress } from "../components/cart/CartSummary";

/** Trang giỏ hàng đầy đủ: sửa số lượng / dịch vụ, xóa (hoàn tác), ước tính phí ship theo tỉnh, sang thanh toán. */
export function CartView() {
  const t = useTranslations("shop.cart");
  const tp = useTranslations("shop.product");
  const { mounted, lines, cart, isLoading, provinceCode } = useCart();
  const setProvince = useShopPrefs((s) => s.setProvince);
  const { data: provinces } = useProvinces();

  return (
    <Container className="py-6 lg:py-10">
      <h1 className="shop-display text-[36px] lg:text-[56px]">{t("title")}</h1>

      {!mounted || isLoading ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-64 rounded-[6px]" />
          <Skeleton className="h-64 rounded-[6px]" />
        </div>
      ) : lines.length === 0 || !cart ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-[6px] bg-white px-6 py-16 text-center">
          <ShoppingBag className="size-12 text-[var(--c-text-tertiary)]" aria-hidden />
          <p className="shop-display-soft text-xl">{t("empty")}</p>
          <p className="text-sm text-[var(--c-text-secondary)]">{t("emptyText")}</p>
          <ShopButton asChild className="mt-2">
            <Link href="/">{t("continueShopping")}</Link>
          </ShopButton>
        </div>
      ) : (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
          <section className="rounded-[6px] bg-white px-4 lg:px-6" aria-label={t("itemCount", { count: cart.itemCount })}>
            <ul className="divide-y divide-[var(--c-border)]">
              {cart.lines.map((l) => (
                <CartLineItem key={`${l.variantId}|${l.serviceIds.join(",")}`} line={l} editableServices />
              ))}
            </ul>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-[132px]" aria-label={t("summary")}>
            <FreeShippingProgress cart={cart} />
            <div className="space-y-4 rounded-[6px] bg-white p-5">
              <h2 className="shop-display-soft text-lg">{t("summary")}</h2>
              <div>
                <label htmlFor="cart-province" className="mb-1.5 block text-[13px] text-[var(--c-text-secondary)]">
                  {tp("deliverTo")}
                </label>
                <Select value={provinceCode ? String(provinceCode) : undefined} onValueChange={(v) => v && setProvince(Number(v))}>
                  <SelectTrigger id="cart-province" className="h-10 w-full rounded-[4px] bg-white">
                    <SelectValue placeholder={tp("chooseProvince")} />
                  </SelectTrigger>
                  <SelectContent className={cn("shop-theme max-h-72", archivo.variable)}>
                    {provinces?.map((p) => (
                      <SelectItem key={p.code} value={String(p.code)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CartTotals cart={cart} />
              {cart.hasIssues && (
                <p className="text-xs text-[var(--c-error)]" role="alert">
                  {t("fixIssues")}
                </p>
              )}
              {cart.hasIssues ? (
                <ShopButton size="lg" className="w-full" disabled>
                  {t("checkout")}
                </ShopButton>
              ) : (
                <ShopButton size="lg" className="w-full" asChild>
                  <Link href="/thanh-toan">{t("checkout")}</Link>
                </ShopButton>
              )}
              <Link href="/" className="block text-center text-sm font-medium text-[var(--c-text-secondary)] hover:underline">
                {t("continueShopping")}
              </Link>
            </div>
          </aside>
        </div>
      )}
    </Container>
  );
}
