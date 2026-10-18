import { ShopShell } from "@/modules/shop/components/layout";

/**
 * Storefront ở "/": theme Ember, header + footer.
 * Metadata (tiêu đề mặc định + mẫu "%s | Ericssports") khai báo ở layout gốc — khai báo lại ở đây sẽ bị
 * mẫu của layout gốc áp lên tiêu đề mặc định (lặp "| Ericssports").
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopShell>{children}</ShopShell>;
}
