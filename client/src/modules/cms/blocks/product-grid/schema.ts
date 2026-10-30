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
  /** grid: lưới nhiều hàng · carousel: một hàng vuốt ngang (trang chủ) */
  layout: z.enum(["grid", "carousel"]).default("grid"),
  /** 1 tab = lưới thường; 2–4 tab = có thanh chuyển tab */
  tabs: z.array(z.object({ label: z.string().trim().min(1), selection: selectionSchema })).min(1).max(4),
});

export type ProductGridProps = z.output<typeof productGridSchema>;

export const productGridDef: BlockSchemaDef<typeof productGridSchema> = {
  type: "product-grid",
  version: 2,
  group: "commerce",
  label: "cms.blocks.productGrid",
  schema: productGridSchema,
  // v1 -> v2: thêm `layout` (dữ liệu cũ giữ dạng lưới)
  migrate: (props, from) => (from < 2 ? { ...(props as object), layout: "grid" } : props),
  defaults: { title: "Sản phẩm nổi bật", layout: "grid", tabs: [{ label: "Nổi bật", selection: { source: "bestseller", limit: 8 } }] },
};
