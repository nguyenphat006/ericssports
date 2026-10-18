import React from "react";
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
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
  it("hiện thương hiệu, tên, tối đa 3 thông số, nhãn giảm giá và nhãn mới", () => {
    renderWithProviders(<ProductCard product={PRODUCT} />);
    expect(screen.getByText("ES Cardio")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Máy chạy bộ điện X5" })).toBeInTheDocument();
    expect(screen.getByText("3.0HP · 120kg · Có")).toBeInTheDocument();
    expect(screen.queryByText(/Không hiện/)).not.toBeInTheDocument();
    expect(screen.getByText("-15%")).toBeInTheDocument();
    expect(screen.getByText("Mới")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Máy chạy bộ X5" })).toBeInTheDocument();
  });

  it("có href thì toàn thẻ là link, không có thì không", () => {
    const { unmount } = renderWithProviders(<ProductCard product={PRODUCT} href="/san-pham/may-chay-bo-dien-x5" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/san-pham/may-chay-bo-dien-x5");
    unmount();
    renderWithProviders(<ProductCard product={{ ...PRODUCT, compareAtPrice: null, badges: [] }} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText("-15%")).not.toBeInTheDocument();
  });
});
