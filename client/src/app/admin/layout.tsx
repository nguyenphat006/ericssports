import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeArea } from "@/components/layouts/ThemeArea";
import { APP_CONFIG } from "@/config/app";
import { NumberFormatProvider } from "@/providers/NumberFormatProvider";

export const metadata: Metadata = {
  // Trang con chỉ cần khai báo `title: "Tên trang"` -> tự thành "Tên trang | <APP_CONFIG.name>"
  title: { default: APP_CONFIG.name, template: `%s | ${APP_CONFIG.name}` },
  description: APP_CONFIG.description,
  robots: { index: false, follow: false },
};

/**
 * Khu quản trị (/admin/*): đăng nhập + các trang sau đăng nhập ((panel)). Theme sáng / tối theo lựa chọn nhân viên.
 * Nạp đủ mọi namespace chữ (layout gốc chỉ gửi phần storefront + dùng chung).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeArea area="admin" />
      <NumberFormatProvider>{children}</NumberFormatProvider>
    </NextIntlClientProvider>
  );
}
