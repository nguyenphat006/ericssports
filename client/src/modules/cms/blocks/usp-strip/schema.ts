import { z } from "zod";
import type { BlockSchemaDef } from "../types";
import { hrefSchema } from "../shared";

export const USP_ICONS = ["truck", "wrench", "shield", "refresh", "card", "headset", "award", "clock"] as const;
export type UspIcon = (typeof USP_ICONS)[number];

export const uspStripSchema = z.object({
  items: z
    .array(
      z.object({
        icon: z.enum(USP_ICONS),
        title: z.string().trim().min(1),
        text: z.string().trim().optional(),
        /** Trang giải thích chi tiết (chính sách giao hàng, bảo hành…) */
        href: hrefSchema.optional(),
      }),
    )
    .min(2)
    .max(4),
});

export type UspStripProps = z.output<typeof uspStripSchema>;

export const uspStripDef: BlockSchemaDef<typeof uspStripSchema> = {
  type: "usp-strip",
  version: 1,
  group: "general",
  label: "cms.blocks.uspStrip",
  schema: uspStripSchema,
  defaults: { items: [{ icon: "truck", title: "Giao toàn quốc" }, { icon: "shield", title: "Bảo hành chính hãng" }] },
};
