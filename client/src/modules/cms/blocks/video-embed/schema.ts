import { z } from "zod";
import type { BlockSchemaDef } from "../types";
import { imageSchema } from "../shared";

export const videoEmbedSchema = z.object({
  title: z.string().trim().min(1),
  /** Mã video YouTube 11 ký tự (chỉ nhận mã, không nhận URL / HTML nhúng tùy ý) */
  youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  poster: imageSchema.optional(),
  caption: z.string().trim().optional(),
});

export type VideoEmbedProps = z.output<typeof videoEmbedSchema>;

export const videoEmbedDef: BlockSchemaDef<typeof videoEmbedSchema> = {
  type: "video-embed",
  version: 1,
  group: "general",
  label: "cms.blocks.videoEmbed",
  schema: videoEmbedSchema,
  defaults: { title: "Video", youtubeId: "aaaaaaaaaaa" },
};
