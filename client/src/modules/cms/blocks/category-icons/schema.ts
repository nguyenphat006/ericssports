import { z } from "zod";
import type { BlockSchemaDef } from "../types";

export const categoryIconsSchema = z.object({
  title: z.string().trim().optional(),
  /** Danh mục hiển thị theo thứ tự; bỏ trống = các danh mục gốc */
  categoryIds: z.array(z.string()).max(12).default([]),
});

export type CategoryIconsProps = z.output<typeof categoryIconsSchema>;

export const categoryIconsDef: BlockSchemaDef<typeof categoryIconsSchema> = {
  type: "category-icons",
  version: 1,
  group: "commerce",
  label: "cms.blocks.categoryIcons",
  schema: categoryIconsSchema,
  defaults: { categoryIds: [] },
};
