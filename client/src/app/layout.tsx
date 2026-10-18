import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import AppProviders from "@/providers/AppProviders";
import { THEME_INIT_SCRIPT } from "@/stores/useThemeStore";

// Mặc định theo storefront (404 gốc, trang ngoài hai khu vực). Khu quản trị đặt lại ở app/admin/layout.tsx.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop.meta");
  return {
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
  return (
    // data-theme được script gán trước khi hydrate -> cần suppressHydrationWarning
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        {/* Chữ + ngôn ngữ từ src/i18n/request.ts (cookie NEXT_LOCALE) chuyền xuống client component */}
        <NextIntlClientProvider>
          <QueryProvider>
            <AppProviders>{children}</AppProviders>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
