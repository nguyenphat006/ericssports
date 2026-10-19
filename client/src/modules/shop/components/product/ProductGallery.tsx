"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Maximize2, Play } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { VideoPlayer } from "@/modules/cms/blocks/video-embed/VideoPlayer";
import type { ProductMedia } from "../../types";

interface ProductGalleryProps {
  media: ProductMedia[];
  /** Ảnh cần hiển thị (đổi khi chọn biến thể) */
  index: number;
  onIndexChange: (index: number) => void;
  badge?: React.ReactNode;
}

/** Gallery: ảnh lớn vuốt được (mobile) + hàng thumbnail (desktop); bấm ảnh để phóng to; hỗ trợ video. */
export function ProductGallery({ media, index, onIndexChange, badge }: ProductGalleryProps) {
  const t = useTranslations("shop.product");
  const [api, setApi] = useState<CarouselApi>();
  const [zoomOpen, setZoomOpen] = useState(false);

  // Đồng bộ carousel <-> chỉ số ảnh (chọn biến thể đổi ảnh; vuốt đổi chỉ số)
  useEffect(() => {
    if (api && api.selectedScrollSnap() !== index) api.scrollTo(index);
  }, [api, index]);
  useEffect(() => {
    if (!api) return;
    const onSelect = () => onIndexChange(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onIndexChange]);

  const current = media[index];

  return (
    <div aria-label={t("galleryLabel")} role="region">
      <div className="relative">
        <Carousel setApi={setApi} opts={{ loop: false }}>
          <CarouselContent className="ml-0">
            {media.map((m, i) => (
              <CarouselItem key={i} className="pl-0">
                <div className="relative aspect-square overflow-hidden rounded-[6px] bg-white">
                  {m.kind === "image" ? (
                    <button type="button" onClick={() => setZoomOpen(true)} className="group absolute inset-0 cursor-zoom-in" aria-label={t("zoom")}>
                      <Image src={m.src} alt={m.alt} fill priority={i === 0} sizes="(min-width: 1024px) 600px, 100vw" className="object-contain p-8 lg:p-12" />
                      <Maximize2 className="absolute right-3 bottom-3 size-5 text-[var(--c-text-tertiary)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    </button>
                  ) : (
                    <div className="absolute inset-0 flex items-center p-4">
                      <div className="w-full">
                        <VideoPlayer youtubeId={m.youtubeId} title={m.title} poster={m.poster} />
                      </div>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {badge && <div className="pointer-events-none absolute top-3 left-3 flex gap-1">{badge}</div>}
        <span className="absolute right-3 bottom-3 rounded-[3px] bg-black/60 px-2 py-0.5 text-xs text-white tabular-nums lg:hidden">
          {t("imageOf", { current: index + 1, total: media.length })}
        </span>
      </div>

      {media.length > 1 && (
        <ul className="mt-2 hidden gap-2 lg:grid lg:grid-cols-5">
          {media.map((m, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => onIndexChange(i)}
                aria-label={m.kind === "image" ? t("viewImage", { index: i + 1 }) : t("playVideo")}
                aria-current={i === index}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-[4px] border-2 bg-white transition-colors",
                  i === index ? "border-[var(--shop-primary)]" : "border-transparent hover:border-[var(--c-border-strong)]",
                )}
              >
                <Image src={m.kind === "image" ? m.src : m.poster.src} alt="" fill sizes="110px" className="object-contain p-2" />
                {m.kind === "video" && <Play className="absolute inset-0 m-auto size-6 fill-white text-white drop-shadow" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-[min(96vw,1100px)] border-0 bg-white p-0">
          <DialogTitle className="sr-only">{current?.kind === "image" ? current.alt : t("galleryLabel")}</DialogTitle>
          {current?.kind === "image" && (
            <div className="relative aspect-square max-h-[86vh] w-full">
              <Image src={current.src} alt={current.alt} fill sizes="96vw" className="object-contain p-6" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

