import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/modules/cms/seo/JsonLd";
import { initialVariant } from "../lib/variants";
import { catalogService } from "../services";
import type { Product } from "../types";
import { Container, ProductCard, SectionHeading } from "../components/ui";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { ProductPurchase } from "../components/product/ProductPurchase";
import { ProductSections } from "../components/product/ProductSections";

async function ProductRow({ title, ids }: { title: string; ids: string[] }) {
  const products = await catalogService.getProductsByIds(ids);
  if (!products.length) return null;
  return (
    <section className="mt-14">
      <SectionHeading title={title} />
      <ul className="flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible">
        {products.slice(0, 4).map((p) => (
          <li key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-auto">
            <ProductCard product={p} href={`/san-pham/${p.slug}`} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Trang chi tiết sản phẩm (spec 5.2, mockup đã duyệt). */
export async function ProductView({ product, variantId }: { product: Product; variantId?: string }) {
  const t = await getTranslations("shop.product");
  const categories = await catalogService.listCategories();
  const primary = categories.find((c) => c.id === product.primaryCategoryId);
  const reviews = await catalogService.getReviews(product.id);
  const variant = initialVariant(product, variantId);
  const image = product.media.find((m) => m.kind === "image");

  return (
    // pb cho thanh mua dính đáy trên điện thoại
    <Container className="pt-4 pb-28 sm:pb-14 lg:pt-6">
      <Breadcrumbs
        className="mb-4"
        items={[
          ...(primary ? [...primary.ancestors.map((a) => ({ label: a.name, href: `/danh-muc/${a.slug}` })), { label: primary.name, href: primary.path }] : []),
          { label: product.name },
        ]}
      />
      <ProductPurchase product={product} initialVariantId={variant.id} />
      <ProductSections product={product} reviews={reviews} />
      <ProductRow title={t("boughtTogether")} ids={product.boughtTogetherIds} />
      <ProductRow title={t("related")} ids={product.relatedIds} />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          sku: variant.sku,
          brand: { "@type": "Brand", name: product.brand.name },
          description: product.shortDescription,
          ...(image && image.kind === "image" && { image: image.src }),
          ...(reviews.average !== null && {
            aggregateRating: { "@type": "AggregateRating", ratingValue: reviews.average, reviewCount: reviews.count },
          }),
          offers: product.variants.map((v) => ({
            "@type": "Offer",
            sku: v.sku,
            price: v.price,
            priceCurrency: "VND",
            availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `/san-pham/${product.slug}?v=${v.id}`,
          })),
        }}
      />
    </Container>
  );
}
