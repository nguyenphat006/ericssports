"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { CarouselArrows, ProductCard } from "@/modules/shop/components/ui";
import type { ProductSummary } from "@/modules/shop/types";
import type { ProductGridProps } from "./schema";

type Layout = ProductGridProps["layout"];

/** Một hàng vuốt ngang: điện thoại thấy ~2,2 thẻ (gợi ý còn nữa), máy tính 4–5 thẻ + nút trước / sau */
function Row({ products }: { products: ProductSummary[] }) {
  const t = useTranslations("cms.ui");
  return (
    <Carousel opts={{ align: "start", slidesToScroll: "auto", containScroll: "trimSnaps" }} aria-label={t("productRow")}>
      <CarouselContent className="-ml-3 lg:-ml-4">
        {products.map((p) => (
          <CarouselItem key={p.id} className="basis-[45%] pl-3 sm:basis-[32%] lg:basis-1/4 lg:pl-4 xl:basis-1/5">
            <ProductCard product={p} href={`/san-pham/${p.slug}`} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselArrows prevLabel={t("prevProducts")} nextLabel={t("nextProducts")} className="top-[38%]" />
    </Carousel>
  );
}

function Products({ products, layout }: { products: ProductSummary[]; layout: Layout }) {
  return layout === "carousel" ? <Row products={products} /> : <Grid products={products} />;
}

function Grid({ products }: { products: ProductSummary[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} href={`/san-pham/${p.slug}`} />
      ))}
    </div>
  );
}

/** Thanh tab (role tablist, ← → để chuyển) — dữ liệu mọi tab đã có sẵn từ server, chuyển tab không gọi API */
export function ProductGridTabs({ tabs, layout }: { tabs: { label: string; products: ProductSummary[] }[]; layout: Layout }) {
  const [active, setActive] = useState(0);
  if (tabs.length === 1) return <Products products={tabs[0].products} layout={layout} />;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    setActive(next);
    (e.currentTarget.children[next] as HTMLElement | undefined)?.focus();
  };

  return (
    <>
      <div role="tablist" onKeyDown={onKeyDown} className="-mt-1 mb-5 flex gap-6 overflow-x-auto border-b border-[var(--c-border)]">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            id={`pg-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`pg-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "-mb-px shrink-0 border-b-2 pb-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              i === active ? "border-[var(--shop-primary)] text-[var(--shop-ink)]" : "border-transparent text-[var(--c-text-secondary)] hover:text-[var(--shop-ink)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`pg-panel-${active}`} aria-labelledby={`pg-tab-${active}`}>
        {/* key: đổi tab thì dựng lại carousel từ đầu hàng */}
        <Products key={active} products={tabs[active].products} layout={layout} />
      </div>
    </>
  );
}
