import Image from "next/image";
import Link from "next/link";
import { Container, ShopButton } from "@/modules/shop/components/ui";
import type { HeroSlide } from "./schema";

export function Ctas({ slide, onDark }: { slide: HeroSlide; onDark?: boolean }) {
  if (!slide.cta && !slide.secondaryCta) return null;
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {slide.cta && (
        <ShopButton asChild size="lg">
          <Link href={slide.cta.href}>{slide.cta.label}</Link>
        </ShopButton>
      )}
      {slide.secondaryCta && (
        <ShopButton asChild size="lg" variant={onDark ? "ghost" : "outline-ink"} className={onDark ? "border-[1.5px] border-white/70 text-white hover:bg-white/10" : undefined}>
          <Link href={slide.secondaryCta.href}>{slide.secondaryCta.label}</Link>
        </ShopButton>
      )}
    </div>
  );
}

/** Slide ảnh nền lớn, chữ trắng đè trên lớp phủ tối (dùng cho full-image và từng slide của slider) */
export function FullImageSlide({ slide, priority }: { slide: HeroSlide; priority?: boolean }) {
  return (
    <div className="relative isolate flex min-h-[440px] items-end overflow-hidden bg-[var(--shop-ink)] lg:min-h-[560px]">
      <Image src={slide.image.src} alt={slide.image.alt} fill priority={priority} sizes="100vw" className="-z-10 object-cover opacity-60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <Container className="py-12 text-white lg:py-16">
        {slide.eyebrow && <p className="shop-eyebrow text-[var(--shop-accent-soft)]">{slide.eyebrow}</p>}
        <h2 className="shop-display mt-3 max-w-3xl text-[48px] sm:text-[64px] lg:text-[88px]">{slide.title}</h2>
        {slide.text && <p className="mt-4 max-w-lg text-base text-white/85">{slide.text}</p>}
        <Ctas slide={slide} onDark />
      </Container>
    </div>
  );
}
