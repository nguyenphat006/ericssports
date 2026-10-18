import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UiKitView } from "@/modules/shop/views/UiKitView";

export const metadata: Metadata = { title: "UI kit", robots: { index: false, follow: false } };

/** Trang nội bộ duyệt component storefront — không tồn tại ở production. */
export default function UiKitPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <UiKitView />;
}
