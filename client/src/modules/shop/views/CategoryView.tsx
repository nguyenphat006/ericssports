import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { parseProductQuery } from "../lib/filters";
import { catalogService, type CategoryWithPath } from "../services";
import { Container } from "../components/ui";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { CatalogListing } from "../components/catalog/CatalogListing";

type SearchParams = Record<string, string | string[] | undefined>;

/** Trang danh mục: tiêu đề + danh mục con + danh sách có bộ lọc (bộ lọc theo thuộc tính của danh mục). */
export async function CategoryView({ category, searchParams }: { category: CategoryWithPath; searchParams: SearchParams }) {
  const t = await getTranslations("shop.catalog");
  const attributes = await catalogService.listAttributes(category.filterAttributeIds);
  const query = parseProductQuery(searchParams, attributes, { categoryId: category.id });
  const page = await catalogService.queryProducts(query);

  return (
    <>
      <header className="border-b border-[var(--c-border)] bg-white">
        <Container className="py-6 lg:py-10">
          <Breadcrumbs items={[...category.ancestors.map((a) => ({ label: a.name, href: `/danh-muc/${a.slug}` })), { label: category.name }]} />
          <h1 className="shop-display mt-3 text-[40px] lg:text-[64px]">{category.name}</h1>
          {category.description && <p className="mt-2 max-w-2xl text-[var(--c-text-secondary)]">{category.description}</p>}
          {category.children.length > 0 && (
            <nav aria-label={t("subcategories")} className="mt-5">
              <ul className="flex flex-wrap gap-2">
                {category.children.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`${category.path}/${c.slug}`}
                      className="inline-flex h-9 items-center rounded-[4px] border border-[var(--c-border-strong)] bg-white px-3 text-[13px] font-medium hover:border-[var(--shop-ink)]"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </Container>
      </header>
      <Container className="py-6 lg:py-10">
        <CatalogListing
          basePath={category.path}
          query={query}
          attributes={attributes}
          facets={page.facets}
          items={page.items}
          total={page.total}
          hasMore={page.hasMore}
        />
      </Container>
    </>
  );
}
