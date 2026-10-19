import type { CartLine, PricedCart, PricedCartLine, Product, ShippingMethod } from "../types";
import { SHIPPING_CONFIG, availableShippingMethods, quoteShipping } from "./shipping";

/** Nhãn biến thể theo thứ tự trục: "Đen đỏ · X5 – 3.0HP" */
export function variantLabel(product: Product, options: Record<string, string>): string {
  return product.variantAxes
    .map((axis) => axis.values.find((v) => v.value === options[axis.id])?.label)
    .filter(Boolean)
    .join(" · ");
}

/** Ảnh đại diện của biến thể (ảnh theo mediaIndex, không có thì ảnh đầu tiên) */
export function variantImage(product: Product, mediaIndex?: number): { src: string; alt: string } {
  const images = product.media.filter((m) => m.kind === "image");
  const picked = mediaIndex !== undefined ? product.media[mediaIndex] : undefined;
  const img = picked && picked.kind === "image" ? picked : images[0];
  return img ? { src: img.src, alt: img.alt } : { src: "/shop/placeholder/treadmill.svg", alt: product.name };
}

interface PriceContext {
  provinceCode?: number;
  method?: ShippingMethod;
}

/**
 * Định giá giỏ hàng từ dữ liệu catalog mới nhất (mô phỏng server tính lại giá khi đặt hàng — spec 5.3).
 * Dòng không còn bán / hết hàng: giữ lại để báo, không cộng tiền. Thiếu hàng: vẫn cộng, nhưng chặn đặt hàng.
 */
export function priceCart(lines: CartLine[], findProduct: (id: string) => Product | undefined, ctx: PriceContext = {}): PricedCart {
  const priced: PricedCartLine[] = lines.map((line) => {
    const product = findProduct(line.productId);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (!product || !variant) {
      return {
        ...line,
        productSlug: product?.slug ?? "",
        name: product?.name ?? "",
        image: product ? variantImage(product) : { src: "/shop/placeholder/treadmill.svg", alt: "" },
        variantLabel: "",
        sku: "",
        unitPrice: 0,
        services: [],
        servicesUnitPrice: 0,
        lineTotal: 0,
        stock: 0,
        weightKg: 0,
        bulky: false,
        issue: "unavailable",
      };
    }
    const services = product.services.filter((s) => line.serviceIds.includes(s.id)).map(({ id, name, price }) => ({ id, name, price }));
    const servicesUnitPrice = services.reduce((sum, s) => sum + s.price, 0);
    const issue = variant.stock <= 0 ? "out_of_stock" : line.quantity > variant.stock ? "insufficient_stock" : undefined;
    return {
      ...line,
      serviceIds: services.map((s) => s.id),
      productSlug: product.slug,
      name: product.name,
      image: variantImage(product, variant.mediaIndex),
      variantLabel: variantLabel(product, variant.options),
      sku: variant.sku,
      unitPrice: variant.price,
      compareAtPrice: variant.compareAtPrice,
      services,
      servicesUnitPrice,
      lineTotal: issue === "out_of_stock" ? 0 : (variant.price + servicesUnitPrice) * line.quantity,
      stock: variant.stock,
      weightKg: variant.weightKg,
      bulky: product.bulky,
      issue,
    };
  });

  const billable = priced.filter((l) => l.issue !== "unavailable" && l.issue !== "out_of_stock");
  const subtotal = billable.reduce((sum, l) => sum + l.lineTotal, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const weightKg = billable.reduce((sum, l) => sum + l.weightKg * l.quantity, 0);
  const bulky = billable.some((l) => l.bulky);

  const shipping =
    ctx.provinceCode && billable.length > 0
      ? quoteShipping({ provinceCode: ctx.provinceCode, method: ctx.method, weightKg, bulky, subtotal })
      : null;

  return {
    lines: priced,
    itemCount,
    subtotal,
    shipping,
    availableMethods: ctx.provinceCode ? availableShippingMethods(ctx.provinceCode) : ["standard"],
    total: subtotal + (shipping?.fee ?? 0),
    freeShippingThreshold: SHIPPING_CONFIG.freeShippingThreshold,
    amountToFreeShipping: Math.max(0, SHIPPING_CONFIG.freeShippingThreshold - subtotal),
    hasIssues: priced.some((l) => l.issue !== undefined),
  };
}
