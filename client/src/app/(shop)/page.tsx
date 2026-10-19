import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cmsService } from "@/modules/cms/services";
import { CmsPageView, cmsPageMetadata } from "@/modules/cms/views/CmsPageView";

export async function generateMetadata(): Promise<Metadata> {
  const page = await cmsService.getPage("home");
  return page ? cmsPageMetadata(page) : {};
}

/** Trang chủ = trang CMS slug "home" (bố cục B — theo mục tiêu tập luyện) */
export default async function HomePage() {
  const page = await cmsService.getPage("home");
  if (!page) notFound();
  return <CmsPageView page={page} />;
}
