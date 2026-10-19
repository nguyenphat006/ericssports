"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Video YouTube chỉ tải iframe khi bấm phát (không tải sẵn ~1MB script của YouTube → giữ điểm hiệu năng).
 * Dùng tên miền youtube-nocookie.com.
 */
export function VideoPlayer({ youtubeId, title, poster }: { youtubeId: string; title: string; poster?: { src: string; alt: string } }) {
  const t = useTranslations("cms.ui");
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-[6px] bg-[var(--shop-ink)]">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 flex items-center justify-center" aria-label={t("playVideo", { title })}>
          {poster && <Image src={poster.src} alt={poster.alt} fill sizes="(min-width: 960px) 960px, 100vw" className="object-cover opacity-70" />}
          <span className="relative flex size-16 items-center justify-center rounded-full bg-[var(--shop-primary)] text-white transition-transform group-hover:scale-110">
            <Play className="ml-1 size-7 fill-current" aria-hidden />
          </span>
        </button>
      )}
    </div>
  );
}
