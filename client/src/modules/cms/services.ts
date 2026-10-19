import { MOCK_PAGES } from "./mocks/pages";
import type { CmsPage } from "./types";

/**
 * Lớp dữ liệu CMS. GĐ2: trang mẫu; GĐ3 trình soạn lưu bản nháp; GĐ4 đọc `published_blocks` từ API.
 */
export interface CmsService {
  /** Trang đã xuất bản theo slug ("home" = trang chủ); không có -> null */
  getPage(slug: string): Promise<CmsPage | null>;
  listPages(): Promise<CmsPage[]>;
}

export const cmsService: CmsService = {
  async getPage(slug) {
    return MOCK_PAGES.find((p) => p.slug === slug) ?? null;
  },
  async listPages() {
    return MOCK_PAGES;
  },
};
