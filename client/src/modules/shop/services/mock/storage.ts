/**
 * Lưu trữ cho dữ liệu mock (đơn hàng, tài khoản khách) trong localStorage của trình duyệt.
 * Bọc try/catch: chế độ riêng tư / bị chặn -> coi như rỗng, không làm vỡ trang.
 */
const PREFIX = "es_shop_mock_";

export function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Hết dung lượng / bị chặn: bỏ qua (dữ liệu mock)
  }
}

/** Độ trễ giả lập mạng (chỉ dev) để thấy trạng thái đang tải */
export function delay(ms = 250): Promise<void> {
  if (process.env.NODE_ENV === "test") return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Băm mật khẩu cho tài khoản mock — không bao giờ lưu mật khẩu dạng chữ thường, kể cả dữ liệu giả */
export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`es-mock:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomId(prefix: string): string {
  const rand = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}`;
}
