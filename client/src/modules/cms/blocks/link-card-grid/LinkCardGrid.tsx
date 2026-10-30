import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/modules/shop/components/icons";
import { cn } from "@/lib/utils";
import { Container, SectionHeading } from "@/modules/shop/components/ui";
import type { BlockComponent } from "../types";
import { PHOTO_SCRIM, TONE_CLASSES } from "../shared";
import type { LinkCardGridProps } from "./schema";

/** Lưới thẻ màu dẫn tới danh mục / trang (vd. "Bạn muốn tập gì?") */
export const LinkCardGrid: BlockComponent<LinkCardGridProps> = ({ props }) => (
  <section className="py-10 lg:py-16">
    <Container>
      {props.title && <SectionHeading eyebrow={props.eyebrow} title={props.title} />}
      <div className={cn("grid gap-3 lg:gap-4", props.items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
        {props.items.map((item, i) => {
          const photo = item.image?.fit === "cover";
          return (
            <Link
              key={i}
              href={item.href}
              className={cn(
                "group relative isolate flex min-h-[180px] flex-col justify-end overflow-hidden rounded-[6px] p-5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:p-6",
                photo ? "min-h-[260px] bg-[var(--shop-ink)] text-white lg:min-h-[360px]" : cn("lg:min-h-[240px]", TONE_CLASSES[item.tone]),
              )}
            >
              {item.image && (
                <Image
                  src={item.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className={cn("-z-10 transition-transform duration-500 group-hover:scale-105", photo ? "object-cover" : "object-contain p-6 opacity-30")}
                />
              )}
              {photo && <span className={cn("absolute inset-0 -z-10", PHOTO_SCRIM)} aria-hidden />}
              <span className="relative">
                <span className="shop-display block text-[32px] lg:text-[40px]">{item.title}</span>
                {item.text && <span className="mt-1 block text-sm">{item.text}</span>}
                <ArrowRight className="mt-3 size-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </Container>
  </section>
);
