import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogService } from "@/modules/shop/services";
import { CategoryView } from "@/modules/shop/views/CategoryView";

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await catalogService.getCategoryByPath((await params).slug);
  if (!category) return {};
  return {
    title: category.name,
    ...(category.description && { description: category.description }),
    // URL chuẩn không kèm bộ lọc -> tránh trùng lặp nội dung khi index
    alternates: { canonical: category.path },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await catalogService.getCategoryByPath((await params).slug);
  if (!category) notFound();
  return <CategoryView category={category} searchParams={await searchParams} />;
}
