import { z } from "zod";
import type { BlockSchemaDef } from "../types";
import { hrefSchema, imageSchema, toneSchema } from "../shared";

export const linkCardGridSchema = z.object({
  eyebrow: z.string().trim().optional(),
  title: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        text: z.string().trim().optional(),
        href: hrefSchema,
        tone: toneSchema.default("muted"),
        image: imageSchema.optional(),
      }),
    )
    .min(2)
    .max(6),
});

export type LinkCardGridProps = z.output<typeof linkCardGridSchema>;

export const linkCardGridDef: BlockSchemaDef<typeof linkCardGridSchema> = {
  type: "link-card-grid",
  version: 1,
  group: "general",
  label: "cms.blocks.linkCardGrid",
  schema: linkCardGridSchema,
  defaults: { items: [{ title: "Thẻ 1", href: "/", tone: "primary" }, { title: "Thẻ 2", href: "/", tone: "ink" }] },
};
