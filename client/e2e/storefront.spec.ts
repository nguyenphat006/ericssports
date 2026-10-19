import { expect, test, type Page } from "@playwright/test";

/**
 * E2E storefront — chạy trên dữ liệu mock, KHÔNG cần backend:
 *   npm run build && npx next start -p 3100     (NEXT_PUBLIC_DATA_SOURCE=mock — mặc định)
 *   E2E_BASE_URL=http://localhost:3100 npm run test:e2e:shop
 * Kế hoạch GĐ2 mục 6: luồng mua COD, VNPay thất bại -> thanh toán lại, tìm kiếm không dấu, tra cứu, mobile.
 */

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

async function addToCartAndCheckout(page: Page, productPath: string) {
  await page.goto(productPath);
  await page.getByRole("button", { name: "Mua ngay" }).filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/\/thanh-toan$/);
  await expect(page.getByRole("heading", { name: "Thanh toán", level: 1 })).toBeVisible();
}

async function fillCheckout(page: Page) {
  await page.getByLabel("Họ và tên").fill("Nguyễn Văn Thử");
  await page.getByLabel("Số điện thoại").fill("0912 345 678");
  await page.locator("#co-province").click();
  await page.keyboard.type("ho chi minh");
  await page.getByRole("option", { name: /Hồ Chí Minh/ }).first().click();
  await page.locator("#co-ward").click();
  await page.keyboard.type("ben thanh");
  await page.getByRole("option", { name: /Bến Thành/ }).first().click();
  await page.getByLabel("Số nhà, tên đường").fill("12 Lê Lợi");
}

test("trang chủ dựng từ khối CMS, không lỗi, không cuộn ngang", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Trang chủ Ericssports" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bạn muốn tập gì?" })).toBeVisible();
  await expect(page.locator("[data-block=product-grid]")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors, errors.join("\n")).toEqual([]);
});

test("đường dẫn không tồn tại trả 404 giao diện storefront", async ({ page }) => {
  const res = await page.goto("/duong-dan-khong-ton-tai");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Không tìm thấy trang" })).toBeVisible();
});

test("danh mục: lọc phản ánh lên URL, F5 giữ kết quả", async ({ page, isMobile }) => {
  await page.goto("/danh-muc/tap-ta");
  if (isMobile) await page.getByRole("button", { name: /^Bộ lọc/ }).click();
  await page.getByRole("checkbox", { name: "ES Pro" }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/thuong-hieu=es-pro/);
  if (isMobile) await page.getByRole("button", { name: /^Xem \d+ sản phẩm/ }).click();
  const count = await page.getByText(/^\d+ sản phẩm$/).first().textContent();
  await page.reload();
  await expect(page.getByText(/^\d+ sản phẩm$/).first()).toHaveText(count!);
  await expect(page.getByRole("button", { name: "Bỏ lọc ES Pro" })).toBeVisible();
});

test("tìm kiếm không dấu có gợi ý", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: "Mở ô tìm kiếm" }).click();
  const box = page.getByRole("combobox", { name: "Tìm sản phẩm" }).filter({ visible: true });
  await box.fill("may chay");
  await expect(page.getByRole("option", { name: /Máy chạy bộ/ }).first()).toBeVisible();
  await box.press("Enter");
  await expect(page).toHaveURL(/\/tim-kiem\?q=may/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("may chay");
});

test("mua hàng COD: chọn biến thể -> giỏ -> thanh toán -> đơn thành công", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/san-pham/may-chay-bo-dien-x5-gap-gon");
  await page.getByRole("button", { name: /X5 Pro/ }).click();
  await expect(page).toHaveURL(/\?v=tm-x5-v2/);
  await page.getByRole("button", { name: "Thêm vào giỏ" }).filter({ visible: true }).first().click();
  await expect(page.getByRole("dialog").getByText("Giỏ hàng (1)")).toBeVisible();
  await page.getByRole("dialog").getByRole("link", { name: "Thanh toán" }).click();
  await expect(page).toHaveURL(/\/thanh-toan$/);

  // Gửi trống -> báo lỗi từng ô
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await expect(page.getByText("Nhập họ và tên")).toBeVisible();

  await fillCheckout(page);
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await expect(page).toHaveURL(/\/don-hang\/ES\d+/);
  await expect(page.getByRole("status")).toContainText("Đặt hàng thành công");
  // Giỏ đã xóa sau khi đặt
  await expect(page.getByRole("button", { name: "Giỏ hàng" })).toBeVisible();
  expect(errors, errors.join("\n")).toEqual([]);
});

test("VNPay giả lập: thất bại -> thanh toán lại -> thành công", async ({ page }) => {
  await addToCartAndCheckout(page, "/san-pham/tham-tap-yoga-tpe-8mm-hai-lop");
  await fillCheckout(page);
  await page.getByRole("radio", { name: /^VNPay/ }).check();
  await page.getByRole("button", { name: "Đặt hàng và thanh toán" }).click();
  await expect(page).toHaveURL(/\/dev\/cong-thanh-toan/);
  await page.getByRole("button", { name: "Thanh toán thất bại" }).click();
  await expect(page.getByRole("status")).toContainText("Thanh toán chưa thành công");
  await page.getByRole("button", { name: "Thanh toán lại" }).click();
  await page.getByRole("button", { name: "Thanh toán thành công" }).click();
  await expect(page.getByRole("status")).toContainText("Thanh toán thành công");
});

test("tra cứu đơn: SĐT sai bị từ chối, SĐT đúng thấy đơn", async ({ page }) => {
  await addToCartAndCheckout(page, "/san-pham/bo-day-khang-luc-5-muc");
  await fillCheckout(page);
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await expect(page).toHaveURL(/\/don-hang\/ES\d+/);
  const code = page.url().split("/").pop()!;
  // Đơn mock lưu ở trình duyệt: bỏ "đơn của tôi" để mô phỏng người khác tra cứu
  await page.evaluate(() => localStorage.removeItem("es_shop_mock_my_order_codes"));
  await page.goto("/tra-cuu-don");
  await page.getByLabel("Mã đơn hàng").fill(code);
  await page.getByLabel("Số điện thoại").fill("0999 999 999");
  await page.getByRole("button", { name: "Tra cứu" }).click();
  await expect(page.getByText("Không tìm thấy đơn")).toBeVisible();
  await page.getByLabel("Số điện thoại").fill("+84912345678");
  await page.getByRole("button", { name: "Tra cứu" }).click();
  await expect(page.getByRole("heading", { name: `Đơn hàng ${code}` })).toBeVisible();
});

test("trang sản phẩm trên điện thoại: thanh mua dính đáy", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Chỉ kiểm tra trên mobile");
  await page.goto("/san-pham/ta-don-boc-cao-su-cap-2-qua");
  const bar = page.locator("div.fixed.bottom-0").filter({ has: page.getByRole("button", { name: "Mua ngay" }) });
  await expect(bar).toBeVisible();
  await page.mouse.wheel(0, 2000);
  await expect(bar).toBeInViewport();
});
