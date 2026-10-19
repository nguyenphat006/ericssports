import type { BlockInstance } from "../types";
import type { BlockSchemaDef } from "./types";

export interface ResolvedBlock {
  id: string;
  type: string;
  props: unknown;
}

export interface ResolveIssue {
  id: string;
  type: string;
  reason: "unknown_type" | "invalid_props" | "newer_version";
  detail?: string;
}

/**
 * Chuẩn bị khối để render: bỏ khối ẩn, khối không rõ loại, khối props sai (không làm vỡ cả trang);
 * khối phiên bản cũ chạy `migrate` trước khi kiểm tra.
 */
export function resolveBlocks(
  blocks: BlockInstance[],
  schemaByType: Map<string, BlockSchemaDef>,
): { blocks: ResolvedBlock[]; issues: ResolveIssue[] } {
  const resolved: ResolvedBlock[] = [];
  const issues: ResolveIssue[] = [];

  for (const block of blocks) {
    if (block.hidden) continue;
    const def = schemaByType.get(block.type);
    if (!def) {
      issues.push({ id: block.id, type: block.type, reason: "unknown_type" });
      continue;
    }
    if (block.version > def.version) {
      // Dữ liệu từ phiên bản mới hơn code đang chạy (vd. rollback) -> không đoán, bỏ qua
      issues.push({ id: block.id, type: block.type, reason: "newer_version" });
      continue;
    }
    const raw = block.version < def.version && def.migrate ? def.migrate(block.props, block.version) : block.props;
    const parsed = def.schema.safeParse(raw);
    if (!parsed.success) {
      issues.push({ id: block.id, type: block.type, reason: "invalid_props", detail: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") });
      continue;
    }
    resolved.push({ id: block.id, type: block.type, props: parsed.data });
  }
  return { blocks: resolved, issues };
}
