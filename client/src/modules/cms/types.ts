/** Kiểu dữ liệu CMS (spec 6.1, 6.2). */

/** Một khối trên trang: props được kiểm tra bằng schema của khối lúc render */
export interface BlockInstance {
  id: string;
  type: string;
  version: number;
  hidden?: boolean;
  props: unknown;
}

export type PageKind = "home" | "landing" | "static";

export interface PageSeo {
  title?: string;
  description?: string;
  image?: string;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  kind: PageKind;
  seo: PageSeo;
  blocks: BlockInstance[];
  publishedAt: string;
}

/** Đường dẫn hệ thống — slug trang CMS không được trùng (GĐ3 kiểm tra khi tạo trang) */
export const RESERVED_SLUGS = [
  "admin",
  "django-admin",
  "api",
  "static",
  "media",
  "dev",
  "preview",
  "danh-muc",
  "tim-kiem",
  "san-pham",
  "gio-hang",
  "thanh-toan",
  "don-hang",
  "tra-cuu-don",
  "tai-khoan",
] as const;
