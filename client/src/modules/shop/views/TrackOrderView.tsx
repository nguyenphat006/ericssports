"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { isVietnamesePhone } from "../lib/validation";
import { orderService } from "../services";
import type { Order } from "../types";
import { Container, ShopButton } from "../components/ui";
import { FormCard, SHOP_INPUT, ShopField } from "../components/form/ShopField";
import { OrderDetail } from "../components/order/OrderDetail";

interface TrackForm {
  code: string;
  phone: string;
}

/** Tra cứu đơn cho khách vãng lai: mã đơn + SĐT đặt hàng. Kết quả hiển thị ngay tại trang (không đưa SĐT lên URL). */
export function TrackOrderView() {
  const t = useTranslations("shop.track");
  const to = useTranslations("shop.order");
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { register, handleSubmit, formState } = useForm<TrackForm>({ defaultValues: { code: "", phone: "" } });

  const onSubmit = handleSubmit(async ({ code, phone }) => {
    setNotFound(false);
    try {
      setOrder(await orderService.getOrder(code.trim(), { phone }));
    } catch {
      setOrder(null);
      setNotFound(true);
    }
  });

  return (
    <Container className="py-6 lg:py-10">
      <h1 className="shop-display text-[36px] lg:text-[56px]">{t("title")}</h1>
      <p className="mt-1 text-[var(--c-text-secondary)]">{t("intro")}</p>

      <FormCard title={t("title")} className="mt-6 max-w-2xl [&>h2]:sr-only">
        <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <ShopField id="track-code" label={t("code")} error={formState.errors.code ? t("codeRequired") : undefined}>
            <input className={SHOP_INPUT} placeholder={t("codePlaceholder")} autoCapitalize="characters" {...register("code", { required: true })} />
          </ShopField>
          <ShopField id="track-phone" label={t("phone")} error={formState.errors.phone ? "phoneInvalid" : undefined}>
            <input className={SHOP_INPUT} type="tel" inputMode="tel" {...register("phone", { validate: isVietnamesePhone })} />
          </ShopField>
          <ShopButton type="submit" size="lg" loading={formState.isSubmitting}>
            {t("submit")}
          </ShopButton>
        </form>
        {notFound && (
          <p role="alert" className="mt-3 text-sm font-medium text-[var(--c-error)]">
            {t("notFound")}
          </p>
        )}
      </FormCard>

      {order && (
        <div className="mt-8">
          <h2 className="shop-display mb-4 text-[28px]">{to("title", { code: order.code })}</h2>
          <OrderDetail order={order} />
        </div>
      )}
    </Container>
  );
}
