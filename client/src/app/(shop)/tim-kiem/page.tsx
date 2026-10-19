import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SearchView } from "@/modules/shop/views/SearchView";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const t = await getTranslations("shop.search");
  const q = (await searchParams).q;
  const text = (Array.isArray(q) ? q[0] : q)?.trim();
  // Trang kết quả tìm kiếm không cần index
  return { title: text ? t("metaTitle", { q: text }) : t("titleEmpty"), robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: Props) {
  return <SearchView searchParams={await searchParams} />;
}
