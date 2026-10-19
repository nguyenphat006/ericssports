"use client";

import { useCallback, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { serializeProductQuery } from "../../lib/filters";
import type { Attribute, ProductQuery } from "../../types";

/**
 * Đổi bộ lọc / sắp xếp / trang = đổi URL; server render lại kết quả (nguồn sự thật là URL — F5, chia sẻ link
 * giữ nguyên). Trong lúc chờ server, `query` trả về là bản lạc quan (ô tích / tag đổi ngay, không giật);
 * `pending` để làm mờ lưới.
 */
export function useCatalogNavigation(basePath: string, serverQuery: ProductQuery, attributes: Attribute[]) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setOptimisticQuery] = useOptimistic(serverQuery);

  const hrefFor = useCallback(
    (next: ProductQuery) => {
      const qs = serializeProductQuery(next, attributes).toString();
      return qs ? `${basePath}?${qs}` : basePath;
    },
    [attributes, basePath],
  );

  /** Đổi điều kiện lọc -> về trang 1 */
  const update = useCallback(
    (patch: Partial<ProductQuery>) => {
      const next: ProductQuery = { ...query, ...patch, page: patch.page ?? 1 };
      startTransition(() => {
        setOptimisticQuery(next);
        router.push(hrefFor(next), { scroll: false });
      });
    },
    [hrefFor, query, router, setOptimisticQuery],
  );

  return { query, pending, update, hrefFor };
}
