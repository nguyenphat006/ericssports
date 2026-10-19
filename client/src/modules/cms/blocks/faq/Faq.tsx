import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Container } from "@/modules/shop/components/ui";
import { JsonLd } from "../../seo/JsonLd";
import type { BlockComponent } from "../types";
import type { FaqProps } from "./schema";

/** Câu hỏi thường gặp dạng accordion + JSON-LD FAQPage (SEO) */
export const Faq: BlockComponent<FaqProps> = ({ props }) => (
  <section className="py-10 lg:py-16">
    <Container className="max-w-[880px]">
      {props.title && <h2 className="shop-display mb-6 text-[28px] lg:text-[40px]">{props.title}</h2>}
      <ul className="divide-y divide-[var(--c-border)] rounded-[6px] bg-white px-5">
        {props.items.map((item, i) => (
          <li key={i}>
            <Collapsible>
              <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-semibold text-[var(--shop-ink)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                {item.question}
                <ChevronDown className="size-5 shrink-0 text-[var(--c-text-tertiary)] transition-transform group-data-[state=open]:rotate-180" aria-hidden />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className="pb-4 whitespace-pre-line text-[var(--c-text-secondary)]">{item.answer}</p>
              </CollapsibleContent>
            </Collapsible>
          </li>
        ))}
      </ul>
    </Container>
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: props.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }}
    />
  </section>
);
