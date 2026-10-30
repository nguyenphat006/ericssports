"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle, Clock, Landmark, XCircle } from "@/modules/shop/components/icons";
import { cn } from "@/lib/utils";
import { formatPrice } from "../../lib/formatPrice";
import { orderService } from "../../services";
import type { Order } from "../../types";
import { ShopButton } from "../ui";

const time = (iso: string) => new Date(iso).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });

type Banner = { tone: "success" | "pending" | "error" | "muted"; title: string; text: string; action?: "pay" | "payAgain" };

/** Chi tiết đơn: trạng thái + hành động (thanh toán / thanh toán lại), chuyển khoản, sản phẩm, địa chỉ, tổng, lịch sử. */
export function OrderDetail({ order }: { order: Order }) {
  const t = useTranslations("shop.order");
  const tco = useTranslations("shop.checkout");
  const tc = useTranslations("shop.cart");
  const router = useRouter();
  const [paying, setPaying] = useState(false);

  const deadline = order.paymentDeadline ? time(order.paymentDeadline) : "";
  const banner: Banner =
    order.status === "cancelled"
      ? { tone: "muted", title: t("cancelledTitle"), text: t("cancelledText") }
      : order.status === "pending_payment"
        ? order.paymentStatus === "failed"
          ? { tone: "error", title: t("failedTitle"), text: t("failedText", { time: deadline }), action: "payAgain" }
          : { tone: "pending", title: t("pendingTitle"), text: t("pendingText", { time: deadline }), action: "pay" }
        : order.paymentStatus === "paid"
          ? { tone: "success", title: t("paidTitle"), text: t("paidText") }
          : { tone: "success", title: t("successTitle"), text: t("successText") };

  const Icon = banner.tone === "success" ? CheckCircle : banner.tone === "error" ? XCircle : banner.tone === "pending" ? Clock : XCircle;

  const pay = async () => {
    setPaying(true);
    try {
      router.push(await orderService.getPaymentUrl(order.code));
    } catch {
      setPaying(false);
      toast.error(t("cancelledTitle"));
      router.refresh();
    }
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <section
          className={cn(
            "flex gap-3 rounded-[6px] border p-4 lg:p-5",
            banner.tone === "success" && "border-[var(--c-success)] bg-[var(--c-success-bg)]",
            banner.tone === "pending" && "border-[var(--c-warning)] bg-[var(--c-warning-bg)]",
            banner.tone === "error" && "border-[var(--c-error)] bg-[var(--c-error-bg)]",
            banner.tone === "muted" && "border-[var(--c-border-strong)] bg-white",
          )}
          role="status"
        >
          <Icon
            className={cn(
              "mt-0.5 size-6 shrink-0",
              banner.tone === "success" && "text-[var(--c-success)]",
              banner.tone === "pending" && "text-[var(--c-warning)]",
              banner.tone === "error" && "text-[var(--c-error)]",
              banner.tone === "muted" && "text-[var(--c-text-tertiary)]",
            )}
            aria-hidden
          />
          <div className="flex-1">
            <h2 className="text-base font-bold">{banner.title}</h2>
            <p className="mt-1 text-sm text-[var(--c-text-2)]">{banner.text}</p>
            {banner.action && (
              <ShopButton className="mt-3" loading={paying} onClick={pay}>
                {banner.action === "pay" ? t("payNow") : t("payAgain")}
              </ShopButton>
            )}
          </div>
        </section>

        {order.paymentMethod === "bank_transfer" && order.status === "pending_confirmation" && order.paymentStatus !== "paid" && (
          <section className="rounded-[6px] bg-white p-4 lg:p-5">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Landmark className="size-5" aria-hidden />
              {t("bankTitle")}
            </h2>
            <p className="mt-1 text-sm text-[var(--c-text-secondary)]">{t("bankText")}</p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <div className="flex size-40 shrink-0 items-center justify-center rounded-[6px] border border-dashed border-[var(--c-border-strong)] p-3 text-center text-xs text-[var(--c-text-tertiary)]">
                {t("bankQrPlaceholder")}
              </div>
              <dl className="grid flex-1 content-start gap-2 text-sm">
                <div>
                  <dt className="text-[var(--c-text-secondary)]">{t("bankAmount")}</dt>
                  <dd className="shop-price text-lg text-[var(--shop-primary)]">{formatPrice(order.total)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--c-text-secondary)]">{t("bankContent")}</dt>
                  <dd className="font-mono font-semibold">{order.code}</dd>
                </div>
              </dl>
            </div>
          </section>
        )}

        <section className="rounded-[6px] bg-white p-4 lg:p-5">
          <h2 className="mb-3 text-base font-bold">{t("items")}</h2>
          <ul className="divide-y divide-[var(--c-border)]">
            {order.lines.map((l) => (
              <li key={`${l.variantId}-${l.services.map((s) => s.id).join(",")}`} className="flex gap-3 py-3">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-[4px] bg-[var(--shop-muted)]">
                  <Image src={l.image.src} alt="" fill sizes="64px" className="object-contain p-1" />
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <Link href={`/san-pham/${l.productSlug}`} className="line-clamp-2 font-medium hover:underline">
                    {l.name}
                  </Link>
                  <span className="block text-xs text-[var(--c-text-secondary)]">{[l.variantLabel, ...l.services.map((s) => s.name)].filter(Boolean).join(" · ")}</span>
                  <span className="block text-xs text-[var(--c-text-tertiary)] tabular-nums">
                    {l.quantity} × {formatPrice(l.unitPrice + l.services.reduce((s, x) => s + x.price, 0))}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="space-y-3 rounded-[6px] bg-white p-5 text-sm">
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-[var(--c-text-secondary)]">{t("shipTo")}</dt>
              <dd className="mt-0.5">
                <span className="font-semibold">{order.address.recipient}</span> · {order.address.phone}
                <br />
                {order.address.street}, {order.address.wardName}, {order.address.provinceName}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--c-text-secondary)]">{t("shippingMethod")}</dt>
              <dd>{tco(order.shippingMethod)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--c-text-secondary)]">{t("paymentMethod")}</dt>
              <dd className="text-right">
                {tco(order.paymentMethod)}
                <span className="block text-xs text-[var(--c-text-secondary)]">{t(`payment.${order.paymentStatus}`)}</span>
              </dd>
            </div>
            {order.note && (
              <div>
                <dt className="text-xs text-[var(--c-text-secondary)]">{t("note")}</dt>
                <dd className="mt-0.5 whitespace-pre-line">{order.note}</dd>
              </div>
            )}
          </dl>
          <dl className="space-y-2 border-t border-[var(--c-border)] pt-3">
            <div className="flex justify-between">
              <dt className="text-[var(--c-text-secondary)]">{tc("subtotal")}</dt>
              <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--c-text-secondary)]">{tc("shipping")}</dt>
              <dd className="tabular-nums">{order.shippingFee === 0 ? tc("shippingFree") : formatPrice(order.shippingFee)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-[var(--c-border)] pt-2">
              <dt className="font-semibold">{tc("total")}</dt>
              <dd className="shop-price text-xl text-[var(--shop-primary)]">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[6px] bg-white p-5">
          <h2 className="mb-3 text-sm font-bold">{t("timeline")}</h2>
          <ol className="space-y-3 border-l-2 border-[var(--c-border)] pl-4">
            {[...order.timeline].reverse().map((e, i) => (
              <li key={`${e.status}-${e.at}`} className="relative text-sm">
                <span className={cn("absolute top-1.5 -left-[21px] size-2.5 rounded-full", i === 0 ? "bg-[var(--shop-primary)]" : "bg-[var(--c-border-strong)]")} aria-hidden />
                <span className={cn("block", i === 0 && "font-semibold")}>{t(`status.${e.status}`)}</span>
                <time dateTime={e.at} className="text-xs text-[var(--c-text-secondary)]">
                  {time(e.at)}
                </time>
              </li>
            ))}
          </ol>
        </section>

        <ShopButton asChild variant="outline-ink" className="w-full">
          <Link href="/">{t("continueShopping")}</Link>
        </ShopButton>
      </aside>
    </div>
  );
}
