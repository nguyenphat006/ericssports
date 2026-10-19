/**
 * Văn bản có định dạng lưu dạng JSON tương thích Tiptap / ProseMirror (quyết định Q1-A, kế hoạch GĐ2).
 * Chỉ cho phép tập node / mark dưới đây — không có HTML thô nên không có XSS. Trình soạn GĐ3 (Tiptap) bật đúng tập này.
 */

export type RichTextMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "link"; attrs: { href: string } };

export interface RichTextText {
  type: "text";
  text: string;
  marks?: RichTextMark[];
}

export interface RichTextHardBreak {
  type: "hardBreak";
}

export type RichTextInline = RichTextText | RichTextHardBreak;

export interface RichTextParagraph {
  type: "paragraph";
  content?: RichTextInline[];
}

export interface RichTextHeading {
  type: "heading";
  attrs: { level: 2 | 3 };
  content?: RichTextInline[];
}

export interface RichTextListItem {
  type: "listItem";
  content: RichTextParagraph[];
}

export interface RichTextList {
  type: "bulletList" | "orderedList";
  content: RichTextListItem[];
}

export interface RichTextImage {
  type: "image";
  attrs: { src: string; alt: string };
}

export interface RichTextBlockquote {
  type: "blockquote";
  content: RichTextParagraph[];
}

export type RichTextBlock = RichTextParagraph | RichTextHeading | RichTextList | RichTextImage | RichTextBlockquote;

export interface RichTextDoc {
  type: "doc";
  content: RichTextBlock[];
}
