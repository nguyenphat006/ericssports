"use client"; // Error boundary bắt buộc là Client Component

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ShopButton } from "@/modules/shop/components/ui";
import { StatusView } from "@/modules/shop/views/StatusView";

/** Lỗi runtime trong storefront — hiển thị trong khung header / footer. */
export default function ShopError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = useTranslations("shop.error");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusView
      code="500"
      title={t("title")}
      text={t("text")}
      homeLabel={t("backHome")}
      action={
        <ShopButton variant="outline" size="lg" onClick={retry}>
          {t("retry")}
        </ShopButton>
      }
    />
  );
}
