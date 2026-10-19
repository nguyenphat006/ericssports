"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Banknote, ChevronDown, CreditCard, Landmark, ShieldCheck, Wallet, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CHECKOUT_DEFAULTS, checkoutSchema, type CheckoutFormValues } from "../lib/checkoutSchema";
import { formatPrice } from "../lib/formatPrice";
import { useCart } from "../hooks/useCart";
import { useProvinces, useWards } from "../hooks/useShopQueries";
import { orderService, ShopServiceError } from "../services";
import { useCartStore } from "../stores/useCartStore";
import { useShopPrefs } from "../stores/useShopPrefs";
import type { PaymentMethod, ShippingMethod } from "../types";
import { Container, ShopButton } from "../components/ui";
import { CartTotals } from "../components/cart/CartSummary";
import { AddressFields } from "../components/form/AddressFields";
import { FormCard, SHOP_INPUT, ShopField } from "../components/form/ShopField";

const PAYMENTS: { id: PaymentMethod; icon: LucideIcon }[] = [
  { id: "cod", icon: Banknote },
  { id: "bank_transfer", icon: Landmark },
  { id: "vnpay", icon: CreditCard },
  { id: "momo", icon: Wallet },
];

function newIdempotencyKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

/** Thẻ lựa chọn dạng radio (cách giao, phương thức thanh toán) */
function OptionCard({
  name,
  value,
  checked,
  disabled,
  onSelect,
  title,
  hint,
  aside,
  icon: Icon,
}: {
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  hint?: string;
  aside?: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-[6px] border p-3.5 transition-colors",
        checked ? "border-[1.5px] border-[var(--shop-primary)] bg-[var(--c-primary-bg)]" : "border-[var(--c-border-strong)] hover:border-[var(--shop-ink)]",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={onSelect} className="mt-0.5 size-4 accent-[var(--shop-primary)]" />
      {Icon && <Icon className="mt-0.5 size-5 shrink-0 text-[var(--c-text-secondary)]" aria-hidden />}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        {hint && <span className="mt-0.5 block text-xs text-[var(--c-text-secondary)]">{hint}</span>}
      </span>
      {aside && <span className="shrink-0 text-sm font-semibold tabular-nums">{aside}</span>}
    </label>
  );
}

/**
 * Thanh toán 1 trang, không bắt buộc đăng nhập (spec 5.3): liên hệ → địa chỉ → cách giao → thanh toán → ghi chú;
 * tóm tắt đơn bên phải (mobile thu gọn ở trên). Giá được tính lại khi đặt hàng; giỏ đổi giá / hết hàng -> dừng, báo rõ.
 */
export function CheckoutView() {
  const t = useTranslations("shop.checkout");
  const tc = useTranslations("shop.cart");
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clear);
  const savedProvince = useShopPrefs((s) => s.provinceCode);
  const setPrefProvince = useShopPrefs((s) => s.setProvince);
  // Khóa chống gửi lặp: giữ nguyên khi bấm lại cùng một yêu cầu, đổi khi yêu cầu thất bại
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [cartChanged, setCartChanged] = useState(false);

  const form = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutSchema), defaultValues: CHECKOUT_DEFAULTS, mode: "onTouched" });
  const { register, setValue, handleSubmit, formState } = form;
  const [provinceCode, shippingMethod, paymentMethod, wardCode] = useWatch({ control: form.control, name: ["provinceCode", "shippingMethod", "paymentMethod", "wardCode"] });

  const { mounted, lines, cart, isLoading } = useCart({ provinceCode: provinceCode || null, method: shippingMethod });
  const { data: provinces } = useProvinces();
  const { data: wards } = useWards(provinceCode || null);

  // Gợi ý sẵn tỉnh khách đã chọn ở trang sản phẩm / giỏ hàng
  const prefilled = useRef(false);
  useEffect(() => {
    if (!mounted || prefilled.current) return;
    prefilled.current = true;
    if (savedProvince && !form.getValues("provinceCode")) setValue("provinceCode", savedProvince);
  }, [form, mounted, savedProvince, setValue]);

  // Vùng không có giao nhanh -> tự về tiêu chuẩn
  const availableMethods = cart?.availableMethods;
  const methods = useMemo(() => availableMethods ?? ["standard"], [availableMethods]);
  useEffect(() => {
    if (shippingMethod === "express" && !methods.includes("express")) setValue("shippingMethod", "standard");
  }, [methods, setValue, shippingMethod]);

  const online = paymentMethod === "vnpay" || paymentMethod === "momo";
  const errors = formState.errors;

  const onSubmit = handleSubmit(async (values) => {
    const province = provinces?.find((p) => p.code === values.provinceCode);
    const ward = wards?.find((w) => w.code === values.wardCode);
    if (!province || !ward) return;
    setCartChanged(false);
    try {
      const order = await orderService.placeOrder({
        contact: { name: values.name.trim(), phone: values.phone, ...(values.email && { email: values.email.trim() }) },
        address: {
          recipient: values.name.trim(),
          phone: values.phone,
          provinceCode: province.code,
          provinceName: province.name,
          wardCode: ward.code,
          wardName: ward.name,
          street: values.street.trim(),
        },
        shippingMethod: values.shippingMethod as ShippingMethod,
        paymentMethod: values.paymentMethod as PaymentMethod,
        ...(values.note.trim() && { note: values.note.trim() }),
        lines,
        idempotencyKey,
      });
      setPrefProvince(province.code);
      clearCart();
      router.replace(online ? await orderService.getPaymentUrl(order.code) : `/don-hang/${order.code}`);
    } catch (err) {
      // Lần bấm sau là yêu cầu mới (giỏ có thể đã đổi)
      setIdempotencyKey(newIdempotencyKey());
      if (err instanceof ShopServiceError && err.code === "cart_changed") {
        setCartChanged(true);
        await queryClient.invalidateQueries({ queryKey: ["shop", "pricing"] });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(t("errors.generic"));
      }
    }
  });

  const summary = useMemo(
    () =>
      cart && (
        <div className="space-y-4">
          <ul className="space-y-3">
            {cart.lines.map((l) => (
              <li key={`${l.variantId}|${l.serviceIds.join(",")}`} className="flex gap-3 text-sm">
                <span className="relative size-14 shrink-0">
                  <span className="relative block size-full overflow-hidden rounded-[4px] bg-[var(--shop-muted)]">
                    <Image src={l.image.src} alt="" fill sizes="56px" className="object-contain p-1" />
                  </span>
                  {/* Badge số lượng nằm ngoài khung ảnh (overflow-hidden) để không bị cắt */}
                  <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-[var(--shop-ink)] text-[10px] font-bold text-white">{l.quantity}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 font-medium">{l.name}</span>
                  <span className="block text-xs text-[var(--c-text-secondary)]">
                    {[l.variantLabel, ...l.services.map((s) => s.name)].filter(Boolean).join(" · ")}
                  </span>
                  {l.issue && <span className="block text-xs font-medium text-[var(--c-error)]">{tc(l.issue === "insufficient_stock" ? "issueInsufficient" : l.issue === "out_of_stock" ? "issueOutOfStock" : "issueUnavailable", { stock: l.stock })}</span>}
                </span>
                <span className="shrink-0 font-semibold tabular-nums">{formatPrice(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <CartTotals cart={cart} />
        </div>
      ),
    [cart, tc],
  );

  if (!mounted || isLoading) {
    return (
      <Container className="py-8">
        <Skeleton className="h-10 w-48" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
          <Skeleton className="h-[480px] rounded-[6px]" />
          <Skeleton className="h-72 rounded-[6px]" />
        </div>
      </Container>
    );
  }

  if (!lines.length || !cart) {
    return (
      <Container className="py-16 text-center">
        <p className="shop-display-soft text-xl">{t("emptyCart")}</p>
        <ShopButton asChild className="mt-5">
          <Link href="/">{tc("continueShopping")}</Link>
        </ShopButton>
      </Container>
    );
  }

  const blocked = cart.hasIssues;

  return (
    <Container className="py-6 lg:py-10">
      <Link href="/gio-hang" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--c-text-secondary)] hover:text-[var(--shop-ink)]">
        <ArrowLeft className="size-4" aria-hidden />
        {t("backToCart")}
      </Link>
      <h1 className="shop-display mt-2 text-[36px] lg:text-[56px]">{t("title")}</h1>

      {(cartChanged || blocked) && (
        <div role="alert" className="mt-4 rounded-[6px] border border-[var(--c-error)] bg-[var(--c-error-bg)] p-4 text-sm text-[var(--c-error)]">
          {t("cartChanged")}{" "}
          <Link href="/gio-hang" className="font-semibold underline">
            {t("backToCart")}
          </Link>
        </div>
      )}

      {/* Mobile: tóm tắt thu gọn ở trên */}
      <div className="mt-5 rounded-[6px] bg-white lg:hidden">
        <button type="button" onClick={() => setSummaryOpen((v) => !v)} aria-expanded={summaryOpen} className="flex w-full items-center justify-between p-4 text-sm font-semibold">
          <span className="inline-flex items-center gap-1">
            {summaryOpen ? t("hideSummary") : t("showSummary", { count: cart.itemCount })}
            <ChevronDown className={cn("size-4 transition-transform", summaryOpen && "rotate-180")} aria-hidden />
          </span>
          <span className="shop-price text-[var(--shop-primary)]">{formatPrice(cart.total)}</span>
        </button>
        {summaryOpen && <div className="border-t border-[var(--c-border)] p-4">{summary}</div>}
      </div>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate className="mt-5 grid items-start gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
          <div className="space-y-4">
            <FormCard title={t("contact")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <ShopField id="co-name" label={t("name")} error={errors.name?.message} className="sm:col-span-2">
                  <input className={SHOP_INPUT} autoComplete="name" {...register("name")} />
                </ShopField>
                <ShopField id="co-phone" label={t("phone")} error={errors.phone?.message}>
                  <input className={SHOP_INPUT} type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} />
                </ShopField>
                <ShopField id="co-email" label={t("email")} hint={t("emailHint")} error={errors.email?.message}>
                  <input className={SHOP_INPUT} type="email" autoComplete="email" {...register("email")} />
                </ShopField>
              </div>
            </FormCard>

            <FormCard title={t("address")}>
              <AddressFields<CheckoutFormValues> idPrefix="co" />
            </FormCard>

            <FormCard title={t("shippingMethod")}>
              {!provinceCode || !wardCode ? (
                <p className="text-sm text-[var(--c-text-secondary)]">{t("chooseProvinceFirst")}</p>
              ) : (
                <div className="grid gap-2" role="radiogroup" aria-label={t("shippingMethod")}>
                  {(["standard", "express"] as const).map((m) => {
                    const available = methods.includes(m);
                    const quote = cart.shipping?.method === m ? cart.shipping : null;
                    return (
                      <OptionCard
                        key={m}
                        name="shippingMethod"
                        value={m}
                        checked={shippingMethod === m}
                        disabled={!available}
                        onSelect={() => setValue("shippingMethod", m)}
                        title={t(m)}
                        hint={m === "express" ? t("expressHint") : undefined}
                        aside={quote ? (quote.fee === 0 ? tc("shippingFree") : formatPrice(quote.fee)) : undefined}
                      />
                    );
                  })}
                </div>
              )}
            </FormCard>

            <FormCard title={t("payment")}>
              <div className="grid gap-2" role="radiogroup" aria-label={t("payment")}>
                {PAYMENTS.map((p) => (
                  <OptionCard
                    key={p.id}
                    name="paymentMethod"
                    value={p.id}
                    checked={paymentMethod === p.id}
                    onSelect={() => setValue("paymentMethod", p.id)}
                    title={t(p.id)}
                    hint={t(`${p.id}Hint`)}
                    icon={p.icon}
                  />
                ))}
              </div>
            </FormCard>

            <FormCard title={t("note")}>
              <ShopField id="co-note" label={t("note")} error={errors.note?.message} className="[&>label]:sr-only">
                <textarea className={cn(SHOP_INPUT, "h-24 resize-y py-2.5")} placeholder={t("notePlaceholder")} {...register("note")} />
              </ShopField>
            </FormCard>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-[132px]">
            <div className="hidden rounded-[6px] bg-white p-5 lg:block">
              <h2 className="shop-display-soft mb-4 text-lg">{tc("summary")}</h2>
              {summary}
            </div>
            <div className="rounded-[6px] bg-white p-5">
              <ShopButton type="submit" size="lg" className="w-full" loading={formState.isSubmitting} disabled={blocked}>
                {formState.isSubmitting ? t("placing") : online ? t("placeOrderPay") : t("placeOrder")}
              </ShopButton>
              <p className="mt-3 flex gap-2 text-xs text-[var(--c-text-secondary)]">
                <ShieldCheck className="size-4 shrink-0" aria-hidden />
                {t("agree")}
              </p>
            </div>
          </aside>
        </form>
      </FormProvider>
    </Container>
  );
}
