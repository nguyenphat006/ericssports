"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FlaskConical } from "lucide-react";
import { formatPrice } from "../lib/formatPrice";
import { orderService, type MockPaymentResult } from "../services";
import { Container, ShopButton } from "../components/ui";

/**
 * Cổng thanh toán GIẢ LẬP (quyết định Q3-A, GĐ2) — trang trung tính, không dùng logo / giao diện của VNPay hay MoMo.
 * Bấm kết quả = mô phỏng IPN cập nhật đơn, rồi quay về trang đơn như return URL thật. GĐ6 thay bằng cổng thật.
 */
export function MockGatewayView({ code, gateway }: { code: string; gateway: string }) {
  const t = useTranslations("shop.gateway");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<MockPaymentResult | null>(null);
  const { data: order, isError } = useQuery({ queryKey: ["shop", "order", code, "gateway"], queryFn: () => orderService.getOrder(code), retry: false });

  const finish = async (result: MockPaymentResult) => {
    setBusy(result);
    try {
      await orderService.completeMockPayment?.(code, result);
    } finally {
      // Bỏ dữ liệu đơn cũ trong cache -> trang đơn hiển thị trạng thái mới, không nháy trạng thái cũ
      queryClient.removeQueries({ queryKey: ["shop", "order", code] });
      router.replace(`/don-hang/${code}`);
    }
  };

  return (
    <Container className="max-w-xl py-10">
      <div className="rounded-[6px] border-2 border-dashed border-[var(--c-border-strong)] bg-white p-6">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[var(--c-text-tertiary)] uppercase">
          <FlaskConical className="size-4" aria-hidden />
          {t("title")}
        </p>
        <p className="mt-2 text-sm text-[var(--c-text-secondary)]">{t("intro")}</p>
        {isError || (order && order.status !== "pending_payment") ? (
          <p className="mt-6 text-sm font-medium text-[var(--c-error)]">{t("expired")}</p>
        ) : (
          order && (
            <>
              <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-[var(--c-text-secondary)]">{t("order")}</dt>
                  <dd className="font-mono font-semibold">{order.code}</dd>
                </div>
                <div>
                  <dt className="text-[var(--c-text-secondary)]">{t("method")}</dt>
                  <dd className="font-semibold uppercase">{gateway}</dd>
                </div>
                <div>
                  <dt className="text-[var(--c-text-secondary)]">{t("amount")}</dt>
                  <dd className="shop-price text-[var(--shop-primary)]">{formatPrice(order.total)}</dd>
                </div>
              </dl>
              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                <ShopButton loading={busy === "success"} disabled={!!busy} onClick={() => finish("success")}>
                  {t("success")}
                </ShopButton>
                <ShopButton variant="outline" loading={busy === "failed"} disabled={!!busy} onClick={() => finish("failed")}>
                  {t("failed")}
                </ShopButton>
                <ShopButton variant="ghost" loading={busy === "cancelled"} disabled={!!busy} onClick={() => finish("cancelled")}>
                  {t("cancel")}
                </ShopButton>
              </div>
            </>
          )
        )}
      </div>
    </Container>
  );
}
