import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/modules/shop/components/ui";
import type { BlockComponent } from "../types";
import { TONE_CLASSES } from "../shared";
import type { BannerPairProps } from "./schema";

export const BannerPair: BlockComponent<BannerPairProps> = ({ props }) => (
  <section className="py-8 lg:py-12">
    <Container className="grid gap-3 md:grid-cols-2 lg:gap-4">
      {props.items.map((item, i) => (
        <Link
          key={i}
          href={item.href}
          className={cn(
            "group relative isolate flex min-h-[200px] flex-col justify-end overflow-hidden rounded-[6px] p-6 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:min-h-[260px]",
            TONE_CLASSES[item.tone],
          )}
        >
          {item.image && (
            <Image src={item.image.src} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="-z-10 object-contain object-right p-6 opacity-25 transition-transform duration-300 group-hover:scale-105" />
          )}
          {item.eyebrow && <span className="shop-eyebrow">{item.eyebrow}</span>}
          <span className="shop-display mt-1 text-[32px] lg:text-[40px]">{item.title}</span>
          {item.text && <span className="mt-1 max-w-sm text-sm">{item.text}</span>}
          <ArrowRight className="mt-3 size-5 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      ))}
    </Container>
  </section>
);
