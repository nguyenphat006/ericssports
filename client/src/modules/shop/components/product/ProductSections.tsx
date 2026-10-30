import { getTranslations } from "next-intl/server";
import { FileText, Star } from "@/modules/shop/components/icons";
import { RichText } from "@/modules/cms/richtext/RichText";
import type { Product, ReviewSummary } from "../../types";

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="shop-display mb-4 scroll-mt-36 text-[24px] lg:text-[32px]">
      {children}
    </h2>
  );
}

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={className} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} weight={i < Math.round(value) ? "fill" : "regular"} className={i < Math.round(value) ? "inline size-4 text-[#E9A23B]" : "inline size-4 text-[var(--c-border-strong)]"} />
      ))}
    </span>
  );
}

/** Nội dung dưới khu mua hàng: thanh điều hướng dính + Mô tả · Thông số · Đánh giá · Tài liệu (render server). */
export async function ProductSections({ product, reviews }: { product: Product; reviews: ReviewSummary }) {
  const t = await getTranslations("shop.product");
  const nav = [
    { id: "mo-ta", label: t("tabDescription") },
    { id: "thong-so", label: t("tabSpecs") },
    { id: "danh-gia", label: t("tabReviews", { count: reviews.count }) },
    ...(product.documents.length ? [{ id: "tai-lieu", label: t("tabDocuments") }] : []),
  ];
  const maxBar = Math.max(1, ...reviews.distribution);

  return (
    <div className="mt-10 lg:mt-14">
      <nav aria-label={t("sectionsNav")} className="sticky top-16 z-20 -mx-4 border-y border-[var(--c-border)] bg-white px-4 lg:top-[118px] lg:mx-0 lg:rounded-[6px] lg:border">
        <ul className="flex gap-6 overflow-x-auto">
          {nav.map((n) => (
            <li key={n.id} className="shrink-0">
              <a href={`#${n.id}`} className="block py-3 text-sm font-semibold text-[var(--c-text-secondary)] hover:text-[var(--shop-ink)]">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        <section aria-labelledby="mo-ta">
          <SectionTitle id="mo-ta">{t("tabDescription")}</SectionTitle>
          <RichText doc={product.description} />
        </section>

        <section aria-labelledby="thong-so">
          <SectionTitle id="thong-so">{t("tabSpecs")}</SectionTitle>
          <div className="space-y-4">
            {product.specGroups.map((g) => (
              <table key={g.name} className="w-full overflow-hidden rounded-[6px] bg-white text-sm">
                <caption className="bg-[var(--shop-muted)] px-3 py-2 text-left text-[13px] font-semibold text-[var(--shop-ink)]">{g.name}</caption>
                <tbody>
                  {g.items.map((row) => (
                    <tr key={`${g.name}-${row.label}`} className="border-t border-[var(--c-border)] first:border-t-0">
                      <th scope="row" className="w-[45%] px-3 py-2 text-left font-normal text-[var(--c-text-secondary)]">
                        {row.label}
                      </th>
                      <td className="px-3 py-2 font-medium">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        </section>
      </div>

      <section aria-labelledby="danh-gia" className="mt-12">
        <SectionTitle id="danh-gia">{t("tabReviews", { count: reviews.count })}</SectionTitle>
        {reviews.count === 0 || reviews.average === null ? (
          <p className="rounded-[6px] bg-white p-6 text-sm text-[var(--c-text-secondary)]">{t("reviewsEmpty")}</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="h-fit rounded-[6px] bg-white p-5">
              <p className="shop-price text-[44px] leading-none">{reviews.average.toFixed(1)}</p>
              <Stars value={reviews.average} className="mt-2 block" />
              <p className="mt-1 text-xs text-[var(--c-text-secondary)]">{t("reviewsSummary", { rating: reviews.average.toFixed(1), count: reviews.count })}</p>
              <ul className="mt-4 space-y-1.5">
                {reviews.distribution.map((n, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-10 shrink-0 tabular-nums">{t("starsRow", { stars: 5 - i })}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--shop-muted)]">
                      <span className="block h-full rounded-full bg-[#E9A23B]" style={{ width: `${(n / maxBar) * 100}%` }} />
                    </span>
                    <span className="w-8 shrink-0 text-right text-[var(--c-text-secondary)] tabular-nums">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="space-y-3">
              {reviews.items.map((r) => (
                <li key={r.id} className="rounded-[6px] bg-white p-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Stars value={r.rating} />
                    <span className="sr-only">{t("rating", { rating: r.rating })}</span>
                    {r.title && <span className="text-sm font-semibold">{r.title}</span>}
                  </div>
                  <p className="mt-2 text-sm text-[var(--c-text-2)]">{r.body}</p>
                  <p className="mt-3 text-xs text-[var(--c-text-secondary)]">
                    <span className="font-semibold text-[var(--shop-ink)]">{r.author}</span>
                    {r.verified && <span className="text-[var(--c-success)]"> · {t("verified")}</span>}
                    {r.variantLabel && <span> · {r.variantLabel}</span>}
                    {" · "}
                    <time dateTime={r.createdAt}>{new Date(r.createdAt).toLocaleDateString("vi-VN")}</time>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {product.documents.length > 0 && (
        <section aria-labelledby="tai-lieu" className="mt-12">
          <SectionTitle id="tai-lieu">{t("tabDocuments")}</SectionTitle>
          <ul className="space-y-2">
            {product.documents.map((d) => (
              <li key={d.name} className="flex items-center gap-2 rounded-[6px] bg-white p-4 text-sm">
                <FileText className="size-4 text-[var(--c-text-secondary)]" aria-hidden />
                {d.name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
