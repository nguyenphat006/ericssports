import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MockGatewayView } from "@/modules/shop/views/MockGatewayView";

export const metadata: Metadata = { title: "Mock gateway", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Cổng thanh toán giả lập (GĐ2) — không tồn tại ở production. */
export default async function MockGatewayPage({ searchParams }: Props) {
  if (process.env.NODE_ENV === "production") notFound();
  const sp = await searchParams;
  const code = typeof sp.don === "string" ? sp.don : "";
  const gateway = sp.cong === "momo" ? "momo" : "vnpay";
  if (!code) notFound();
  return <MockGatewayView code={code} gateway={gateway} />;
}
