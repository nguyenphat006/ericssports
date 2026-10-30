"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { CarouselArrows } from "@/modules/shop/components/ui";
import { FullImageSlide } from "./FullImageSlide";
import type { HeroSlide } from "./schema";

/**
 * Hero nhiều slide: vuốt / nút trước-sau / chấm trang; tự chuyển, dừng khi rê chuột hoặc focus bàn phím,
 * tắt hẳn khi người dùng bật "giảm chuyển động".
 */
export function HeroSlider({ slides, autoplaySeconds }: { slides: HeroSlide[]; autoplaySeconds: number }) {
  const t = useTranslations("cms.ui");
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || paused || autoplaySeconds <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => api.scrollNext(), autoplaySeconds * 1000);
    return () => window.clearInterval(timer);
  }, [api, paused, autoplaySeconds]);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  return (
    <section
      aria-roledescription="carousel"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
      className="relative"
    >
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="ml-0">
          {slides.map((slide, i) => (
            <CarouselItem key={i} className="pl-0" aria-roledescription="slide" aria-label={t("slideOf", { current: i + 1, total: slides.length })}>
              <FullImageSlide slide={slide} priority={i === 0} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselArrows prevLabel={t("prevSlide")} nextLabel={t("nextSlide")} className="bg-black/30 text-white shadow-none hover:bg-black/50 lg:left-4 lg:right-4" />
      </Carousel>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={t("goToSlide", { index: i + 1 })}
            aria-current={i === current}
            onClick={() => api?.scrollTo(i)}
            className={cn("h-1.5 rounded-full transition-all", i === current ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80")}
          />
        ))}
      </div>
    </section>
  );
}
