import type { Metadata } from "next";
import { ThemeArea } from "@/components/layouts/ThemeArea";
import { APP_CONFIG } from "@/config/app";
import { NumberFormatProvider } from "@/providers/NumberFormatProvider";

export const metadata: Metadata = {
  // Trang con chỉ cần khai báo `title: "Tên trang"` -> tự thành "Tên trang | <APP_CONFIG.name>"
  title: { default: APP_CONFIG.name, template: `%s | ${APP_CONFIG.name}` },
  description: APP_CONFIG.description,
  robots: { index: false, follow: false },
};

/** Khu quản trị (/admin/*): đăng nhập + các trang sau đăng nhập ((panel)). Theme sáng / tối theo lựa chọn nhân viên. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeArea area="admin" />
      <NumberFormatProvider>{children}</NumberFormatProvider>
    </>
  );
}
