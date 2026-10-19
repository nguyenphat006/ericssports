import { z } from "zod";

/**
 * Schema dùng chung cho props khối. Đường dẫn chỉ nhận link nội bộ "/..." hoặc http(s) / mailto / tel —
 * chặn "javascript:" và giao thức lạ (dữ liệu CMS do người dùng nhập).
 */
export const SAFE_HREF = /^(\/(?!\/)|https?:\/\/|mailto:|tel:|#)/i;

export function isSafeHref(href: string): boolean {
  return SAFE_HREF.test(href.trim());
}

export const hrefSchema = z.string().trim().min(1).refine(isSafeHref, { message: "unsafe_href" });

export const linkSchema = z.object({
  label: z.string().trim().min(1),
  href: hrefSchema,
});

/** Ảnh: đường dẫn nội bộ (/media, /shop) hoặc https */
export const imageSchema = z.object({
  src: z.string().trim().regex(/^(\/(?!\/)|https:\/\/)/, { message: "unsafe_src" }),
  alt: z.string().default(""),
});

export const toneSchema = z.enum(["primary", "ink", "soft", "muted"]);
export type Tone = z.infer<typeof toneSchema>;

/** Lớp màu theo tông (nền + chữ) — dùng chung cho thẻ / banner */
export const TONE_CLASSES: Record<Tone, string> = {
  // #D4321A: chữ trắng cỡ nhỏ đạt AA (4.92 : 1); #EA3A1E thì không
  primary: "bg-[var(--shop-primary)] text-white",
  ink: "bg-[var(--shop-ink)] text-white",
  soft: "bg-[var(--shop-accent-soft)] text-[var(--shop-ink)]",
  muted: "bg-[var(--shop-muted)] text-[var(--shop-ink)]",
};
