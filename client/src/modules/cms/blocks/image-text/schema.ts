import { z } from "zod";
import type { BlockSchemaDef } from "../types";
import { imageSchema, linkSchema } from "../shared";

export const imageTextSchema = z.object({
  eyebrow: z.string().trim().optional(),
  title: z.string().trim().min(1),
  /** Văn bản thường, xuống dòng giữ nguyên */
  text: z.string().trim().default(""),
  image: imageSchema,
  imagePosition: z.enum(["left", "right"]).default("left"),
  cta: linkSchema.optional(),
});

export type ImageTextProps = z.output<typeof imageTextSchema>;

export const imageTextDef: BlockSchemaDef<typeof imageTextSchema> = {
  type: "image-text",
  version: 1,
  group: "general",
  label: "cms.blocks.imageText",
  schema: imageTextSchema,
  defaults: { title: "Tiêu đề", text: "Mô tả", image: { src: "/shop/placeholder/bench.svg", alt: "" }, imagePosition: "left" },
};
