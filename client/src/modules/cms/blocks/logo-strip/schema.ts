import { z } from "zod";
import type { BlockSchemaDef } from "../types";
import { hrefSchema, imageSchema } from "../shared";

export const logoStripSchema = z.object({
  title: z.string().trim().optional(),
  /** Có logo thì hiện ảnh, không có thì hiện tên dạng chữ */
  items: z.array(z.object({ name: z.string().trim().min(1), logo: imageSchema.optional(), href: hrefSchema.optional() })).min(2).max(12),
});

export type LogoStripProps = z.output<typeof logoStripSchema>;

export const logoStripDef: BlockSchemaDef<typeof logoStripSchema> = {
  type: "logo-strip",
  version: 1,
  group: "general",
  label: "cms.blocks.logoStrip",
  schema: logoStripSchema,
  defaults: { items: [{ name: "Thương hiệu A" }, { name: "Thương hiệu B" }] },
};
