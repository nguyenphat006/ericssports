import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogService } from "@/modules/shop/services";
import { ProductView } from "@/modules/shop/views/ProductView";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await catalogService.getProductBySlug((await params).slug);
  if (!product) return {};
  const image = product.media.find((m) => m.kind === "image");
  return {
    title: product.name,
    description: product.shortDescription,
    // ?v= chỉ đổi biến thể -> URL chuẩn không kèm tham số
    alternates: { canonical: `/san-pham/${product.slug}` },
    openGraph: { title: product.name, description: product.shortDescription, ...(image?.kind === "image" && { images: [image.src] }) },
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const product = await catalogService.getProductBySlug((await params).slug);
  if (!product) notFound();
  const v = (await searchParams).v;
  return <ProductView product={product} variantId={Array.isArray(v) ? v[0] : v} />;
}
