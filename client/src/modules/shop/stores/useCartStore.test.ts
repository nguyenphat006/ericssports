import { beforeEach, describe, expect, it } from "vitest";
import { MAX_LINE_QUANTITY, lineKey, selectItemCount, useCartStore } from "./useCartStore";

const line = (over = {}) => ({ productId: "p1", variantId: "v1", quantity: 1, serviceIds: [] as string[], ...over });

describe("useCartStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ lines: [], drawerOpen: false });
  });

  it("cùng biến thể + cùng dịch vụ thì cộng dồn; khác dịch vụ thì thành dòng riêng", () => {
    const s = useCartStore.getState();
    s.add(line({ quantity: 2, serviceIds: ["install"] }));
    s.add(line({ quantity: 1, serviceIds: ["install"] }));
    s.add(line({ quantity: 1 }));
    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(2);
    expect(lines[0].quantity).toBe(3);
    expect(selectItemCount(useCartStore.getState())).toBe(4);
  });

  it("giới hạn số lượng 1..99", () => {
    const s = useCartStore.getState();
    s.add(line({ quantity: 500 }));
    const key = lineKey(line());
    expect(useCartStore.getState().lines[0].quantity).toBe(MAX_LINE_QUANTITY);
    s.setQuantity(key, 0);
    expect(useCartStore.getState().lines[0].quantity).toBe(1);
  });

  it("đổi dịch vụ trùng dòng khác thì gộp", () => {
    const s = useCartStore.getState();
    s.add(line({ quantity: 1 }));
    s.add(line({ quantity: 2, serviceIds: ["install"] }));
    s.setServices(lineKey(line()), ["install"]);
    expect(useCartStore.getState().lines).toEqual([expect.objectContaining({ quantity: 3, serviceIds: ["install"] })]);
  });

  it("xóa rồi hoàn tác về đúng vị trí; chỉ lưu dòng hàng vào localStorage", () => {
    const s = useCartStore.getState();
    s.add(line({ variantId: "a" }));
    s.add(line({ variantId: "b" }));
    s.add(line({ variantId: "c" }));
    const removed = s.remove(lineKey(line({ variantId: "b" })))!;
    s.restore(removed, 1);
    expect(useCartStore.getState().lines.map((l) => l.variantId)).toEqual(["a", "b", "c"]);
    s.openDrawer();
    const saved = JSON.parse(localStorage.getItem("es_shop_cart")!);
    expect(Object.keys(saved.state)).toEqual(["lines"]);
  });
});
