import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CartView } from "@/modules/shop/views/CartView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop.cart");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default function CartPage() {
  return <CartView />;
}
