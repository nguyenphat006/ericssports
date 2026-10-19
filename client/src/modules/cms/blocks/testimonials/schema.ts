import { z } from "zod";
import type { BlockSchemaDef } from "../types";

export const testimonialsSchema = z.object({
  eyebrow: z.string().trim().optional(),
  title: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        quote: z.string().trim().min(1),
        author: z.string().trim().min(1),
        /** Dòng phụ: khu vực, sản phẩm đã mua */
        meta: z.string().trim().optional(),
        rating: z.number().int().min(1).max(5).optional(),
      }),
    )
    .min(1)
    .max(6),
});

export type TestimonialsProps = z.output<typeof testimonialsSchema>;

export const testimonialsDef: BlockSchemaDef<typeof testimonialsSchema> = {
  type: "testimonials",
  version: 1,
  group: "general",
  label: "cms.blocks.testimonials",
  schema: testimonialsSchema,
  defaults: { items: [{ quote: "Cảm nhận của khách hàng", author: "Khách hàng", rating: 5 }] },
};
