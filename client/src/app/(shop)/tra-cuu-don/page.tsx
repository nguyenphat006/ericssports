import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TrackOrderView } from "@/modules/shop/views/TrackOrderView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop.track");
  return { title: t("title"), robots: { index: false, follow: true } };
}

export default function TrackOrderPage() {
  return <TrackOrderView />;
}
