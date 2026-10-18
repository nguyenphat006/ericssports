/**
 * Tiền tố khu quản trị. Storefront nằm ở "/", trang quản trị ở "/admin/*".
 *
 * Backend (ModuleRegistry.route_path, URL tìm kiếm, link thông báo, href dashboard) lưu đường dẫn
 * TƯƠNG ĐỐI với khu quản trị ("/users", "/profile"). Mọi chỗ điều hướng trong quản trị đi qua
 * `adminPath()` -> đổi tiền tố chỉ cần sửa hằng số dưới đây.
 */
export const ADMIN_BASE = "/admin";

/** Trang đăng nhập nhân viên */
export const ADMIN_LOGIN = `${ADMIN_BASE}/login`;

const EXTERNAL_URL = /^[a-z][a-z0-9+.-]*:/i;

/** Đường dẫn có thuộc khu quản trị không ("/admin", "/admin/users"; không khớp "/administrator") */
export function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`) || pathname.startsWith(`${ADMIN_BASE}?`);
}

/**
 * Đường dẫn tương đối của quản trị -> URL thật: "/" -> "/admin", "/users/5?tab=a" -> "/admin/users/5?tab=a".
 * Đã có tiền tố hoặc là URL ngoài (https:, mailto:) thì giữ nguyên.
 */
export function adminPath(path: string): string {
  if (!path) return ADMIN_BASE;
  if (EXTERNAL_URL.test(path) || path.startsWith("//")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (isAdminPath(normalized)) return normalized;
  if (normalized === "/") return ADMIN_BASE;
  if (normalized.startsWith("/?") || normalized.startsWith("/#")) return `${ADMIN_BASE}${normalized.slice(1)}`;
  return `${ADMIN_BASE}${normalized}`;
}

/** Ngược của adminPath: "/admin/users/5" -> "/users/5", "/admin" -> "/". Đường dẫn ngoài quản trị giữ nguyên. */
export function stripAdminBase(pathname: string): string {
  if (!isAdminPath(pathname)) return pathname;
  const rest = pathname.slice(ADMIN_BASE.length);
  if (!rest || rest.startsWith("?")) return `/${rest}`;
  return rest;
}
