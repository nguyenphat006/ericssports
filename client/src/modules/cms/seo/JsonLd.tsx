/**
 * Dữ liệu có cấu trúc schema.org (JSON-LD). Escape "<" để chuỗi do người dùng nhập (tên sản phẩm, câu hỏi FAQ)
 * không thể đóng thẻ <script> sớm.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
