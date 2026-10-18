import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container, ProductCard, SectionHeading } from "../components/ui";
import { MOCK_PRODUCTS } from "../mocks/products";

/**
 * Trang chủ TẠM THỜI của GĐ1 (hero tĩnh + lưới sản phẩm mẫu) để kiểm tra khung giao diện.
 * GĐ2 thay toàn bộ bằng renderer khối CMS (bố cục B — "Theo mục tiêu tập luyện").
 */
export async function HomeView() {
  const t = await getTranslations("shop.home");
  return (
    <>
      <section className="bg-white">
        <Container className="grid items-center gap-8 py-10 md:grid-cols-[1.1fr_1fr] lg:py-16">
          <div>
            <p className="shop-eyebrow text-[var(--shop-primary)]">{t("heroEyebrow")}</p>
            <h1 className="shop-display mt-3 text-[52px] sm:text-[64px] lg:text-[88px]">{t("heroTitle")}</h1>
            <p className="mt-4 max-w-md text-base text-[var(--c-text-secondary)]">{t("heroText")}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] bg-[var(--shop-muted)]">
            <Image src="/shop/placeholder/treadmill.svg" alt="" fill priority className="object-contain p-10" />
          </div>
        </Container>
      </section>

      <section className="py-10 lg:py-16">
        <Container>
          <SectionHeading title={t("featured")} />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {MOCK_PRODUCTS.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
