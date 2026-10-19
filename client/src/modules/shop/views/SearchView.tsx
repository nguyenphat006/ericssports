import { getTranslations } from "next-intl/server";
import { parseProductQuery } from "../lib/filters";
import { catalogService } from "../services";
import { Container } from "../components/ui";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { CatalogListing } from "../components/catalog/CatalogListing";

type SearchParams = Record<string, string | string[] | undefined>;

/** Kết quả tìm kiếm: dùng chung lưới + bộ lọc (thương hiệu, giá, còn hàng) với trang danh mục. */
export async function SearchView({ searchParams }: { searchParams: SearchParams }) {
  const t = await getTranslations("shop.search");
  const query = parseProductQuery(searchParams, []);
  const title = query.q ? t("title", { q: query.q }) : t("titleEmpty");

  return (
    <>
      <header className="border-b border-[var(--c-border)] bg-white">
        <Container className="py-6 lg:py-10">
          <Breadcrumbs items={[{ label: t("titleEmpty") }]} />
          <h1 className="shop-display mt-3 text-[32px] break-words lg:text-[48px]">{title}</h1>
          {!query.q && <p className="mt-2 text-[var(--c-text-secondary)]">{t("prompt")}</p>}
        </Container>
      </header>
      {query.q && (
        <Container className="py-6 lg:py-10">
          <SearchResults query={query} />
        </Container>
      )}
    </>
  );
}

async function SearchResults({ query }: { query: ReturnType<typeof parseProductQuery> }) {
  const page = await catalogService.queryProducts(query);
  return <CatalogListing basePath="/tim-kiem" query={query} attributes={[]} facets={page.facets} items={page.items} total={page.total} hasMore={page.hasMore} />;
}
