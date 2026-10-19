import { describe, expect, it } from "vitest";
import { z } from "zod";
import { MOCK_PAGES } from "../mocks/pages";
import { richTextDocSchema } from "../richtext/schema";
import type { BlockInstance } from "../types";
import { resolveBlocks } from "./resolve";
import { BLOCK_SCHEMA_BY_TYPE, BLOCK_SCHEMAS } from "./schemas";
import { isSafeHref } from "./shared";
import type { BlockSchemaDef } from "./types";

const block = (over: Partial<BlockInstance>): BlockInstance => ({ id: "b1", type: "faq", version: 1, props: { items: [{ question: "Q?", answer: "A" }] }, ...over });

describe("resolveBlocks", () => {
  it("giữ khối hợp lệ, điền giá trị mặc định từ schema", () => {
    const { blocks, issues } = resolveBlocks([block({ type: "hero", props: { slides: [{ title: "T", image: { src: "/a.svg" } }] } })], BLOCK_SCHEMA_BY_TYPE);
    expect(issues).toEqual([]);
    expect(blocks[0].props).toMatchObject({ variant: "split", autoplaySeconds: 6, slides: [{ title: "T", image: { src: "/a.svg", alt: "" } }] });
  });

  it("bỏ khối ẩn, khối không rõ loại, props sai, phiên bản mới hơn code — không ném lỗi", () => {
    const { blocks, issues } = resolveBlocks(
      [
        block({ id: "ok" }),
        block({ id: "hidden", hidden: true }),
        block({ id: "unknown", type: "khong-co" }),
        block({ id: "bad", props: { items: [] } }),
        block({ id: "future", version: 99 }),
      ],
      BLOCK_SCHEMA_BY_TYPE,
    );
    expect(blocks.map((b) => b.id)).toEqual(["ok"]);
    expect(issues.map((i) => [i.id, i.reason])).toEqual([
      ["unknown", "unknown_type"],
      ["bad", "invalid_props"],
      ["future", "newer_version"],
    ]);
  });

  it("chạy migrate cho dữ liệu phiên bản cũ", () => {
    const def: BlockSchemaDef = {
      type: "demo",
      version: 2,
      group: "general",
      label: "cms.blocks.faq",
      schema: z.object({ heading: z.string() }),
      defaults: { heading: "" },
      migrate: (props, from) => (from === 1 ? { heading: (props as { title: string }).title } : props),
    };
    const { blocks } = resolveBlocks([block({ type: "demo", version: 1, props: { title: "Cũ" } })], new Map([["demo", def]]));
    expect(blocks[0].props).toEqual({ heading: "Cũ" });
  });
});

describe("dữ liệu mẫu", () => {
  it("mọi khối của mọi trang mẫu đều hợp lệ", () => {
    for (const page of MOCK_PAGES) {
      const { issues } = resolveBlocks(page.blocks, BLOCK_SCHEMA_BY_TYPE);
      expect(issues, page.slug).toEqual([]);
    }
  });

  it("giá trị mặc định (dùng khi thêm khối ở GĐ3) hợp lệ với schema của chính khối", () => {
    for (const def of BLOCK_SCHEMAS) expect(def.schema.safeParse(def.defaults).success, def.type).toBe(true);
  });

  it("slug trang không trùng", () => {
    const slugs = MOCK_PAGES.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("an toàn dữ liệu CMS", () => {
  it.each(["/danh-muc/cardio", "https://example.com", "mailto:a@b.vn", "tel:19000000", "#san-pham"])("link hợp lệ: %s", (href) => {
    expect(isSafeHref(href)).toBe(true);
  });

  it.each(["javascript:alert(1)", " JavaScript:alert(1)", "//evil.com", "data:text/html,x", "vbscript:x"])("chặn link: %s", (href) => {
    expect(isSafeHref(href)).toBe(false);
  });

  it("rich text chặn link javascript: và node lạ", () => {
    const withLink = (href: string) => ({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "link", attrs: { href } }] }] }],
    });
    expect(richTextDocSchema.safeParse(withLink("/ok")).success).toBe(true);
    expect(richTextDocSchema.safeParse(withLink("javascript:alert(1)")).success).toBe(false);
    expect(richTextDocSchema.safeParse({ type: "doc", content: [{ type: "html", html: "<script>" }] }).success).toBe(false);
  });
});
