import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
import { useCartStore } from "../../stores/useCartStore";
import type { ProductSummary } from "../../types";
import { Price } from "./Price";
import { ProductCard } from "./ProductCard";

// next/image cần runtime Next -> thay bằng <img> thường trong jsdom
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => React.createElement("img", { src, alt }),
}));

const PRODUCT: ProductSummary = {
  id: "p1",
  slug: "may-chay-bo-dien-x5",
  name: "Máy chạy bộ điện X5",
  brand: "ES Cardio",
  image: { src: "/x.svg", alt: "Máy chạy bộ X5" },
  keySpecs: [
    { label: "Động cơ", value: "3.0HP" },
    { label: "Tải tối đa", value: "120kg" },
    { label: "Gấp gọn", value: "Có" },
    { label: "Thừa", value: "Không hiện" },
  ],
  price: 12990000,
  compareAtPrice: 15290000,
  badges: ["new"],
  rating: 4.8,
  reviewCount: 126,
  soldCount: 1200,
};

describe("Price", () => {
  it("hiện giá bán và giá gốc có nhãn cho trình đọc màn hình", () => {
    renderWithProviders(<Price value={12990000} compareAt={15290000} />);
    expect(screen.getByText("12.990.000₫")).toBeInTheDocument();
    expect(screen.getByText("Giá gốc 15.290.000₫")).toBeInTheDocument();
  });

  it("không hiện giá gốc khi không giảm", () => {
    renderWithProviders(<Price value={500000} compareAt={500000} />);
    expect(screen.queryByText(/Giá gốc/)).not.toBeInTheDocument();
  });
});

describe("ProductCard", () => {
  beforeEach(() => useCartStore.setState({ lines: [], drawerOpen: false }));

  it("hiện giá trước tên, thương hiệu, nhãn giảm giá + nhãn mới, không hiện thông số", () => {
    renderWithProviders(<ProductCard product={PRODUCT} />);
    const price = screen.getByText("12.990.000₫");
    const name = screen.getByRole("heading", { name: "Máy chạy bộ điện X5" });
    expect(price.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("ES Cardio")).toBeInTheDocument();
    expect(screen.queryByText(/3.0HP/)).not.toBeInTheDocument();
    expect(screen.getByText("-15%")).toBeInTheDocument();
    expect(screen.getByText("Mới")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Máy chạy bộ X5" })).toBeInTheDocument();
  });

  it("tối đa 2 nhãn góc ảnh", () => {
    renderWithProviders(<ProductCard product={{ ...PRODUCT, badges: ["new", "bestseller"] }} />);
    expect(screen.getByText("-15%")).toBeInTheDocument();
    expect(screen.getByText("Mới")).toBeInTheDocument();
    expect(screen.queryByText("Bán chạy")).not.toBeInTheDocument();
  });

  it("chấm màu: tối đa 4 chấm, dư hiện +n, có nhãn liệt kê màu", () => {
    const swatches = ["Đen", "Trắng", "Đỏ", "Xám", "Xanh"].map((label, i) => ({ label, color: `#00000${i}` }));
    renderWithProviders(<ProductCard product={{ ...PRODUCT, swatches }} />);
    const list = screen.getByRole("list", { name: "Màu: Đen, Trắng, Đỏ, Xám, Xanh" });
    expect(list.querySelectorAll("li[title]")).toHaveLength(4);
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("có href thì tên là link phủ cả thẻ, không có thì không có link", () => {
    const { unmount } = renderWithProviders(<ProductCard product={PRODUCT} href="/san-pham/may-chay-bo-dien-x5" />);
    expect(screen.getByRole("link", { name: "Máy chạy bộ điện X5" })).toHaveAttribute("href", "/san-pham/may-chay-bo-dien-x5");
    unmount();
    renderWithProviders(<ProductCard product={{ ...PRODUCT, compareAtPrice: null, badges: [] }} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText("-15%")).not.toBeInTheDocument();
  });

  it("1 biến thể còn hàng: nút thêm nhanh bỏ vào giỏ và mở ngăn kéo", () => {
    renderWithProviders(<ProductCard product={{ ...PRODUCT, quickAddVariantId: "v1" }} href="/san-pham/x" />);
    fireEvent.click(screen.getByRole("button", { name: "Thêm Máy chạy bộ điện X5 vào giỏ" }));
    const state = useCartStore.getState();
    expect(state.lines).toEqual([{ productId: "p1", variantId: "v1", quantity: 1, serviceIds: [] }]);
    expect(state.drawerOpen).toBe(true);
  });

  it("nhiều biến thể: nút dẫn tới trang sản phẩm để chọn phân loại", () => {
    renderWithProviders(<ProductCard product={{ ...PRODUCT, quickAddVariantId: null }} href="/san-pham/x" />);
    expect(screen.getByRole("link", { name: "Chọn phân loại cho Máy chạy bộ điện X5" })).toHaveAttribute("href", "/san-pham/x");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("hết hàng: không có nút thêm, hiện chữ Hết hàng", () => {
    renderWithProviders(<ProductCard product={{ ...PRODUCT, inStock: false, quickAddVariantId: null }} href="/san-pham/x" />);
    expect(screen.getByText("Hết hàng")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Chọn phân loại/ })).not.toBeInTheDocument();
  });
});
