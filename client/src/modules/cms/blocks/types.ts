import type { z } from "zod";
import type { MessageKey } from "@/i18n/types";

export type BlockGroup = "general" | "commerce";

/**
 * Phần "dữ liệu" của khối (không có component) — GĐ3 trình soạn import phần này để sinh form
 * mà không kéo theo component render.
 */
export interface BlockSchemaDef<S extends z.ZodType = z.ZodType> {
  type: string;
  /** Tăng khi đổi cấu trúc props; kèm `migrate` để đọc được dữ liệu cũ */
  version: number;
  group: BlockGroup;
  label: MessageKey;
  schema: S;
  /** Props mặc định khi thêm khối mới (GĐ3) */
  defaults: z.input<S>;
  migrate?: (props: unknown, fromVersion: number) => unknown;
}

export type BlockComponent<P> = (args: { props: P; blockId: string }) => React.ReactNode | Promise<React.ReactNode>;

export interface BlockDefinition<S extends z.ZodType = z.ZodType> extends BlockSchemaDef<S> {
  Component: BlockComponent<z.output<S>>;
}

export function defineBlock<S extends z.ZodType>(def: BlockSchemaDef<S>, Component: BlockComponent<z.output<S>>): BlockDefinition {
  return { ...def, Component } as unknown as BlockDefinition;
}
