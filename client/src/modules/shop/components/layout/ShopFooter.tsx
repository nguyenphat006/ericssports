import { getTranslations } from "next-intl/server";
import { STORE_INFO } from "../../config/store";
import { Container } from "../ui";
import { Wordmark } from "./Wordmark";

/**
 * Footer storefront (nền đen). Các trang chính sách / hỗ trợ chưa có (GĐ3 tạo bằng CMS) nên mục chỉ là chữ,
 * không phải link. Phương thức thanh toán ghi bằng chữ (chưa dùng logo thương hiệu VNPay / MoMo).
 */
export async function ShopFooter() {
  const t = await getTranslations("shop.footer");

  const columns = [
    { title: t("policies"), items: [t("policyWarranty"), t("policyReturn"), t("policyShipping"), t("policyPrivacy")] },
    { title: t("support"), items: [t("supportGuide"), t("supportPayment"), t("supportTrack"), t("supportFaq")] },
  ];
  const payments = [t("paymentCod"), "VNPay", "MoMo", t("paymentBank")];

  return (
    <footer className="mt-auto bg-[var(--shop-ink)] text-white">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-14">
        <div className="sm:col-span-2 lg:col-span-1">
          <Wordmark inverted />
          <p className="mt-3 max-w-xs text-sm text-[var(--shop-on-ink-secondary)]">{t("tagline")}</p>
          <dl className="mt-5 space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="text-[var(--shop-on-ink-secondary)]">{t("hotline")}:</dt>
              <dd>
                <a href={STORE_INFO.hotlineHref} className="font-semibold hover:underline">
                  {STORE_INFO.hotline}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[var(--shop-on-ink-secondary)]">{t("email")}:</dt>
              <dd>
                <a href={`mailto:${STORE_INFO.email}`} className="hover:underline">
                  {STORE_INFO.email}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[var(--shop-on-ink-secondary)]">{t("hours")}:</dt>
              <dd>{STORE_INFO.hours}</dd>
            </div>
          </dl>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="shop-display-soft text-base">{col.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--shop-on-ink-secondary)]">
              {col.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="shop-display-soft text-base">{t("payments")}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {payments.map((p) => (
              <li key={p} className="rounded-[4px] border border-white/15 px-2.5 py-1 text-xs font-semibold">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="py-4 text-xs text-[var(--shop-on-ink-secondary)]">{t("copyright", { year: new Date().getFullYear() })}</Container>
      </div>
    </footer>
  );
}
