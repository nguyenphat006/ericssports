import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DATA_SOURCE } from "@/modules/shop/services";
import { MockGatewayView } from "@/modules/shop/views/MockGatewayView";

export const metadata: Metadata = { title: "Mock gateway", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/**
 * Cổng thanh toán giả lập (GĐ2) — chỉ có khi dùng dữ liệu mock (NEXT_PUBLIC_DATA_SOURCE=mock, kể cả bản build để chạy E2E).
 * Dùng API thật (GĐ4+) thì trang không tồn tại.
 */
export default async function MockGatewayPage({ searchParams }: Props) {
  if (DATA_SOURCE !== "mock") notFound();
  const sp = await searchParams;
  const code = typeof sp.don === "string" ? sp.don : "";
  const gateway = sp.cong === "momo" ? "momo" : "vnpay";
  if (!code) notFound();
  return <MockGatewayView code={code} gateway={gateway} />;
}
