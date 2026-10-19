import { resolveBlocks } from "../blocks/resolve";
import { BLOCK_BY_TYPE } from "../blocks/registry";
import type { BlockInstance } from "../types";

/**
 * Render danh sách khối của một trang. Khối lỗi bị bỏ qua (ghi log ở dev) — trang vẫn hiển thị phần còn lại.
 */
export function BlockRenderer({ blocks }: { blocks: BlockInstance[] }) {
  const { blocks: resolved, issues } = resolveBlocks(blocks, BLOCK_BY_TYPE);
  if (issues.length && process.env.NODE_ENV !== "production") {
    console.error("[cms] Bỏ qua khối không hợp lệ:", issues);
  }
  return (
    <>
      {resolved.map((block) => {
        const Component = BLOCK_BY_TYPE.get(block.type)!.Component;
        // id = id khối -> link neo "#<id>" trong CMS cuộn tới đúng khối
        return (
          <div key={block.id} id={block.id} data-block={block.type} className="scroll-mt-32">
            <Component props={block.props} blockId={block.id} />
          </div>
        );
      })}
    </>
  );
}
