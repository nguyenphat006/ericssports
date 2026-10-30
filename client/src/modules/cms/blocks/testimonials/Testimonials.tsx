import { Star } from "@/modules/shop/components/icons";
import { getTranslations } from "next-intl/server";
import { Container, SectionHeading } from "@/modules/shop/components/ui";
import type { BlockComponent } from "../types";
import type { TestimonialsProps } from "./schema";

export const Testimonials: BlockComponent<TestimonialsProps> = async ({ props }) => {
  const t = await getTranslations("shop.product");
  return (
    <section className="py-10 lg:py-16">
      <Container>
        {props.title && <SectionHeading eyebrow={props.eyebrow} title={props.title} />}
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {props.items.map((item, i) => (
            <li key={i}>
              <figure className="flex h-full flex-col rounded-[6px] bg-white p-5 lg:p-6">
                {item.rating && (
                  <div className="mb-3 flex gap-0.5" role="img" aria-label={t("rating", { rating: item.rating })}>
                    {Array.from({ length: 5 }, (_, s) => (
                      <Star key={s} weight={s < item.rating! ? "fill" : "regular"} className={s < item.rating! ? "size-4 text-[#E9A23B]" : "size-4 text-[var(--c-border-strong)]"} />
                    ))}
                  </div>
                )}
                <blockquote className="flex-1 text-[15px] leading-relaxed text-[var(--c-text-2)]">“{item.quote}”</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold text-[var(--shop-ink)]">{item.author}</span>
                  {item.meta && <span className="text-[var(--c-text-secondary)]"> · {item.meta}</span>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
};
