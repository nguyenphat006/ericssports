import { z } from "zod";
import { richTextDocSchema } from "../../richtext/schema";
import type { BlockSchemaDef } from "../types";

export const richTextBlockSchema = z.object({
  title: z.string().trim().optional(),
  doc: richTextDocSchema,
  /** narrow: cột đọc ~720px (trang chính sách) · wide: theo khung trang */
  width: z.enum(["narrow", "wide"]).default("narrow"),
});

export type RichTextBlockProps = z.output<typeof richTextBlockSchema>;

export const richTextDef: BlockSchemaDef<typeof richTextBlockSchema> = {
  type: "rich-text",
  version: 1,
  group: "general",
  label: "cms.blocks.richText",
  schema: richTextBlockSchema,
  defaults: { width: "narrow", doc: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Nội dung" }] }] } },
};
