import Image from "next/image";
import Link from "next/link";
import { Container } from "@/modules/shop/components/ui";
import type { BlockComponent } from "../types";
import type { LogoStripProps } from "./schema";

export const LogoStrip: BlockComponent<LogoStripProps> = ({ props }) => (
  <section className="border-y border-[var(--c-border)] bg-white py-8">
    <Container>
      {props.title && <h2 className="shop-eyebrow mb-5 text-center text-[var(--c-text-tertiary)]">{props.title}</h2>}
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {props.items.map((item, i) => {
          const content = item.logo ? (
            <Image src={item.logo.src} alt={item.logo.alt || item.name} width={120} height={40} className="h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
          ) : (
            <span className="shop-display-soft text-xl text-[var(--c-text-tertiary)] transition-colors hover:text-[var(--shop-ink)]">{item.name}</span>
          );
          return <li key={i}>{item.href ? <Link href={item.href}>{content}</Link> : content}</li>;
        })}
      </ul>
    </Container>
  </section>
);
