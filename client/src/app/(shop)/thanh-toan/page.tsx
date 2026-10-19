import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckoutView } from "@/modules/shop/views/CheckoutView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop.checkout");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default function CheckoutPage() {
  return <CheckoutView />;
}
