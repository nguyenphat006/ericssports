import { z } from "zod";
import { hrefSchema } from "../blocks/shared";
import type { RichTextDoc } from "./types";

/** Kiểm tra rich text từ CMS đúng tập node cho phép (types.ts). Node lạ -> doc không hợp lệ -> khối bị bỏ qua. */

const markSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bold") }),
  z.object({ type: z.literal("italic") }),
  z.object({ type: z.literal("link"), attrs: z.object({ href: hrefSchema }) }),
]);

const inlineSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: z.string(), marks: z.array(markSchema).optional() }),
  z.object({ type: z.literal("hardBreak") }),
]);

const paragraphSchema = z.object({ type: z.literal("paragraph"), content: z.array(inlineSchema).optional() });

const listItemSchema = z.object({ type: z.literal("listItem"), content: z.array(paragraphSchema) });

const blockSchema = z.discriminatedUnion("type", [
  paragraphSchema,
  z.object({ type: z.literal("heading"), attrs: z.object({ level: z.union([z.literal(2), z.literal(3)]) }), content: z.array(inlineSchema).optional() }),
  z.object({ type: z.literal("bulletList"), content: z.array(listItemSchema) }),
  z.object({ type: z.literal("orderedList"), content: z.array(listItemSchema) }),
  z.object({
    type: z.literal("image"),
    attrs: z.object({ src: z.string().regex(/^(\/(?!\/)|https:\/\/)/), alt: z.string() }),
  }),
  z.object({ type: z.literal("blockquote"), content: z.array(paragraphSchema) }),
]);

export const richTextDocSchema: z.ZodType<RichTextDoc> = z.object({
  type: z.literal("doc"),
  content: z.array(blockSchema),
});
