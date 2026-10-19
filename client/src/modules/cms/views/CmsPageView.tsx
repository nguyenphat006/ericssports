import type { Metadata } from "next";
import { Container } from "@/modules/shop/components/ui";
import { BlockRenderer } from "../renderer/BlockRenderer";
import type { CmsPage } from "../types";

/** Metadata SEO của trang CMS (tiêu đề trang chủ do layout gốc đặt) */
export function cmsPageMetadata(page: CmsPage): Metadata {
  const title = page.seo.title ?? page.title;
  return {
    ...(page.kind !== "home" && { title }),
    ...(page.seo.description && { description: page.seo.description }),
    openGraph: { title, ...(page.seo.description && { description: page.seo.description }), ...(page.seo.image && { images: [page.seo.image] }) },
    alternates: { canonical: page.kind === "home" ? "/" : `/${page.slug}` },
  };
}

/**
 * Trang dựng từ khối CMS. Trang tĩnh (chính sách) có tiêu đề h1 hiển thị; trang chủ / landing để h1 ẩn
 * (khối hero đã giữ vai trò tiêu đề lớn) — mỗi trang luôn có đúng một h1.
 */
export function CmsPageView({ page }: { page: CmsPage }) {
  return (
    <>
      {page.kind === "static" ? (
        <header className="border-b border-[var(--c-border)] bg-white">
          <Container className="py-8 lg:py-12">
            <h1 className="shop-display text-[36px] lg:text-[56px]">{page.title}</h1>
            {page.seo.description && <p className="mt-2 max-w-2xl text-[var(--c-text-secondary)]">{page.seo.description}</p>}
          </Container>
        </header>
      ) : (
        <h1 className="sr-only">{page.title}</h1>
      )}
      <BlockRenderer blocks={page.blocks} />
    </>
  );
}
