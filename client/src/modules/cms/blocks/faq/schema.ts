import { z } from "zod";
import type { BlockSchemaDef } from "../types";

export const faqSchema = z.object({
  title: z.string().trim().optional(),
  items: z.array(z.object({ question: z.string().trim().min(1), answer: z.string().trim().min(1) })).min(1).max(20),
});

export type FaqProps = z.output<typeof faqSchema>;

export const faqDef: BlockSchemaDef<typeof faqSchema> = {
  type: "faq",
  version: 1,
  group: "general",
  label: "cms.blocks.faq",
  schema: faqSchema,
  defaults: { title: "Câu hỏi thường gặp", items: [{ question: "Câu hỏi?", answer: "Câu trả lời." }] },
};
