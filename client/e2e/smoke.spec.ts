import { expect, test, type Page } from "@playwright/test";

const USERNAME = process.env.E2E_USERNAME || "admin";
const PASSWORD = process.env.E2E_PASSWORD || "";

/** Các màn hình lõi của template (module mẫu master-data được kiểm tra nếu có trong menu) */
const CORE_PAGES = ["/admin", "/admin/users", "/admin/audit-logs", "/admin/settings/modules", "/admin/profile"];

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.locator("input:not([type=password])").first().fill(USERNAME);
  await page.locator("input[type=password]").fill(PASSWORD);
  await page.locator("button[type=submit]").click();
  await page.waitForURL((url) => !url.pathname.startsWith("/admin/login"));
}

test.beforeAll(() => {
  if (!PASSWORD) throw new Error("Thiếu E2E_PASSWORD (mật khẩu tài khoản dùng cho smoke test)");
});

test("đăng nhập sai hiển thị thông báo, không chuyển trang", async ({ page }) => {
  await page.goto("/admin/login");
  await page.locator("input:not([type=password])").first().fill(USERNAME);
  await page.locator("input[type=password]").fill("sai-mat-khau-123");
  await page.locator("button[type=submit]").click();
  await expect(page.locator("div[role=alert], [data-sonner-toast], .form-field__error").first()).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("đăng nhập và mở các màn hình lõi không lỗi", async ({ page }) => {
  const errors = trackErrors(page);
  await login(page);

  for (const path of CORE_PAGES) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page.getByText("404 - Không tìm thấy trang")).toHaveCount(0);
    await expect(page.getByText("Đã xảy ra lỗi")).toHaveCount(0);
  }
  expect(errors, `Lỗi trình duyệt:\n${errors.join("\n")}`).toEqual([]);
});

test("trạng thái hệ thống lấy từ /health/", async ({ page }) => {
  await login(page);
  await page.goto("/admin");
  await expect(page.getByText("Trạng thái hệ thống")).toBeVisible();
  await expect(page.getByText("Cơ sở dữ liệu")).toBeVisible();
  await expect(page.getByText(/Hoạt động · [\d.]+ ms/).first()).toBeVisible();
});

test("chuyển giao diện tối được lưu sau khi tải lại", async ({ page }) => {
  await login(page);
  await page.evaluate(() => localStorage.setItem("app_theme_mode", "dark"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.evaluate(() => localStorage.setItem("app_theme_mode", "light"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("đường dẫn không tồn tại hiển thị trang 404 của storefront", async ({ page }) => {
  const res = await page.goto("/duong-dan-khong-ton-tai");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Không tìm thấy trang" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Về trang chủ" })).toHaveAttribute("href", "/");
});

test("storefront: trang chủ có header, footer, không lỗi, không cuộn ngang trên điện thoại", async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Trang chủ Ericssports" })).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  await expect(page.locator("[data-site=shop]")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors, `Lỗi trình duyệt:\n${errors.join("\n")}`).toEqual([]);
});

test("storefront luôn sáng dù nhân viên chọn giao diện tối trong quản trị", async ({ page }) => {
  await login(page);
  await page.evaluate(() => localStorage.setItem("app_theme_mode", "dark"));
  await page.goto("/admin");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.evaluate(() => localStorage.setItem("app_theme_mode", "light"));
});

test("Ctrl+K tìm và mở màn hình theo menu", async ({ page, isMobile }) => {
  test.skip(isMobile, "Phím tắt chỉ kiểm tra trên desktop");
  await login(page);
  await page.goto("/admin");
  // Chờ topbar hiện (phím tắt gắn khi layout đã mount)
  await expect(page.getByRole("button", { name: /Tìm kiếm/ })).toBeVisible();
  await page.keyboard.press("Control+k");
  const input = page.getByPlaceholder("Tìm màn hình hoặc thao tác…");
  await expect(input).toBeVisible();
  await input.fill("nguoi dung");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/admin\/users$/);
});
