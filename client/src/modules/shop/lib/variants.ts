import type { Product, Variant } from "../types";

/** Trạng thái một lựa chọn trên trục biến thể, xét cùng các lựa chọn đang chọn ở trục khác */
export type OptionState = "available" | "out_of_stock" | "unavailable";

export function findVariant(product: Product, options: Record<string, string>): Variant | undefined {
  return product.variants.find((v) => product.variantAxes.every((axis) => v.options[axis.id] === options[axis.id]));
}

/** Biến thể mở đầu: theo ?v= nếu hợp lệ, không thì biến thể còn hàng đầu tiên, cuối cùng là biến thể đầu tiên */
export function initialVariant(product: Product, variantId?: string | null): Variant {
  return (
    (variantId ? product.variants.find((v) => v.id === variantId) : undefined) ??
    product.variants.find((v) => v.stock > 0) ??
    product.variants[0]
  );
}

export function optionState(product: Product, selected: Record<string, string>, axisId: string, value: string): OptionState {
  const variant = findVariant(product, { ...selected, [axisId]: value });
  if (!variant) return "unavailable";
  return variant.stock > 0 ? "available" : "out_of_stock";
}

/**
 * Chọn một giá trị trên một trục. Nếu tổ hợp mới không tồn tại, giữ giá trị vừa chọn và đổi các trục khác
 * sang biến thể gần nhất có giá trị đó (ưu tiên còn hàng) — người dùng không bị kẹt ở tổ hợp không có.
 */
export function selectOption(product: Product, selected: Record<string, string>, axisId: string, value: string): Variant | undefined {
  const exact = findVariant(product, { ...selected, [axisId]: value });
  if (exact) return exact;
  const candidates = product.variants.filter((v) => v.options[axisId] === value);
  const score = (v: Variant) => product.variantAxes.filter((a) => v.options[a.id] === selected[a.id]).length + (v.stock > 0 ? 0.5 : 0);
  return candidates.sort((a, b) => score(b) - score(a))[0];
}
