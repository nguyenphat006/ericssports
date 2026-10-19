import { z } from "zod";
import type { BlockSchemaDef } from "../types";
import { imageSchema, linkSchema } from "../shared";

export const ctaBannerSchema = z.object({
  title: z.string().trim().min(1),
  text: z.string().trim().optional(),
  cta: linkSchema,
  tone: z.enum(["primary", "ink"]).default("ink"),
  image: imageSchema.optional(),
});

export type CtaBannerProps = z.output<typeof ctaBannerSchema>;

export const ctaBannerDef: BlockSchemaDef<typeof ctaBannerSchema> = {
  type: "cta-banner",
  version: 1,
  group: "general",
  label: "cms.blocks.ctaBanner",
  schema: ctaBannerSchema,
  defaults: { title: "Kêu gọi hành động", cta: { label: "Xem ngay", href: "/" }, tone: "ink" },
};
