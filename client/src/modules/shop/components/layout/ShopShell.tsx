import { getTranslations } from "next-intl/server";
import { ThemeArea } from "@/components/layouts/ThemeArea";
import { cn } from "@/lib/utils";
import { archivo } from "../../fonts";
import { ShopFooter } from "./ShopFooter";
import { ShopHeader } from "./ShopHeader";
import "../../styles/shop.css";

/**
 * Khung storefront: theme Ember (`data-site="shop"`, xem modules/shop/styles/shop.css) + font Archivo + header / footer.
 * Dùng cho layout (shop) và trang 404 gốc (404 không nằm trong layout (shop)).
 */
export async function ShopShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("shop");
  return (
    <div data-site="shop" className={cn(archivo.variable)}>
      <ThemeArea area="shop" />
      <a href="#main" className="shop-skip-link">
        {t("skipToContent")}
      </a>
      <ShopHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <ShopFooter />
    </div>
  );
}
