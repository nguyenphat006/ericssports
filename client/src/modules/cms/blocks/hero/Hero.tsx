import Image from "next/image";
import { Container } from "@/modules/shop/components/ui";
import type { BlockComponent } from "../types";
import type { HeroProps, HeroSlide } from "./schema";
import { Ctas, FullImageSlide } from "./FullImageSlide";
import { HeroSlider } from "./HeroSlider";

function SplitHero({ slide }: { slide: HeroSlide }) {
  return (
    <section className="bg-white">
      <Container className="grid items-center gap-8 py-10 md:grid-cols-[1.1fr_1fr] lg:py-16">
        <div>
          {slide.eyebrow && <p className="shop-eyebrow text-[var(--shop-primary)]">{slide.eyebrow}</p>}
          <h2 className="shop-display mt-3 text-[52px] sm:text-[64px] lg:text-[88px]">{slide.title}</h2>
          {slide.text && <p className="mt-4 max-w-md text-base text-[var(--c-text-secondary)]">{slide.text}</p>}
          <Ctas slide={slide} />
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] bg-[var(--shop-muted)]">
          <Image
            src={slide.image.src}
            alt={slide.image.alt}
            fill
            priority
            sizes="(min-width: 1280px) 600px, (min-width: 768px) 48vw, 100vw"
            className={slide.image.fit === "cover" ? "object-cover" : "object-contain p-10"}
          />
        </div>
      </Container>
    </section>
  );
}

/** Hero (spec 6.3): split · full-image · slider. Tiêu đề hero là h2 — h1 của trang do tiêu đề trang CMS giữ. */
export const Hero: BlockComponent<HeroProps> = ({ props }) => {
  const [first] = props.slides;
  if (props.variant === "split") return <SplitHero slide={first} />;
  if (props.variant === "full-image" || props.slides.length === 1) {
    return (
      <section>
        <FullImageSlide slide={first} priority />
      </section>
    );
  }
  return <HeroSlider slides={props.slides} autoplaySeconds={props.autoplaySeconds} />;
};
