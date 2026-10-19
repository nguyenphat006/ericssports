import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import AppProviders from "@/providers/AppProviders";
import { THEME_INIT_SCRIPT } from "@/stores/useThemeStore";

/**
 * Chữ gửi xuống client ở layout gốc: chỉ storefront + phần dùng chung (giảm ~40KB HTML mỗi trang storefront).
 * Khu quản trị nạp đủ mọi namespace ở app/admin/layout.tsx.
 */
const ROOT_NAMESPACES = ["common", "form", "errors", "meta", "validation", "shop", "cms"] as const;

// Mặc định theo storefront (404 gốc, trang ngoài hai khu vực). Khu quản trị đặt lại ở app/admin/layout.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop.meta");
  return {
    // URL tuyệt đối cho canonical / Open Graph (NEXT_PUBLIC_SITE_URL ở production)
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: t("defaultTitle"), template: `%s | ${t("siteName")}` },
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const all = await getMessages();
  const messages = Object.fromEntries(ROOT_NAMESPACES.map((ns) => [ns, all[ns]]));
  return (
    // data-theme được script gán trước khi hydrate -> cần suppressHydrationWarning
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        {/* Chữ + ngôn ngữ từ src/i18n/request.ts (cookie NEXT_LOCALE) chuyền xuống client component */}
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AppProviders>{children}</AppProviders>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
