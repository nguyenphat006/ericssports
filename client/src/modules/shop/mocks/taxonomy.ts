import type { Attribute, Brand, Category } from "../types";

/**
 * Danh mục / thương hiệu / thuộc tính lọc MẪU (GĐ1–3). Thương hiệu "ES …" là tên giả lập.
 * Cây danh mục khớp menu header (config/navigation.ts).
 */

export const MOCK_BRANDS: Brand[] = [
  { id: "b-cardio", slug: "es-cardio", name: "ES Cardio" },
  { id: "b-strength", slug: "es-strength", name: "ES Strength" },
  { id: "b-recovery", slug: "es-recovery", name: "ES Recovery" },
  { id: "b-pro", slug: "es-pro", name: "ES Pro" },
  { id: "b-home", slug: "es-home", name: "ES Home" },
  { id: "b-gear", slug: "es-gear", name: "ES Gear" },
];

export const MOCK_ATTRIBUTES: Attribute[] = [
  { id: "a-power", slug: "cong-suat", name: "Công suất động cơ", kind: "range", unit: "HP" },
  { id: "a-load", slug: "tai-trong", name: "Tải trọng tối đa", kind: "range", unit: "kg" },
  { id: "a-weight", slug: "khoi-luong", name: "Khối lượng tạ", kind: "range", unit: "kg" },
  { id: "a-thickness", slug: "do-day", name: "Độ dày", kind: "range", unit: "mm" },
  { id: "a-foldable", slug: "gap-gon", name: "Gấp gọn", kind: "boolean" },
  { id: "a-incline", slug: "nang-doc-dien", name: "Nâng dốc điện", kind: "boolean" },
  { id: "a-bluetooth", slug: "bluetooth", name: "Kết nối Bluetooth", kind: "boolean" },
  { id: "a-adjustable", slug: "dieu-chinh", name: "Điều chỉnh được", kind: "boolean" },
  {
    id: "a-resistance",
    slug: "khang-luc",
    name: "Kiểu kháng lực",
    kind: "options",
    options: [
      { value: "tu-tinh", label: "Từ tính" },
      { value: "dien-tu", label: "Điện từ" },
      { value: "gio", label: "Kháng gió" },
      { value: "co", label: "Cơ học" },
    ],
  },
  {
    id: "a-material",
    slug: "chat-lieu",
    name: "Chất liệu",
    kind: "options",
    options: [
      { value: "cao-su", label: "Bọc cao su" },
      { value: "gang", label: "Gang đúc" },
      { value: "chrome", label: "Thép mạ chrome" },
      { value: "tpe", label: "TPE" },
      { value: "pu", label: "PU" },
    ],
  },
];

const c = (
  id: string,
  slug: string,
  name: string,
  parentId: string | null,
  sortOrder: number,
  filterAttributeIds: string[] = [],
  description?: string,
): Category => ({ id, slug, name, parentId, sortOrder, filterAttributeIds, description });

/** Ảnh minh họa danh mục gốc (Unsplash, xem public/shop/photos/CREDITS.md) */
const CATEGORY_PHOTOS: Record<string, string> = {
  cardio: "/shop/photos/man-treadmill.webp",
  "tap-ta": "/shop/photos/banner-strength.webp",
  "yoga-phuc-hoi": "/shop/photos/cat-yoga.webp",
  "phu-kien": "/shop/photos/banner-accessories.webp",
};

const withPhoto = (cat: Category): Category => (CATEGORY_PHOTOS[cat.slug] ? { ...cat, image: { src: CATEGORY_PHOTOS[cat.slug], alt: cat.name } } : cat);

export const MOCK_CATEGORIES: Category[] = [
  c("c-cardio", "cardio", "Cardio", null, 1, ["a-load", "a-foldable", "a-bluetooth"], "Máy chạy bộ, xe đạp tập và máy elip cho tập luyện tim mạch tại nhà."),
  c("c-treadmills", "may-chay-bo", "Máy chạy bộ", "c-cardio", 1, ["a-power", "a-load", "a-foldable", "a-incline", "a-bluetooth"], "Máy chạy bộ điện gấp gọn đến máy chuyên nghiệp nâng dốc điện."),
  c("c-bikes", "xe-dap-tap", "Xe đạp tập", "c-cardio", 2, ["a-resistance", "a-load", "a-foldable", "a-bluetooth"]),
  c("c-ellipticals", "may-tap-elip", "Máy tập elip", "c-cardio", 3, ["a-resistance", "a-load", "a-bluetooth"]),
  c("c-strength", "tap-ta", "Tập tạ", null, 2, ["a-load", "a-adjustable"], "Tạ đơn, tạ đòn, ghế tập và giàn tạ cho phòng gym tại nhà."),
  c("c-dumbbells", "ta-don", "Tạ đơn", "c-strength", 1, ["a-weight", "a-material", "a-adjustable"]),
  c("c-barbells", "ta-don-banh-ta", "Tạ đòn & bánh tạ", "c-strength", 2, ["a-weight", "a-material"]),
  c("c-benches", "ghe-tap", "Ghế tập", "c-strength", 3, ["a-load", "a-adjustable", "a-foldable"]),
  c("c-racks", "khung-gian-ta", "Khung & giàn tạ", "c-strength", 4, ["a-load"]),
  c("c-recovery", "yoga-phuc-hoi", "Yoga & phục hồi", null, 3, ["a-material"], "Thảm tập, con lăn và súng massage giúp phục hồi sau tập."),
  c("c-mats", "tham-tap", "Thảm tập", "c-recovery", 1, ["a-thickness", "a-material"]),
  c("c-massage", "massage", "Súng & con lăn massage", "c-recovery", 2, ["a-bluetooth"]),
  c("c-accessories", "phu-kien", "Phụ kiện", null, 4, [], "Dây kháng lực, găng tay, đai lưng và phụ kiện tập luyện."),
].map(withPhoto);
