"use client";

import { useTranslations } from "next-intl";
import { CreditCard, RotateCcw, ShieldCheck, Truck } from "@/modules/shop/components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";
import { formatPrice } from "../../lib/formatPrice";
import { useCartPricing, useProvinces } from "../../hooks/useShopQueries";
import { useShopPrefs } from "../../stores/useShopPrefs";
import { archivo } from "../../fonts";
import type { CartLine } from "../../types";

/** Ước tính phí + thời gian giao theo tỉnh (nhớ tỉnh đã chọn) + cam kết ngắn. */
export function ShippingEstimate({ line, bulky }: { line: CartLine | null; bulky: boolean }) {
  const t = useTranslations("shop.product");
  // Tỉnh đã lưu ở localStorage chỉ dùng sau khi mount -> lần render đầu khớp HTML server
  const mounted = useMounted();
  const savedProvince = useShopPrefs((s) => s.provinceCode);
  const provinceCode = mounted ? savedProvince : null;
  const setProvince = useShopPrefs((s) => s.setProvince);
  const { data: provinces } = useProvinces();
  const { data: cart } = useCartPricing(line ? [line] : [], { provinceCode });
  const quote = cart?.shipping;

  return (
    <div className="mt-5 space-y-2.5 rounded-[6px] bg-white p-4 text-sm">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Truck className="size-4 shrink-0 text-[var(--c-text-secondary)]" aria-hidden />
        <span className="text-[var(--c-text-secondary)]">{t("deliverTo")}</span>
        <Select value={provinceCode ? String(provinceCode) : undefined} onValueChange={(v) => v && setProvince(Number(v))}>
          <SelectTrigger size="sm" className="h-8 min-w-[180px] rounded-[4px] border-[var(--c-border-strong)] bg-white text-[13px] font-medium" aria-label={t("deliverTo")}>
            <SelectValue placeholder={t("chooseProvince")} />
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
      {quote && (
        <p className="pl-6" aria-live="polite">
          <span className={cn("font-semibold", quote.free && "text-[var(--c-success)]")}>
            {quote.fee === 0 ? t("shippingFree") : t("shippingFee", { fee: formatPrice(quote.fee) })}
          </span>
          <span className="text-[var(--c-text-secondary)]">
            {" · "}
            {quote.etaDays[0] === 0 ? t("etaSameDay") : t("eta", { min: quote.etaDays[0], max: quote.etaDays[1] })}
          </span>
        </p>
      )}
      {bulky && <p className="pl-6 text-xs text-[var(--c-text-secondary)]">{t("bulkyNote")}</p>}
      <ul className="grid gap-1.5 border-t border-[var(--c-border)] pt-2.5 text-[13px] text-[var(--c-text-secondary)] sm:grid-cols-2">
        <li className="flex items-center gap-2">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          {t("warranty")}
        </li>
        <li className="flex items-center gap-2">
          <RotateCcw className="size-4 shrink-0" aria-hidden />
          {t("returns")}
        </li>
        <li className="flex items-center gap-2 sm:col-span-2">
          <CreditCard className="size-4 shrink-0" aria-hidden />
          {t("payments")}
        </li>
      </ul>
    </div>
  );
}
