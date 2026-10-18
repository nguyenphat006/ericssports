"use client";

import { useEffect } from "react";
import { useThemeStore, type ThemeArea as Area } from "@/stores/useThemeStore";

/**
 * Báo khu vực đang hiển thị cho theme store: quản trị theo lựa chọn sáng / tối của nhân viên,
 * storefront luôn sáng. Đặt một lần trong layout gốc của mỗi khu vực.
 */
export function ThemeArea({ area }: { area: Area }) {
  const setArea = useThemeStore((s) => s.setArea);
  useEffect(() => {
    setArea(area);
  }, [area, setArea]);
  return null;
}
