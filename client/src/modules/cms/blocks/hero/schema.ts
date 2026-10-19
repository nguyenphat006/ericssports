import { z } from "zod";
import type { BlockSchemaDef } from "../types";
import { imageSchema, linkSchema } from "../shared";

const slideSchema = z.object({
  eyebrow: z.string().trim().optional(),
  title: z.string().trim().min(1),
  text: z.string().trim().optional(),
  image: imageSchema,
  cta: linkSchema.optional(),
  secondaryCta: linkSchema.optional(),
});

export const heroSchema = z.object({
  /** split: chữ trái + ảnh phải · full-image: ảnh nền lớn, chữ đè · slider: nhiều slide ảnh nền */
  variant: z.enum(["split", "full-image", "slider"]).default("split"),
  slides: z.array(slideSchema).min(1).max(5),
  /** Slider tự chuyển (giây, 0 = tắt) */
  autoplaySeconds: z.number().int().min(0).max(30).default(6),
});

export type HeroProps = z.output<typeof heroSchema>;
export type HeroSlide = z.output<typeof slideSchema>;

export const heroDef: BlockSchemaDef<typeof heroSchema> = {
  type: "hero",
  version: 1,
  group: "general",
  label: "cms.blocks.hero",
  schema: heroSchema,
  defaults: {
    variant: "split",
    slides: [{ title: "Tiêu đề lớn", text: "Mô tả ngắn", image: { src: "/shop/placeholder/treadmill.svg", alt: "" } }],
    autoplaySeconds: 6,
  },
};
