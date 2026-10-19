import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountShell } from "@/modules/shop/views/account/AccountShell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop.account");
  return { title: t("title"), robots: { index: false, follow: false } };
}

/** Khu tài khoản khách (cần đăng nhập — kiểm tra ở client, GĐ4 kiểm tra phiên ở server) */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
