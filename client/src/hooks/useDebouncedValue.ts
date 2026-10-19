"use client";

import { useEffect, useState } from "react";

/** Giá trị trễ `delay` ms sau lần đổi cuối (gõ tìm kiếm -> chỉ gọi API khi ngừng gõ). */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
