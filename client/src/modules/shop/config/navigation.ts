import type { MessageKey } from "@/i18n/types";

/**
 * Menu danh mục storefront — dữ liệu tĩnh tạm thời, khớp cây danh mục mẫu (mocks/taxonomy.ts).
 * GĐ3/GĐ4 thay bằng Menu quản lý trong CMS.
 */
export interface ShopNavItem {
  key: string;
  label: MessageKey;
  href: string;
  children?: ShopNavItem[];
  /** Nhấn màu (vd. Khuyến mãi) */
  highlight?: boolean;
}

export const SHOP_NAVIGATION: ShopNavItem[] = [
  {
    key: "cardio",
    label: "shop.nav.cardio",
    href: "/danh-muc/cardio",
    children: [
      { key: "treadmills", label: "shop.nav.treadmills", href: "/danh-muc/cardio/may-chay-bo" },
      { key: "bikes", label: "shop.nav.bikes", href: "/danh-muc/cardio/xe-dap-tap" },
      { key: "ellipticals", label: "shop.nav.ellipticals", href: "/danh-muc/cardio/may-tap-elip" },
    ],
  },
  {
    key: "strength",
    label: "shop.nav.strength",
    href: "/danh-muc/tap-ta",
    children: [
      { key: "dumbbells", label: "shop.nav.dumbbells", href: "/danh-muc/tap-ta/ta-don" },
      { key: "barbells", label: "shop.nav.barbells", href: "/danh-muc/tap-ta/ta-don-banh-ta" },
      { key: "benches", label: "shop.nav.benches", href: "/danh-muc/tap-ta/ghe-tap" },
      { key: "racks", label: "shop.nav.racks", href: "/danh-muc/tap-ta/khung-gian-ta" },
    ],
  },
  {
    key: "recovery",
    label: "shop.nav.recovery",
    href: "/danh-muc/yoga-phuc-hoi",
    children: [
      { key: "mats", label: "shop.nav.mats", href: "/danh-muc/yoga-phuc-hoi/tham-tap" },
      { key: "massage", label: "shop.nav.massage", href: "/danh-muc/yoga-phuc-hoi/massage" },
    ],
  },
  { key: "accessories", label: "shop.nav.accessories", href: "/danh-muc/phu-kien" },
  { key: "sale", label: "shop.nav.sale", href: "/khuyen-mai", highlight: true },
];
