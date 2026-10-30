"use client";

import { useCarousel } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "../icons";

interface CarouselArrowsProps {
  prevLabel: string;
  nextLabel: string;
  /** Lớp vị trí / màu cho từng nút (vd. hero: nền tối mờ) */
  className?: string;
}

/**
 * Nút trước / sau cho `Carousel` của storefront (icon Phosphor, nhãn theo ngôn ngữ) — đặt bên trong <Carousel>.
 * Hết đường cuộn thì ẩn nút (không để nút mờ vô dụng). Chỉ hiện từ md: điện thoại vuốt.
 */
export function CarouselArrows({ prevLabel, nextLabel, className }: CarouselArrowsProps) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();
  const base = cn(
    "absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-[var(--shop-ink)] shadow-[0_2px_10px_rgb(28_25_23/0.16)] transition outline-none md:grid",
    "hover:bg-[var(--shop-ink)] hover:text-white focus-visible:ring-[3px] focus-visible:ring-ring/50",
    className,
  );
  return (
    <>
      {canScrollPrev && (
        <button type="button" onClick={scrollPrev} aria-label={prevLabel} className={cn(base, "left-2 lg:-left-5")}>
          <ChevronLeft className="size-5" />
        </button>
      )}
      {canScrollNext && (
        <button type="button" onClick={scrollNext} aria-label={nextLabel} className={cn(base, "right-2 lg:-right-5")}>
          <ChevronRight className="size-5" />
        </button>
      )}
    </>
  );
}
