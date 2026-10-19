/**
 * Bỏ dấu tiếng Việt + chữ thường để so khớp tìm kiếm không dấu: "Máy chạy Đa năng" -> "may chay da nang".
 */
export function normalizeVietnamese(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Slug không dấu cho URL: "Máy chạy bộ X5" -> "may-chay-bo-x5" */
export function slugify(input: string): string {
  return normalizeVietnamese(input)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Mọi từ trong truy vấn đều xuất hiện trong văn bản (không dấu, không phân biệt hoa thường) */
export function matchesQuery(haystack: string, query: string): boolean {
  const words = normalizeVietnamese(query).split(" ").filter(Boolean);
  if (words.length === 0) return false;
  const text = normalizeVietnamese(haystack);
  return words.every((w) => text.includes(w));
}
