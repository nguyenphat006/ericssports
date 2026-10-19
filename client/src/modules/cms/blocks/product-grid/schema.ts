import { z } from "zod";
import type { BlockSchemaDef } from "../types";
import { hrefSchema } from "../shared";

/** Điều kiện lấy sản phẩm (spec 6.2) — không lưu danh sách chụp sẵn để giá / tồn kho luôn mới */
const selectionSchema = z.object({
  source: z.enum(["category", "bestseller", "new", "sale", "manual"]),
  categoryId: z.string().optional(),
  productIds: z.array(z.string()).max(24).optional(),
  limit: z.number().int().min(1).max(24).default(8),
});

export const productGridSchema = z.object({
  eyebrow: z.string().trim().optional(),
  title: z.string().trim().min(1),
  viewAllHref: hrefSchema.optional(),
  /** 1 tab = lưới thường; 2–4 tab = có thanh chuyển tab */
  tabs: z.array(z.object({ label: z.string().trim().min(1), selection: selectionSchema })).min(1).max(4),
});

export type ProductGridProps = z.output<typeof productGridSchema>;

export const productGridDef: BlockSchemaDef<typeof productGridSchema> = {
  type: "product-grid",
  version: 1,
  group: "commerce",
  label: "cms.blocks.productGrid",
  schema: productGridSchema,
  defaults: { title: "Sản phẩm nổi bật", tabs: [{ label: "Nổi bật", selection: { source: "bestseller", limit: 8 } }] },
};
