"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "@/modules/shop/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "../../lib/formatPrice";
import { useCustomer } from "../../hooks/useCustomer";
import { orderService } from "../../services";
import { ShopButton } from "../../components/ui";
import { OrderView } from "../OrderView";

/** Danh sách đơn của khách đang đăng nhập (mới nhất trước). */
export function AccountOrdersView() {
  const t = useTranslations("shop.account");
  const to = useTranslations("shop.order");
  const tc = useTranslations("shop.cart");
  const { customer } = useCustomer();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["shop", "my-orders", customer?.id],
    queryFn: () => orderService.listCustomerOrders(customer!.id),
    enabled: !!customer,
  });

  return (
    <section>
      <h1 className="shop-display mb-4 text-[32px] lg:text-[40px]">{t("orders")}</h1>
      {isLoading ? (
        <Skeleton className="h-40 rounded-[6px]" />
      ) : !orders?.length ? (
        <div className="rounded-[6px] bg-white p-8 text-center">
          <p className="text-sm text-[var(--c-text-secondary)]">{t("ordersEmpty")}</p>
          <ShopButton asChild className="mt-4">
            <Link href="/">{tc("continueShopping")}</Link>
          </ShopButton>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.code}>
              <Link
                href={`/tai-khoan/don-hang/${o.code}`}
                aria-label={t("viewOrder", { code: o.code })}
                className="flex items-center gap-4 rounded-[6px] bg-white p-4 transition-colors hover:bg-[var(--shop-muted)]"
              >
                <div className="flex -space-x-3">
                  {o.lines.slice(0, 3).map((l) => (
                    <span key={l.variantId} className="relative size-12 overflow-hidden rounded-[4px] border-2 border-white bg-[var(--shop-muted)]">
                      <Image src={l.image.src} alt="" fill sizes="48px" className="object-contain p-1" />
                    </span>
                  ))}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-mono font-semibold">{o.code}</p>
                  <p className="text-xs text-[var(--c-text-secondary)]">
                    {new Date(o.createdAt).toLocaleDateString("vi-VN")} · {t("orderItems", { count: o.lines.reduce((s, l) => s + l.quantity, 0) })}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">{to(`status.${o.status}`)}</p>
                  <p className="shop-price text-[var(--shop-primary)]">{formatPrice(o.total)}</p>
                </div>
                <ChevronRight className="size-4 text-[var(--c-text-tertiary)]" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Chi tiết đơn trong khu tài khoản (quyền xem theo khách đang đăng nhập) */
export function AccountOrderDetailView({ code }: { code: string }) {
  const { customer } = useCustomer();
  if (!customer) return null;
  return <OrderView code={code} customerId={customer.id} embedded />;
}
