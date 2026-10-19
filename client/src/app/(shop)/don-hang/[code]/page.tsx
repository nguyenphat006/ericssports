import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrderView } from "@/modules/shop/views/OrderView";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop.order");
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function OrderPage({ params }: Props) {
  const { code } = await params;
  return <OrderView code={decodeURIComponent(code)} />;
}
