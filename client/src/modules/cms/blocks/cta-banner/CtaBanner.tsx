import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Container, ShopButton } from "@/modules/shop/components/ui";
import type { BlockComponent } from "../types";
import { TONE_CLASSES } from "../shared";
import type { CtaBannerProps } from "./schema";

export const CtaBanner: BlockComponent<CtaBannerProps> = ({ props }) => (
  <section className="py-8 lg:py-12">
    <Container>
      <div className={cn("relative isolate grid items-center gap-6 overflow-hidden rounded-[6px] p-6 md:grid-cols-[1fr_auto] lg:p-10", TONE_CLASSES[props.tone])}>
        {props.image && <Image src={props.image.src} alt="" fill sizes="100vw" className="-z-10 object-contain object-right p-6 opacity-20" />}
        <div>
          <h2 className="shop-display text-[32px] lg:text-[48px]">{props.title}</h2>
          {props.text && <p className="mt-2 max-w-xl text-base">{props.text}</p>}
        </div>
        <ShopButton asChild size="lg" variant={props.tone === "primary" ? "ink" : "primary"}>
          <Link href={props.cta.href}>{props.cta.label}</Link>
        </ShopButton>
      </div>
    </Container>
  </section>
);
