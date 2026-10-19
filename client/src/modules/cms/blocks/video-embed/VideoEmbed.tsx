import { Container } from "@/modules/shop/components/ui";
import type { BlockComponent } from "../types";
import type { VideoEmbedProps } from "./schema";
import { VideoPlayer } from "./VideoPlayer";

export const VideoEmbed: BlockComponent<VideoEmbedProps> = ({ props }) => (
  <section className="py-10 lg:py-16">
    <Container className="max-w-[960px]">
      <h2 className="shop-display mb-5 text-[28px] lg:text-[40px]">{props.title}</h2>
      <VideoPlayer youtubeId={props.youtubeId} title={props.title} poster={props.poster} />
      {props.caption && <p className="mt-3 text-sm text-[var(--c-text-secondary)]">{props.caption}</p>}
    </Container>
  </section>
);
