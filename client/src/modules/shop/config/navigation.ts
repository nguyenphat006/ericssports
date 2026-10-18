import type { MessageKey } from "@/i18n/types";

/**
 * Menu danh mục storefront — dữ liệu tĩnh tạm thời. GĐ3/GĐ4 thay bằng Menu quản lý trong CMS.
 * Chưa có trang danh mục (GĐ2) nên mục menu chưa có `href`: header chỉ hiển thị, không tạo link tới trang 404.
 */
export interface ShopNavItem {
  key: string;
  label: MessageKey;
  href?: string;
  children?: ShopNavItem[];
  /** Nhấn màu (vd. Khuyến mãi) */
  highlight?: boolean;
}

export const SHOP_NAVIGATION: ShopNavItem[] = [
  {
    key: "cardio",
    label: "shop.nav.cardio",
    children: [
      { key: "treadmills", label: "shop.nav.treadmills" },
      { key: "bikes", label: "shop.nav.bikes" },
      { key: "ellipticals", label: "shop.nav.ellipticals" },
    ],
  },
  {
    key: "strength",
    label: "shop.nav.strength",
    children: [
      { key: "dumbbells", label: "shop.nav.dumbbells" },
      { key: "barbells", label: "shop.nav.barbells" },
      { key: "benches", label: "shop.nav.benches" },
      { key: "racks", label: "shop.nav.racks" },
    ],
  },
  {
    key: "recovery",
    label: "shop.nav.recovery",
    children: [
      { key: "mats", label: "shop.nav.mats" },
      { key: "massage", label: "shop.nav.massage" },
    ],
  },
  { key: "accessories", label: "shop.nav.accessories" },
  { key: "sale", label: "shop.nav.sale", highlight: true },
];
