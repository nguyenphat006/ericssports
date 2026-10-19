import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cmsService } from "@/modules/cms/services";
import { CmsPageView, cmsPageMetadata } from "@/modules/cms/views/CmsPageView";

type Props = { params: Promise<{ slug: string }> };

/** Trang chủ chỉ phục vụ ở "/" — "/home" trả 404 để không có 2 URL cho một trang */
async function loadPage(slug: string) {
  if (slug === "home") return null;
  return cmsService.getPage(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await loadPage((await params).slug);
  return page ? cmsPageMetadata(page) : {};
}

/** Landing page / trang chính sách do CMS tạo. Route tĩnh (danh-muc, san-pham...) được Next ưu tiên hơn route này. */
export default async function CmsSlugPage({ params }: Props) {
  const page = await loadPage((await params).slug);
  if (!page) notFound();
  return <CmsPageView page={page} />;
}
