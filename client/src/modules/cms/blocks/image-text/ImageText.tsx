import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Container, ShopButton } from "@/modules/shop/components/ui";
import type { BlockComponent } from "../types";
import type { ImageTextProps } from "./schema";

export const ImageText: BlockComponent<ImageTextProps> = ({ props }) => (
  <section className="py-10 lg:py-16">
    <Container className="grid items-center gap-8 md:grid-cols-2 lg:gap-12">
      <div className={cn("relative aspect-[4/3] overflow-hidden rounded-[6px] bg-[var(--shop-muted)]", props.imagePosition === "right" && "md:order-2")}>
        <Image src={props.image.src} alt={props.image.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-contain p-8" />
      </div>
      <div>
        {props.eyebrow && <p className="shop-eyebrow text-[var(--shop-primary)]">{props.eyebrow}</p>}
        <h2 className="shop-display mt-2 text-[32px] lg:text-[48px]">{props.title}</h2>
        {props.text && <p className="mt-4 whitespace-pre-line text-[var(--c-text-secondary)]">{props.text}</p>}
        {props.cta && (
          <ShopButton asChild size="lg" className="mt-6">
            <Link href={props.cta.href}>{props.cta.label}</Link>
          </ShopButton>
        )}
      </div>
    </Container>
  </section>
);
