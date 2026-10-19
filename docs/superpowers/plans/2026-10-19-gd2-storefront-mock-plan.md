# GĐ2 — Storefront trên dữ liệu giả + thư viện khối CMS v1: kế hoạch triển khai

**Ngày lập**: 2026-10-19
**Spec gốc**: `docs/superpowers/specs/2026-10-18-ericssports-storefront-cms-design.md` (mục 4.3, 5, 6.2, 6.3, 8)
**Nền**: GĐ1 trên nhánh `feat/gd1-foundation` (khung `(shop)`, token Ember, component cơ bản)
**Trạng thái**: Đã duyệt 2026-10-19 — Q1-A, Q2-A, Q3-A, Q4-A
**Nhánh dự kiến**: `feat/gd2-storefront-mock` (tách từ `feat/gd1-foundation`)

---

## 0. Mục tiêu & kết quả bàn giao

Kết thúc GĐ2, **bấm thử được trọn luồng mua hàng** trên dữ liệu giả, giao diện gần như bản thật:

1. **Lớp dữ liệu** `service` có 2 bản cài đặt (`mock` / `api`) cùng interface; GĐ2 chỉ có `mock`, GĐ4 thêm `api` mà không sửa component.
2. **Thư viện khối CMS v1** (13 khối) + renderer; trang chủ bố cục B và landing page `/[slug]` render từ JSON mẫu.
3. **Đủ màn hình storefront** (spec 5.1–5.3): danh mục + bộ lọc, tìm kiếm + gợi ý, chi tiết sản phẩm, giỏ hàng (ngăn kéo + trang), thanh toán 1 trang, kết quả đơn, tra cứu đơn, tài khoản khách (đăng nhập/đăng ký, đơn hàng, sổ địa chỉ).
4. Header từ GĐ1 có **chức năng thật** (tìm kiếm, giỏ hàng có số lượng, tài khoản, menu có link danh mục); footer link tới trang chính sách (landing page CMS mẫu).
5. **SEO cơ bản**: metadata từng trang, JSON-LD `Product` + `BreadcrumbList`, URL tiếng Việt không dấu.
6. Health check xanh + Vitest cho logic thuần + Playwright luồng mua hàng (chạy được **không cần backend**).

**Ngoài phạm vi GĐ2**: trình soạn trang CMS (GĐ3), backend / DBML (GĐ4), quản trị bán hàng (GĐ5), tích hợp VNPay/MoMo thật (GĐ6), đánh giá có ảnh / hỏi đáp / so sánh / yêu thích / mã giảm giá / trả góp (GĐ7).

---

## 1. Quyết định cần user xác nhận

### Q1 — Định dạng nội dung "văn bản tự do" (khối Rich text, mô tả sản phẩm) — khuyến nghị **A**

Quyết định này ràng buộc trình soạn ở GĐ3 và cột lưu trữ ở GĐ4.

- **A. JSON có cấu trúc kiểu Tiptap/ProseMirror** (`{type:"doc", content:[…]}`), render bằng component React tự viết, chỉ cho phép một tập node an toàn (đoạn, tiêu đề H2–H3, đậm/nghiêng, link, danh sách, ảnh, bảng đơn giản).
  - ✅ Không có HTML thô → không có lỗ hổng XSS; GĐ3 dùng Tiptap làm trình soạn rất tự nhiên; dễ đổi giao diện.
  - ⚠️ GĐ3 thêm thư viện Tiptap (~100KB, chỉ tải trong trang quản trị).
- **B. HTML đã lọc (sanitize)** — linh hoạt, dán từ Word dễ, nhưng phải lọc ở cả backend lẫn frontend, dễ lọt style rác.
- **C. Markdown** — gọn nhưng người không biết kỹ thuật khó dùng, bảng/ảnh hạn chế.

### Q2 — Dữ liệu địa giới hành chính (2 cấp từ 01/07/2025) — khuyến nghị **A**

- **A. Đưa vào repo bộ dữ liệu đầy đủ 34 tỉnh/thành + ~3.300 phường/xã** dạng JSON tĩnh (chia theo tỉnh, chỉ tải phường/xã của tỉnh đang chọn). Nguồn: danh mục đơn vị hành chính chính thức sau sắp xếp; trước khi đưa vào sẽ đối chiếu số lượng và ghi rõ nguồn + ngày cập nhật trong file.
- **B. GĐ2 chỉ có 34 tỉnh, phường/xã nhập tay** — nhanh hơn nhưng form địa chỉ khác bản thật, phải làm lại.

### Q3 — Giả lập thanh toán VNPay / MoMo ở GĐ2 — khuyến nghị **A**

- **A. Bước "cổng thanh toán giả lập"** (`/dev/cong-thanh-toan`, chỉ ngoài production): trang trung tính (không dùng logo / giao diện của VNPay hay MoMo) có 3 nút *Thành công / Thất bại / Hủy* → quay về trang kết quả đơn đúng như luồng return URL thật. Đơn được tạo ở trạng thái `chờ thanh toán`, kết quả cập nhật trạng thái như IPN sẽ làm.
  - ✅ Thử được đủ 3 nhánh UI (thành công / thất bại / thanh toán lại) trước khi có tích hợp thật.
- **B. Bỏ qua bước cổng**, đặt hàng xong là thành công ngay — không thử được nhánh thất bại.

### Q4 — Thư viện carousel (hero slider, gallery ảnh sản phẩm vuốt trên mobile) — khuyến nghị **A**

- **A. Thêm `embla-carousel-react`** qua component `carousel` của shadcn (~7KB gzip, hỗ trợ vuốt, bàn phím, a11y).
- **B. Tự viết bằng CSS scroll-snap** — không thêm thư viện, nhưng tự xử lý nút trước/sau, chấm trang, tự chạy.

---

## 2. Kiến trúc dữ liệu

### 2.1 Kiểu dữ liệu (`modules/shop/types/`)

Tách `types.ts` của GĐ1 thành thư mục:

| File | Kiểu chính |
|---|---|
| `catalog.ts` | `Category` (cây, slug, ảnh, `filterAttributes`), `Brand`, `Attribute` (kiểu `range` / `options` / `boolean`, đơn vị), `ProductSummary` (GĐ1, giữ nguyên + `categoryIds`, `inStock`), `Product` (chi tiết: gallery + video, `variantAxes`, `variants[]`, `specs[]` nhóm, `services[]`, `descriptionDoc`, `shipping {weightKg, bulky}`, `related`, `boughtTogether`) |
| `variant.ts` | `VariantAxis` (màu / phiên bản / khối lượng), `Variant` (`id`, `sku`, `options`, `price`, `compareAtPrice`, `stock`, `images`) |
| `cart.ts` | `CartLine` (`variantId`, `quantity`, `serviceIds`), `PricedCart` (dòng đã định giá, tạm tính, phí ship, giảm giá, tổng, cảnh báo hết hàng / đổi giá) |
| `order.ts` | `Order`, `OrderStatus` (theo spec 5.4), `PaymentMethod` (`cod` / `bank_transfer` / `vnpay` / `momo`), `PaymentStatus` |
| `customer.ts` | `Customer`, `Address` (tỉnh, phường/xã, số nhà/đường, mặc định) |
| `cms.ts` | `Page` (spec 6.1), `BlockInstance` (spec 6.2), `Menu`, `SiteSettings` |
| `richtext.ts` | `RichTextDoc` (theo Q1) |

### 2.2 Service (`modules/shop/services/`, `modules/cms/services/`)

```text
services/
  types.ts            interface CatalogService, CartPricingService, OrderService, CustomerService, CmsService, LocationService
  mock/               cài đặt mock: đọc JSON trong mocks/, mô phỏng độ trễ nhỏ (chỉ dev), lưu đơn / tài khoản vào localStorage
  index.ts            chọn cài đặt theo NEXT_PUBLIC_DATA_SOURCE (mặc định "mock"); GĐ4 thêm api/
```

- **Server component** (danh mục, chi tiết, trang CMS) gọi service trực tiếp → HTML có sẵn nội dung cho SEO.
- **Client** (gợi ý tìm kiếm, giỏ hàng, thanh toán, tài khoản) gọi qua hook TanStack Query (`modules/shop/hooks/`), query key có namespace `["shop", …]`.
- **Định giá giỏ hàng** chạy trong `CartPricingService.price(lines, address?)` — client không tự cộng tiền; mô phỏng việc server tính lại giá / tồn kho khi đặt hàng (spec 5.3). Logic tính là hàm thuần `lib/pricing.ts` dùng chung cho mock và (GĐ4) để đối chiếu.

### 2.3 Dữ liệu mẫu (`modules/shop/mocks/`, `modules/cms/mocks/`)

- ~40 sản phẩm, 4 danh mục cha / 12 danh mục con (theo menu GĐ1), 6 thương hiệu giả lập "ES …", thuộc tính lọc theo danh mục (công suất, tải trọng, khối lượng tạ, gấp gọn…), biến thể (màu, phiên bản, khối lượng), dịch vụ thêm (lắp đặt, gia hạn bảo hành), vài sản phẩm hết hàng / sắp hết.
- Ảnh: bổ sung placeholder SVG trung tính cho các loại còn thiếu (elip, giàn tạ, súng massage, bánh tạ) + ảnh gallery nhiều góc dùng lại placeholder.
- Trang CMS mẫu: `home` (bố cục B), 4 trang chính sách (bảo hành, đổi trả, giao hàng & lắp đặt, bảo mật), 1 landing page khuyến mãi.
- Bảng phí ship mẫu: 3 vùng (nội thành HCM/HN · miền lân cận · xa) × khoảng cân nặng; ngưỡng miễn phí theo giá trị đơn; hàng cồng kềnh có phụ phí.

---

## 3. Thư viện khối CMS v1 (`modules/cms/blocks/`)

Mỗi khối là một thư mục:

```text
blocks/hero-split/
  schema.ts        zod schema props + giá trị mặc định + version + migrate(oldProps, fromVersion)
  HeroSplit.tsx    component render (server component nếu không cần tương tác)
  meta.ts          type, nhóm ("general" | "commerce"), nhãn (khóa i18n), icon
```

- `blocks/registry.ts` gom mọi khối; `renderer/BlockRenderer.tsx` nhận `BlockInstance[]` → parse props bằng schema (props sai → bỏ khối đó, ghi `console.error` ở dev, **không làm vỡ trang**), bỏ khối `hidden`, chạy `migrate` khi `version` cũ.
- GĐ3 dùng lại đúng schema này để sinh form soạn thảo (zod 4 có `toJSONSchema`).

| Nhóm | Khối (`type`) | Ghi chú |
|---|---|---|
| Chung | `hero` (biến thể `split` / `full-image` / `slider`) | slider dùng carousel (Q4) |
| Chung | `rich-text` | theo Q1 |
| Chung | `image-text` | ảnh trái/phải |
| Chung | `usp-strip` | dải cam kết, nền `ink` |
| Chung | `link-card-grid` | "Bạn muốn tập gì?" — thẻ màu + link |
| Chung | `cta-banner` | |
| Chung | `banner-pair` | |
| Chung | `logo-strip` | logo thương hiệu |
| Chung | `testimonials` | |
| Chung | `faq` | accordion, có JSON-LD `FAQPage` |
| Chung | `video-embed` | YouTube/Vimeo, tải iframe khi bấm (không tải sẵn) |
| Thương mại | `product-grid` | lưu **điều kiện** (`source`, `categoryId`, `productIds`, `limit`) + tab; lấy dữ liệu khi render |
| Thương mại | `category-icons` | |

Trang chủ bố cục B = `hero(split)` → `usp-strip` → `link-card-grid` → `product-grid(tabs)` → `logo-strip` → `testimonials`. Header/footer giữ là component (cấu hình Header/Footer bằng khối để ở GĐ3 cùng trình soạn).

---

## 4. Màn hình & tính năng

### 4.1 Định tuyến (bổ sung vào `app/(shop)/`)

```text
page.tsx                       trang chủ — CmsPage("home")
[slug]/page.tsx                landing / trang chính sách — CmsPage(slug); không có -> 404
danh-muc/[...slug]/page.tsx    danh mục (đường dẫn cha/con)
tim-kiem/page.tsx              kết quả tìm kiếm (?q=)
san-pham/[slug]/page.tsx       chi tiết sản phẩm (?v=<variantId>)
gio-hang/page.tsx              giỏ hàng đầy đủ
thanh-toan/page.tsx            thanh toán 1 trang
don-hang/[code]/page.tsx       kết quả / theo dõi đơn
tra-cuu-don/page.tsx           tra cứu đơn (mã đơn + SĐT)
tai-khoan/dang-nhap, dang-ky   đăng nhập / đăng ký khách
tai-khoan/(protected)/don-hang, don-hang/[code], dia-chi
dev/cong-thanh-toan/page.tsx   cổng thanh toán giả lập (Q3, chặn ở production)
```

`[slug]` nằm cạnh các route tĩnh — Next ưu tiên route tĩnh; slug CMS phải tránh trùng các tên dành riêng (danh sách `RESERVED_SLUGS` dùng chung để GĐ3 kiểm tra khi tạo trang).

### 4.2 Danh mục & tìm kiếm

- Bố cục desktop: cột lọc trái (sticky) + lưới sản phẩm; mobile: nút "Bộ lọc (n)" mở `Sheet` dưới lên, nút "Áp dụng".
- Bộ lọc sinh từ `category.filterAttributes`: khoảng giá (2 ô số + gợi ý khoảng), thương hiệu, thuộc tính (checkbox nhiều / khoảng / có-không), còn hàng.
- Trạng thái lọc + sắp xếp + trang **trên URL** (`?gia=1000000-5000000&thuong-hieu=es-cardio&cong-suat=3-4&sap-xep=ban-chay&trang=2`) — hàm thuần `lib/filters.ts` chuyển URL ↔ đối tượng lọc (có test). Tag bộ lọc đang chọn + "Xóa tất cả".
- Sắp xếp: bán chạy · mới · giá tăng · giá giảm. "Xem thêm" tải trang kế, URL cập nhật `trang=` (F5 giữ vị trí).
- Trạng thái rỗng (không có sản phẩm khớp → gợi ý bỏ bớt lọc), đang tải (Skeleton đúng kích thước thẻ), lỗi.
- Tìm kiếm: ô ở header gõ → gợi ý (debounce 250ms, tối đa 5 sản phẩm + 3 danh mục, tìm **không dấu**: "may chay" khớp "Máy chạy"), ↑↓ Enter Esc; Enter → `/tim-kiem?q=`; trang kết quả dùng chung lưới + bộ lọc (thương hiệu, giá, còn hàng).

### 4.3 Chi tiết sản phẩm (theo mockup đã duyệt)

- Gallery: ảnh lớn + thumbnail, video; mobile vuốt (Q4) + chấm trang; bấm phóng to (Dialog).
- Chọn biến thể theo trục → đổi giá, ảnh, tồn kho, SKU tại chỗ; `?v=` trên URL (`router.replace`, không thêm lịch sử); lựa chọn không tồn tại / hết hàng hiển thị gạch, không chọn được.
- 4 thông số chính cạnh giá; dịch vụ thêm (checkbox có giá); số lượng (giới hạn theo tồn kho); "Thêm vào giỏ" (mở ngăn kéo giỏ) · "Mua ngay" (thêm rồi sang `/thanh-toan`).
- Ước tính giao hàng theo tỉnh (chọn tỉnh, nhớ lựa chọn) → phí + thời gian từ `CartPricingService`.
- Sub-nav dính: Mô tả (rich text) · Thông số (bảng theo nhóm) · Đánh giá (tóm tắt điểm + danh sách mẫu, chỉ đọc) · Hướng dẫn & tài liệu. Tab "Hỏi đáp" chưa có (GĐ7) → không hiển thị.
- "Thường mua cùng" + "Sản phẩm tương tự".
- Mobile: thanh dính đáy *Chat · Thêm giỏ · Mua ngay*. Nút Chat mở link Zalo/Messenger lấy từ cấu hình cửa hàng (chưa cấu hình → ẩn).
- SEO: `generateMetadata` (tên, mô tả, ảnh), JSON-LD `Product` (giá, tồn kho, đánh giá) + `BreadcrumbList`.

### 4.4 Giỏ hàng

- `stores/useCartStore.ts` (Zustand + `persist`, khóa localStorage có tiền tố dự án, có `version` để nâng cấp cấu trúc): chỉ lưu `CartLine[]`, **không lưu giá**.
- Hiển thị luôn qua `useCartPricing()` → giá / tồn kho mới nhất; dòng hết hàng hoặc đổi giá có cảnh báo.
- Ngăn kéo giỏ (Sheet phải) mở sau khi thêm; trang `/gio-hang` đầy đủ: sửa số lượng, bỏ dòng (hoàn tác bằng toast), dịch vụ thêm, thanh tiến độ "Mua thêm X để được miễn phí vận chuyển", tóm tắt.
- Badge số lượng trên icon giỏ ở header (render sau khi mount — tránh lệch hydration, theo bẫy đã ghi trong rules).
- Đồng bộ giữa nhiều tab trình duyệt (sự kiện `storage`).

### 4.5 Thanh toán (1 trang, không bắt buộc đăng nhập)

- Form `react-hook-form` + `zod`: liên hệ (họ tên, SĐT Việt Nam, email tùy chọn) → địa chỉ (tỉnh → phường/xã theo Q2, số nhà/đường; khách đã đăng nhập chọn từ sổ địa chỉ) → cách giao (tiêu chuẩn / nhanh nếu vùng hỗ trợ) → thanh toán (COD · chuyển khoản VietQR · VNPay · MoMo — ghi bằng chữ + icon trung tính) → ghi chú.
- Tóm tắt đơn bên phải (sticky); mobile thu gọn ở trên, mở xem chi tiết.
- Đổi tỉnh / cách giao → tính lại phí ship ngay.
- Đặt hàng: nút loading, chặn bấm lặp (khóa idempotency phía client), giá được tính lại; nếu có dòng đổi giá / hết hàng → dừng, báo rõ dòng nào, không tạo đơn.
- Sau khi tạo đơn: COD / chuyển khoản → `/don-hang/[code]` (chờ xác nhận; chuyển khoản hiện mã QR + nội dung chuyển khoản mẫu); VNPay / MoMo → cổng giả lập (Q3) → quay về `/don-hang/[code]`.
- Giỏ hàng chỉ xóa khi đơn tạo thành công.

### 4.6 Đơn hàng & tài khoản

- `/don-hang/[code]`: trạng thái (thành công / chờ thanh toán / thất bại + "Thanh toán lại" / đã hủy), dòng thời gian trạng thái, tóm tắt hàng + địa chỉ + thanh toán. Đơn lưu ở mock (`localStorage`); khách vãng lai chỉ xem được khi có mã + SĐT (giống tra cứu) hoặc vừa đặt trên trình duyệt này.
- `/tra-cuu-don`: mã đơn + SĐT → trang đơn.
- Tài khoản khách (**mock**, tách hẳn khỏi đăng nhập nhân viên — store riêng `useCustomerAuthStore`): đăng ký / đăng nhập bằng email hoặc SĐT + mật khẩu; danh sách đơn + chi tiết; sổ địa chỉ (thêm / sửa / xóa / đặt mặc định, form dùng chung với thanh toán). GĐ4 thay bằng API + phiên đăng nhập thật.
- Đăng nhập khi đang có giỏ → giữ nguyên giỏ (gộp với giỏ server ở GĐ4).

### 4.7 Header / footer hoàn thiện

- Menu danh mục có link thật; desktop: mega menu khi hover / focus (cột danh mục con), đóng bằng Esc.
- Tìm kiếm có gợi ý (4.2); tài khoản → trang đăng nhập hoặc menu tài khoản; giỏ → mở ngăn kéo.
- Footer: link tới các trang chính sách CMS mẫu + tra cứu đơn.

---

## 5. Thứ tự triển khai (mỗi mốc một commit, build được độc lập)

| Mốc | Nội dung |
|---|---|
| M1 | Kiểu dữ liệu, interface service, cài đặt mock, dữ liệu mẫu (sản phẩm, danh mục, phí ship, địa giới theo Q2) + test hàm thuần (`pricing`, `filters`, tìm kiếm không dấu) |
| M2 | Khung khối CMS: registry, renderer, 13 khối, rich text (Q1), trang chủ + `[slug]` từ JSON mẫu |
| M3 | Danh mục + bộ lọc URL + tìm kiếm (trang + gợi ý header) + mega menu |
| M4 | Chi tiết sản phẩm: gallery (Q4), biến thể, dịch vụ, ước tính giao hàng, tab nội dung, SEO JSON-LD |
| M5 | Giỏ hàng: store, định giá, ngăn kéo, trang giỏ, badge header |
| M6 | Thanh toán + tạo đơn + cổng giả lập (Q3) + trang kết quả / tra cứu đơn |
| M7 | Tài khoản khách mock: đăng nhập / đăng ký, đơn hàng, sổ địa chỉ |
| M8 | Hoàn thiện: trạng thái tải / rỗng / lỗi mọi trang, a11y bàn phím, Playwright, Lighthouse, cập nhật tài liệu |

Mỗi mốc chạy `tsc` → `lint --max-warnings=0` → `vitest` trước khi commit; `build` ở M2, M4, M6, M8.

---

## 6. Kiểm thử

- **Vitest — hàm thuần**: `pricing` (biến thể, dịch vụ thêm, phí ship theo vùng × cân nặng, phụ phí cồng kềnh, ngưỡng miễn phí, hết hàng / đổi giá), `filters` (URL ↔ đối tượng, giữ thứ tự, bỏ giá trị rỗng / sai), `normalizeVietnamese` + tìm kiếm, schema + `migrate` của từng khối, validate SĐT / địa chỉ.
- **Vitest — component**: chọn biến thể (đổi giá, khóa lựa chọn hết hàng), bộ lọc (chọn → URL), giỏ hàng (sửa số lượng, xóa + hoàn tác), form thanh toán (lỗi bắt buộc, đổi tỉnh nạp lại phường/xã), `BlockRenderer` (khối props sai bị bỏ qua, không vỡ trang).
- **Playwright** (không cần backend, chạy trên `next start` với dữ liệu mock):
  1. Trang chủ → danh mục → lọc → chi tiết → chọn biến thể → thêm giỏ → thanh toán COD → trang đơn thành công.
  2. Thanh toán VNPay → cổng giả lập "Thất bại" → trang đơn thất bại → "Thanh toán lại" → "Thành công".
  3. Tìm kiếm không dấu ra gợi ý; tra cứu đơn bằng mã + SĐT.
  4. Mobile 390px: thanh mua dính đáy, ngăn kéo bộ lọc, không cuộn ngang.
- **Lighthouse mobile** (trang chủ, chi tiết): mục tiêu spec 9 — Performance ≥ 85, SEO ≥ 95, Accessibility ≥ 90; ghi kết quả vào báo cáo cuối GĐ.
- Health check theo `CLAUDE.md`; backend không đổi trong GĐ2.

---

## 7. Rủi ro & cách xử lý

| Rủi ro | Xử lý |
|---|---|
| Kiểu mock lệch với API thật ở GĐ4 → phải sửa nhiều | Kiểu và interface service là "hợp đồng"; GĐ4 thiết kế DBML/serializer bám theo, chỉ thêm lớp ánh xạ trong `services/api/` |
| Giỏ hàng lệch hydration (localStorage) | Badge / ngăn kéo render sau mount (`useMounted`), như mẫu `AuthGuard` |
| Khối CMS lỗi dữ liệu làm vỡ cả trang | Renderer parse từng khối, khối lỗi bị bỏ qua (có test) |
| Dữ liệu phường/xã sai / cũ | Ghi nguồn + ngày; kiểm tra tổng số tỉnh (34) và mẫu ngẫu nhiên; tách file để cập nhật độc lập |
| Trang danh mục chậm khi nhiều bộ lọc | Lọc trong service (mock) như server sẽ làm; client chỉ nhận trang hiện tại |
| Route `[slug]` CMS trùng route hệ thống | `RESERVED_SLUGS` + route tĩnh được Next ưu tiên |
| Phạm vi lớn | Chia 8 mốc, mỗi mốc commit + kiểm tra riêng; báo tiến độ theo mốc |

---

## 8. Tiêu chí hoàn thành GĐ2

- [ ] Luồng mua hàng COD và VNPay/MoMo (giả lập: thành công, thất bại → thanh toán lại) chạy trọn trên desktop và mobile.
- [ ] Trang chủ và trang chính sách render từ JSON khối; khối props sai không làm vỡ trang.
- [ ] Bộ lọc danh mục phản ánh lên URL, F5 / chia sẻ link giữ nguyên kết quả.
- [ ] Tìm kiếm không dấu có gợi ý; header có badge giỏ hàng đúng số lượng.
- [ ] Tài khoản khách mock: đăng ký, đăng nhập, xem đơn, quản lý sổ địa chỉ.
- [ ] Mọi chữ qua i18n (`shop`, `cms` vi/en khớp khóa); không có nút "giả" không có chức năng.
- [ ] Health check frontend xanh; Vitest + Playwright (mock) xanh; Lighthouse đạt mục tiêu hoặc ghi rõ phần chưa đạt.
- [ ] Tài liệu cập nhật: cấu trúc `modules/shop`, `modules/cms`, cách thêm khối mới, biến `NEXT_PUBLIC_DATA_SOURCE`.

Commit theo mốc (Conventional Commits), push nhánh `feat/gd2-storefront-mock` khi xong (như GĐ1).
