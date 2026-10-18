import { getTranslations } from "next-intl/server";
import { ShopShell } from "@/modules/shop/components/layout";
import { StatusView } from "@/modules/shop/views/StatusView";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("notFound") };
}

/**
 * 404 cho mọi URL không khớp route (khách gặp nhiều nhất) -> giao diện storefront.
 * notFound() trong trang quản trị dùng admin/(panel)/not-found.tsx.
 */
export default async function NotFound() {
  const t = await getTranslations("shop.notFound");
  return (
    <ShopShell>
      <StatusView code="404" title={t("title")} text={t("text")} homeLabel={t("backHome")} />
    </ShopShell>
  );
}
