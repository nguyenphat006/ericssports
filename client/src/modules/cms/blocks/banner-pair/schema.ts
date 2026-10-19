import { z } from "zod";
import type { BlockSchemaDef } from "../types";
import { hrefSchema, imageSchema, toneSchema } from "../shared";

const bannerSchema = z.object({
  eyebrow: z.string().trim().optional(),
  title: z.string().trim().min(1),
  text: z.string().trim().optional(),
  href: hrefSchema,
  tone: toneSchema.default("ink"),
  image: imageSchema.optional(),
});

export const bannerPairSchema = z.object({
  items: z.array(bannerSchema).length(2),
});

export type BannerPairProps = z.output<typeof bannerPairSchema>;

export const bannerPairDef: BlockSchemaDef<typeof bannerPairSchema> = {
  type: "banner-pair",
  version: 1,
  group: "general",
  label: "cms.blocks.bannerPair",
  schema: bannerPairSchema,
  defaults: {
    items: [
      { title: "Banner 1", href: "/", tone: "ink" },
      { title: "Banner 2", href: "/", tone: "soft" },
    ],
  },
};
