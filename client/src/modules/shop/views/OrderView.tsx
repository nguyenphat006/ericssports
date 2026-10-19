"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { orderService } from "../services";
import { Container, ShopButton } from "../components/ui";
import { OrderDetail } from "../components/order/OrderDetail";

/**
 * Trang kết quả / theo dõi đơn. Xem được khi đơn đặt trên trình duyệt này hoặc thuộc khách đang đăng nhập;
 * còn lại hướng sang tra cứu bằng SĐT (không tiết lộ đơn có tồn tại hay không).
 * `embedded`: hiển thị trong khung khác (khu tài khoản) — bỏ Container + lề trang.
 */
export function OrderView({ code, customerId, embedded = false }: { code: string; customerId?: string; embedded?: boolean }) {
  const t = useTranslations("shop.order");
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["shop", "order", code, customerId ?? null],
    queryFn: () => orderService.getOrder(code, { customerId }),
    retry: false,
  });

  const Wrapper = embedded ? "div" : Container;
  return (
    <Wrapper className={embedded ? undefined : "py-6 lg:py-10"}>
      {isLoading ? (
        <>
          <Skeleton className="h-10 w-72" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
            <Skeleton className="h-80 rounded-[6px]" />
            <Skeleton className="h-80 rounded-[6px]" />
          </div>
        </>
      ) : isError || !order ? (
        <div className="mx-auto max-w-lg rounded-[6px] bg-white p-8 text-center">
          <h1 className="shop-display-soft text-2xl">{t("notFoundTitle")}</h1>
          <p className="mt-2 text-sm text-[var(--c-text-secondary)]">{t("notFoundText")}</p>
          <ShopButton asChild className="mt-5">
            <Link href="/tra-cuu-don">{t("trackInstead")}</Link>
          </ShopButton>
        </div>
      ) : (
        <>
          <h1 className="shop-display text-[32px] lg:text-[48px]">{t("title", { code: order.code })}</h1>
          <p className="mt-1 mb-6 text-sm text-[var(--c-text-secondary)]">{t("placedAt", { time: new Date(order.createdAt).toLocaleString("vi-VN") })}</p>
          <OrderDetail order={order} />
        </>
      )}
    </Wrapper>
  );
}
