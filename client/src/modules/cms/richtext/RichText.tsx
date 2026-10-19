import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { isSafeHref } from "../blocks/shared";
import type { RichTextBlock, RichTextDoc, RichTextInline, RichTextText } from "./types";

/**
 * Render rich text JSON (Tiptap) thành React — không dùng dangerouslySetInnerHTML.
 * Link ngoài mở tab mới (rel noopener); link không an toàn hiển thị như chữ thường.
 */

function renderText(node: RichTextText, key: number) {
  let el: React.ReactNode = node.text;
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") el = <strong>{el}</strong>;
    else if (mark.type === "italic") el = <em>{el}</em>;
    else if (mark.type === "link" && isSafeHref(mark.attrs.href)) {
      const href = mark.attrs.href;
      el = href.startsWith("/") ? (
        <Link href={href}>{el}</Link>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {el}
        </a>
      );
    }
  }
  return <span key={key}>{el}</span>;
}

function renderInline(nodes: RichTextInline[] = []) {
  return nodes.map((n, i) => (n.type === "hardBreak" ? <br key={i} /> : renderText(n, i)));
}

function renderBlock(block: RichTextBlock, key: number): React.ReactNode {
  switch (block.type) {
    case "paragraph":
      return <p key={key}>{renderInline(block.content)}</p>;
    case "heading":
      return block.attrs.level === 2 ? <h2 key={key}>{renderInline(block.content)}</h2> : <h3 key={key}>{renderInline(block.content)}</h3>;
    case "bulletList":
    case "orderedList": {
      const Tag = block.type === "bulletList" ? "ul" : "ol";
      return (
        <Tag key={key}>
          {block.content.map((item, i) => (
            <li key={i}>{item.content.map((p, j) => renderBlock(p, j))}</li>
          ))}
        </Tag>
      );
    }
    case "image":
      return (
        <span key={key} className="relative my-4 block aspect-[16/9] overflow-hidden rounded-[6px] bg-[var(--shop-muted)]">
          <Image src={block.attrs.src} alt={block.attrs.alt} fill sizes="(min-width: 768px) 720px, 100vw" className="object-contain" />
        </span>
      );
    case "blockquote":
      return <blockquote key={key}>{block.content.map((p, j) => renderBlock(p, j))}</blockquote>;
    default:
      return null;
  }
}

/** Kiểu chữ văn bản dài (tiêu đề, đoạn, danh sách) theo theme storefront */
export const PROSE_CLASSES =
  "text-[15px] leading-[1.7] text-[var(--c-text-2)] [&_h2]:[font-stretch:75%] [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:leading-tight [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:text-[var(--shop-ink)] [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[var(--shop-ink)] [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_li>p]:my-0 [&_a]:font-medium [&_a]:text-[var(--shop-primary)] [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-[var(--shop-ink)] [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--shop-primary-bright)] [&_blockquote]:pl-4 [&_blockquote]:italic [&>*:first-child]:mt-0";

export function RichText({ doc, className }: { doc: RichTextDoc; className?: string }) {
  return <div className={cn(PROSE_CLASSES, className)}>{doc.content.map(renderBlock)}</div>;
}
