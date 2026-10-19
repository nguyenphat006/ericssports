import type { Product, Review, ReviewSummary } from "../types";
import { variantLabel } from "../lib/pricing";

/** Đánh giá MẪU sinh ổn định theo sản phẩm (cùng sản phẩm luôn ra cùng danh sách). GĐ7 thay bằng đánh giá thật. */

const AUTHORS = ["Anh Minh", "Chị Lan", "Anh Tuấn", "Chị Hương", "Anh Đức", "Chị Thảo", "Anh Khoa", "Chị Ngọc"];
const BODIES: [number, string, string][] = [
  [5, "Đúng như mô tả", "Giao nhanh, đóng gói kỹ. Sản phẩm chắc chắn, dùng êm, đáng tiền."],
  [5, "Lắp đặt cẩn thận", "Kỹ thuật viên lắp đặt và hướng dẫn rất nhiệt tình. Cả nhà đều dùng được."],
  [4, "Chất lượng tốt", "Sản phẩm tốt so với giá, chỉ mong có thêm màu để chọn."],
  [5, "Rất hài lòng", "Đã tập được hơn một tháng, chưa thấy vấn đề gì. Sẽ ủng hộ shop tiếp."],
  [4, "Ổn trong tầm giá", "Hoàn thiện ổn, hướng dẫn sử dụng hơi ngắn nhưng xem video là hiểu."],
  [3, "Tạm được", "Dùng được nhưng giao hàng trễ một ngày so với dự kiến."],
];

function seed(id: string): number {
  return [...id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
}

export function mockReviews(product: Product): ReviewSummary {
  if (!product.reviewCount || product.rating === null) {
    return { average: null, count: 0, distribution: [0, 0, 0, 0, 0], items: [] };
  }
  const s = seed(product.id);
  const items: Review[] = Array.from({ length: Math.min(6, product.reviewCount) }, (_, i) => {
    const [rating, title, body] = BODIES[(s + i) % BODIES.length];
    const variant = product.variants[(s + i) % product.variants.length];
    const day = 1 + ((s + i * 7) % 27);
    return {
      id: `${product.id}-r${i + 1}`,
      author: AUTHORS[(s + i * 3) % AUTHORS.length],
      rating,
      title,
      body,
      createdAt: `2026-0${1 + ((s + i) % 9)}-${String(day).padStart(2, "0")}T09:00:00+07:00`,
      variantLabel: variantLabel(product, variant.options) || undefined,
      verified: i % 4 !== 3,
    };
  });

  // Phân bố 5 → 1 sao xấp xỉ theo điểm trung bình
  const n = product.reviewCount;
  const five = Math.round(n * Math.min(0.95, Math.max(0.3, (product.rating - 3.5) / 1.6)));
  const four = Math.round((n - five) * 0.65);
  const three = Math.round((n - five - four) * 0.6);
  const two = Math.round((n - five - four - three) * 0.5);
  const one = n - five - four - three - two;

  return { average: product.rating, count: n, distribution: [five, four, three, two, one], items };
}
