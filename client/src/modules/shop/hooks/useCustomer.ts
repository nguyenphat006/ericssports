"use client";

import { useMounted } from "@/hooks/useMounted";
import { useCustomerAuth } from "../stores/useCustomerAuth";

/** Khách đang đăng nhập — chỉ đọc sau khi mount (localStorage) để HTML khớp server. `ready` = đã biết trạng thái. */
export function useCustomer() {
  const mounted = useMounted();
  const customer = useCustomerAuth((s) => s.customer);
  return { ready: mounted, customer: mounted ? customer : null };
}

/** Chỉ cho phép quay về đường dẫn nội bộ sau đăng nhập (chặn open redirect "//evil.com", "https://...") */
export function safeNextPath(next: string | null | undefined, fallback = "/tai-khoan/don-hang"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
