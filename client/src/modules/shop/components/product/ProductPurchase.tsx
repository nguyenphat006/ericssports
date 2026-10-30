"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShoppingBag } from "@/modules/shop/components/icons";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { discountPercent, formatPrice } from "../../lib/formatPrice";
import { optionState, selectOption } from "../../lib/variants";
import { MAX_LINE_QUANTITY, useCartStore } from "../../stores/useCartStore";
import type { CartLine, Product, Variant } from "../../types";
import { Price, QuantityStepper, Rating, ShopBadge, ShopButton } from "../ui";
import { ProductGallery } from "./ProductGallery";
import { ShippingEstimate } from "./ShippingEstimate";

const LOW_STOCK = 5;

/**
 * Khu vực mua hàng của trang sản phẩm (spec 5.2): gallery + biến thể (đổi giá / ảnh / tồn kho tại chỗ, ?v= trên URL)
 * + dịch vụ thêm + số lượng + ước tính giao hàng + Thêm giỏ / Mua ngay; mobile có thanh mua dính đáy.
 */
export function ProductPurchase({ product, initialVariantId }: { product: Product; initialVariantId: string }) {
  const t = useTranslations("shop.product");
  const router = useRouter();
  const addToCart = useCartStore((s) => s.add);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const [variant, setVariant] = useState<Variant>(() => product.variants.find((v) => v.id === initialVariantId) ?? product.variants[0]);
  const [mediaIndex, setMediaIndex] = useState(variant.mediaIndex ?? 0);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const inStock = variant.stock > 0;
  const maxQty = Math.max(1, Math.min(variant.stock, MAX_LINE_QUANTITY));
  const pct = discountPercent(variant.compareAtPrice, variant.price);
  const servicesTotal = product.services.filter((s) => serviceIds.includes(s.id)).reduce((sum, s) => sum + s.price, 0);

  const chooseVariant = useCallback(
    (axisId: string, value: string) => {
      const next = selectOption(product, variant.options, axisId, value);
      if (!next) return;
      setVariant(next);
      setQuantity((q) => Math.max(1, Math.min(q, next.stock || 1)));
      if (next.mediaIndex !== undefined) setMediaIndex(next.mediaIndex);
      // Cập nhật ?v= không tạo lịch sử, không gọi lại server
      const url = new URL(window.location.href);
      url.searchParams.set("v", next.id);
      window.history.replaceState(null, "", url);
    },
    [product, variant.options],
  );

  const line: CartLine | null = useMemo(
    () => (inStock ? { productId: product.id, variantId: variant.id, quantity, serviceIds } : null),
    [inStock, product.id, quantity, serviceIds, variant.id],
  );

  const add = (thenCheckout: boolean) => {
    if (!line) return;
    addToCart(line);
    if (thenCheckout) {
      router.push("/thanh-toan");
      return;
    }
    // Phản hồi bằng ngăn kéo giỏ hàng (thấy ngay dòng vừa thêm + tạm tính)
    openDrawer();
  };

  const badges = (
    <>
      {pct && <ShopBadge tone="sale">{t("discount", { percent: pct })}</ShopBadge>}
      {product.badges.includes("new") && <ShopBadge tone="ink">{t("new")}</ShopBadge>}
    </>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
      <ProductGallery media={product.media} index={mediaIndex} onIndexChange={setMediaIndex} badge={badges} />

      <div>
        <p className="text-xs font-semibold tracking-[0.08em] text-[var(--c-text-tertiary)] uppercase">
          {product.brand.name} · {t("sku", { sku: variant.sku })}
        </p>
        <h1 className="shop-display mt-2 text-[32px] lg:text-[44px]">{product.name}</h1>
        <Rating value={product.rating} reviewCount={product.reviewCount} soldCount={product.soldCount} className="mt-2 text-[13px]" />

        <div className="mt-4 flex flex-wrap items-baseline gap-x-3">
          <Price value={variant.price + servicesTotal} compareAt={variant.compareAtPrice ? variant.compareAtPrice + servicesTotal : null} size="lg" />
        </div>
        <p className={cn("mt-1 text-[13px] font-medium", inStock ? (variant.stock <= LOW_STOCK ? "text-[var(--c-error)]" : "text-[var(--c-success)]") : "text-[var(--c-text-secondary)]")} aria-live="polite">
          {!inStock ? t("outOfStock") : variant.stock <= LOW_STOCK ? t("lowStock", { count: variant.stock }) : t("inStock")}
        </p>

        {product.variantAxes.map((axis) => {
          const selectedLabel = axis.values.find((v) => v.value === variant.options[axis.id])?.label;
          return (
            <fieldset key={axis.id} className="mt-5">
              <legend className="mb-2 text-sm">
                <span className="font-semibold">{axis.name}:</span> <span className="text-[var(--c-text-secondary)]">{selectedLabel}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {axis.values.map((v) => {
                  const state = optionState(product, variant.options, axis.id, v.value);
                  const selected = variant.options[axis.id] === v.value;
                  const label = state === "out_of_stock" ? t("optionOutOfStock", { value: v.label }) : state === "unavailable" ? t("optionUnavailable", { value: v.label }) : v.label;
                  return (
                    <button
                      key={v.value}
                      type="button"
                      aria-pressed={selected}
                      aria-label={label}
                      title={label}
                      disabled={state === "out_of_stock" && !selected}
                      onClick={() => chooseVariant(axis.id, v.value)}
                      className={cn(
                        "inline-flex min-h-10 items-center gap-2 rounded-[4px] border bg-white px-3 text-[13px] transition-colors",
                        selected ? "border-[1.5px] border-[var(--shop-primary)] font-semibold text-[var(--shop-primary)]" : "border-[var(--c-border-strong)] hover:border-[var(--shop-ink)]",
                        state === "out_of_stock" && "cursor-not-allowed text-[var(--c-text-tertiary)] line-through",
                        state === "unavailable" && !selected && "border-dashed text-[var(--c-text-secondary)]",
                      )}
                    >
                      {v.swatch && <span className="size-4 rounded-full border border-black/10" style={{ background: v.swatch }} aria-hidden />}
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {product.keySpecs.map((s) => (
            <div key={s.label} className="rounded-[4px] bg-white px-2 py-2.5 text-center">
              <dd className="shop-price text-[15px] text-[var(--shop-ink)]">{s.value}</dd>
              <dt className="mt-0.5 text-[11px] text-[var(--c-text-secondary)]">{s.label}</dt>
            </div>
          ))}
        </dl>

        {product.services.length > 0 && (
          <fieldset className="mt-5 rounded-[6px] bg-white p-4">
            <legend className="sr-only">{t("services")}</legend>
            <p className="mb-2 text-sm font-semibold" aria-hidden>
              {t("services")}
            </p>
            {product.services.map((s) => (
              <label key={s.id} htmlFor={`svc-${s.id}`} className="flex cursor-pointer items-start gap-2.5 py-1.5 text-sm">
                <Checkbox
                  id={`svc-${s.id}`}
                  className="mt-0.5"
                  checked={serviceIds.includes(s.id)}
                  onCheckedChange={(on) => setServiceIds((ids) => (on === true ? [...ids, s.id] : ids.filter((x) => x !== s.id)))}
                />
                <span className="flex-1">
                  {s.name}
                  {s.description && <span className="block text-xs text-[var(--c-text-secondary)]">{s.description}</span>}
                </span>
                <span className="shop-price text-[13px]">{t("servicePrice", { price: formatPrice(s.price) })}</span>
              </label>
            ))}
          </fieldset>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <QuantityStepper value={quantity} max={maxQty} onChange={setQuantity} />
          <ShopButton variant="outline" size="lg" className="hidden flex-1 sm:inline-flex" disabled={!inStock} onClick={() => add(false)}>
            <ShoppingBag />
            {t("addToCart")}
          </ShopButton>
          <ShopButton size="lg" className="hidden flex-1 sm:inline-flex" disabled={!inStock} onClick={() => add(true)}>
            {t("buyNow")}
          </ShopButton>
        </div>

        <ShippingEstimate line={line} bulky={product.bulky} />
      </div>

      {/* Thanh mua dính đáy trên điện thoại (chừa chỗ ở cuối trang bằng pb của trang) */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-[var(--c-border)] bg-white p-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:hidden">
        <ShopButton variant="outline" className="flex-1" disabled={!inStock} onClick={() => add(false)}>
          <ShoppingBag />
          {t("addToCart")}
        </ShopButton>
        <ShopButton className="flex-1" disabled={!inStock} onClick={() => add(true)}>
          {t("buyNow")}
        </ShopButton>
      </div>
    </div>
  );
}
