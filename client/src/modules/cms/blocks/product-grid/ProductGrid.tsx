import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container, SectionHeading } from "@/modules/shop/components/ui";
import { catalogService } from "@/modules/shop/services";
import type { BlockComponent } from "../types";
import { ProductGridTabs } from "./ProductGridTabs";
import type { ProductGridProps } from "./schema";

/** Lưới sản phẩm: lấy dữ liệu theo điều kiện lúc render (server), nhiều tab thì chuyển tab ở client. */
export const ProductGrid: BlockComponent<ProductGridProps> = async ({ props }) => {
  const t = await getTranslations("cms.ui");
  const tabs = await Promise.all(
    props.tabs.map(async (tab) => ({
      label: tab.label,
      products: await catalogService.selectProducts({
        source: tab.selection.source,
        categoryId: tab.selection.categoryId,
        productIds: tab.selection.productIds,
        limit: tab.selection.limit,
      }),
    })),
  );
  const visible = tabs.filter((tab) => tab.products.length > 0);
  if (visible.length === 0) return null;

  return (
    <section className="py-10 lg:py-16">
      <Container>
        <SectionHeading
          eyebrow={props.eyebrow}
          title={props.title}
          action={
            props.viewAllHref && (
              <Link href={props.viewAllHref} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--shop-primary)] hover:underline">
                {t("viewAll")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            )
          }
        />
        <ProductGridTabs tabs={visible} />
      </Container>
    </section>
  );
};
