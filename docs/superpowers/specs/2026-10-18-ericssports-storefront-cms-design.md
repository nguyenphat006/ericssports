# Ericssports — Website bán lẻ thiết bị gym + CMS landing page — Thiết kế đặc tả

**Ngày lập**: 2026-10-18
**Phiên bản**: 1.0
**Phân loại Brainstorming**: Architectural
**Trạng thái**: Đã được user duyệt từng phần trong phiên brainstorm; chờ user review bản viết

---

## 1. Bối cảnh & mục tiêu

Repo được clone từ Admin Template (Django 5.2 + DRF + PostgreSQL / Next.js 16 + Tailwind v4 + shadcn/ui). Template hiện **chỉ có trang quản trị nội bộ** (mọi route nằm sau đăng nhập).

Mục tiêu dự án:

1. Xây **website bán lẻ (B2C) thiết bị tập gym** thương hiệu **Ericssports**, có đủ luồng mua hàng và thanh toán **VNPay + MoMo**.
2. Xây **CMS quản trị landing page** dùng được cho **nhiều loại website** (không chỉ bán hàng) — đây là tài sản tái sử dụng cho các dự án sau.
3. Hướng tái sử dụng: **phương án C** — làm cụ thể cho Ericssports trước, code tổ chức sạch, giao diện đổi được qua token; **chưa** làm tính năng đổi theme đa khách hàng ngay.
4. Thứ tự: **UI/UX trước** (dữ liệu giả), backend sau.

**Ngoài phạm vi** (ít nhất tới hết GĐ6): B2B / báo giá dự án, nhiều kho, đa ngôn ngữ cho nội dung CMS, marketplace nhiều người bán.

---

## 2. Quyết định thiết kế (đã duyệt)

| # | Quyết định |
|---|---|
| D1 | Mô hình kinh doanh: chỉ bán lẻ (B2C) |
| D2 | Màu nhận diện **Ember** — giao diện sáng, không dùng nền tối toàn trang |
| D3 | Font **Archivo** (một họ, trục độ rộng `wdth` 62–125): tiêu đề bản hẹp + siêu đậm, nội dung bản thường. Bắt buộc subset `vietnamese` |
| D4 | Bố cục trang chủ mặc định **B — "Theo mục tiêu tập luyện"**, dựng từ khối CMS |
| D5 | Phong cách component **B — bo nhẹ 4–6px, ảnh lồng khung kem, không viền, không đổ bóng** |
| D6 | Trang chi tiết sản phẩm theo bản đề xuất (mục 5.2) |
| D7 | **Một app Next.js duy nhất**: storefront ở `/`, quản trị ở **`/admin`**; Django admin chuyển sang **`/django-admin/`** |
| D8 | Trình soạn trang CMS kiểu **B — form trái + xem trước trực tiếp phải**, làm 2 bước (v1, v2) |

---

## 3. Design system storefront

### 3.1 Màu (token)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `primary` | `#EA3A1E` | Nút chính, giá, nhãn giảm giá, liên kết nhấn |
| `ink` | `#1C1917` | Chữ chính, nút phụ nền tối, dải cam kết, footer |
| `bg` | `#FAF7F2` | Nền trang (kem ấm) |
| `surface` | `#FFFFFF` | Nền thẻ, header, form |
| `muted` | `#F3EEE6` | Khung ảnh sản phẩm, ô tìm kiếm |
| `border` | `#E5DCCF` / `#D6CCBE` | Viền nhẹ / viền ô nhập, chip |
| `text-secondary` | `#6B635A` | Mô tả, thông số |
| `text-tertiary` | `#9A9187` | Giá gạch, chú thích |
| `accent-soft` | `#F3B8A8` | Thẻ phụ, banner phụ |
| `success` | `#059669` | "Miễn phí", còn hàng |

Kiểm tra tương phản WCAG AA khi triển khai GĐ1 (đặc biệt chữ trắng trên `#EA3A1E` ở cỡ nhỏ; nếu không đạt, dùng sắc đậm hơn cho chữ cỡ nhỏ trên nền đỏ).

### 3.2 Typography

- **Archivo** tải qua `next/font/google`, `subsets: ['vietnamese', 'latin']`, variable font (trục `wght` + `wdth`).
- Đã kiểm chứng: Google Fonts cung cấp subset `vietnamese` cho Archivo, phủ `U+1EA0–1EF9`, Ă/Đ/Ĩ/Ũ/Ơ/Ư, dấu kết hợp, và `₫` (`U+20AB`).
- Vai trò:
  - `display`: `font-stretch: 62–70%`, `font-weight: 800–900`, chữ in hoa, `line-height ≈ 0.95–1`.
  - `body`: `font-stretch: 100%`, 400–600, 15–16px.
  - `price`: `font-stretch: 85%`, 700–800, `font-variant-numeric: tabular-nums`; giá cũ nhỏ, gạch ngang, màu `text-tertiary`.
- Tương phản cỡ chữ mạnh: hero 64–96px desktop vs nội dung 15–16px.
- Tối đa 2 họ font trên site (hiện dùng 1).
- Kiểm thử hiển thị bằng chuỗi: `Ầ Ẩ Ẫ Ậ Ề Ể Ễ Ệ Ở Ỡ Ợ Ừ Ử Ữ Ự · đặng ưởng ỹ · 12.990.000₫`.

### 3.3 Component

- Bo góc 4px (nút, chip, ô nhập), 6px (thẻ). Không đổ bóng, không viền thẻ — tách lớp bằng màu nền (`surface` trên `bg`, `muted` cho khung ảnh).
- **ProductCard**: khung ảnh `muted` lồng trong thẻ; nhãn (`-15%`, `Mới`) góc trên trái; thương hiệu (chữ hoa nhỏ) · tên · **2–3 thông số chính** · giá (+ giá cũ) · đánh giá + đã bán.
- Nút: chính (nền `primary`, chữ display in hoa), phụ (viền `ink` hoặc viền `primary`).
- Thang khoảng cách 4/8 theo `frontend-ux.md`.

### 3.4 Theme theo khu vực

- Layout `(shop)` gắn `data-site="shop"` và **ghi đè token `--c-*`** của template bằng bộ Ember → shadcn/ui tự đổi theo. Trang quản trị giữ theme navy hiện tại, không bị ảnh hưởng.
- Font khai báo qua token `--font-display`, `--font-body`.
- GĐ4 trở đi: token giao diện đọc từ cấu hình CMS (mục 4.1 "Giao diện") và chèn khi render → mỗi website có bộ nhận diện riêng.

---

## 4. Kiến trúc

### 4.1 Định tuyến (`client/src/app/`)

```text
(shop)/                       storefront ở "/", layout + theme Ember, SSR/ISR
  page.tsx                    trang chủ — render khối CMS
  [slug]/                     landing page / trang tĩnh do CMS tạo
  danh-muc/[...slug]/         danh mục + bộ lọc
  tim-kiem/                   kết quả tìm kiếm
  san-pham/[slug]/            chi tiết sản phẩm
  gio-hang/                   giỏ hàng đầy đủ
  thanh-toan/                 thanh toán 1 trang
  don-hang/[code]/            kết quả / theo dõi đơn
  tra-cuu-don/                tra cứu đơn cho khách vãng lai
  tai-khoan/...               đăng nhập/đăng ký khách, đơn hàng, sổ địa chỉ
admin/                        toàn bộ (dashboard) hiện tại chuyển vào, giữ theme navy
  login/                      đăng nhập nhân viên (từ (auth)/login)
  cms/pages/[id]/edit/        trình soạn trang
preview/[pageId]/             render bản nháp trong iframe của trình soạn (yêu cầu token xem trước)
```

- Django: `server/config/urls.py` đổi `path('admin/', …)` → `path('django-admin/', …)`; `deploy/nginx.conf` đổi `location /admin/` → `location /django-admin/` và cập nhật comment đầu file. Mọi link nội bộ, redirect đăng nhập, `proxy.ts`/middleware, Playwright, sidebar phải cập nhật tiền tố `/admin`.
- Đường dẫn route slug tiếng Việt không dấu (`danh-muc`, `san-pham`…).

### 4.2 Module frontend (`client/src/modules/`)

- `shop/` — catalog, cart, checkout, account; component storefront.
- `cms/` — `blocks/` (mỗi khối: `schema.ts` (zod) + `Component.tsx` + metadata nhóm/icon/label), `renderer/` (render mảng khối), `editor/` (trình soạn trang).
- Trang thật và bản xem trước **dùng chung component khối**.

### 4.3 Lớp dữ liệu (để làm UI trước)

- Mỗi service (`catalogService`, `cartService`, `orderService`, `cmsService`…) có **2 bản cài đặt cùng interface**: `mock` (JSON mẫu trong repo, CMS lưu tạm `localStorage`) và `api` (gọi Django qua `axiosClient`).
- Chọn bằng biến môi trường (vd `NEXT_PUBLIC_DATA_SOURCE=mock|api`). Component chỉ phụ thuộc interface.
- Kiểu dữ liệu mock phải khớp hình dạng dự kiến của API để khi có `api.generated.ts` chỉ cần ánh xạ nhẹ.

### 4.4 Đa ngôn ngữ

- Chữ giao diện storefront đi qua `next-intl` (quy tắc template); GĐ đầu chỉ có `vi` cho storefront (khóa `en` vẫn phải khớp theo CI — có thể để bản dịch tạm).
- Nội dung CMS lưu nguyên văn, chưa đa ngôn ngữ.

---

## 5. Storefront

### 5.1 Trang chủ (khối mặc định — bố cục B)

1. Header: logo · ô tìm kiếm · tài khoản · giỏ hàng (số lượng)
2. **Hero chia đôi**: dòng nhỏ · tiêu đề display · mô tả · nút · ảnh sản phẩm
3. **Dải cam kết** (nền `ink`): Giao toàn quốc · Lắp đặt · Bảo hành 24 tháng
4. **Lưới thẻ liên kết — "Bạn muốn tập gì?"**: Giảm cân (cardio) · Tăng cơ (tạ, ghế) · Dẻo dai (yoga)
5. **Lưới sản phẩm có tab**: Nổi bật · Mới · Giảm giá
6. **Logo thương hiệu**
7. **Đánh giá khách hàng**
8. Footer: liên hệ · chính sách · mạng xã hội

### 5.2 Chi tiết sản phẩm

- Breadcrumb; gallery ảnh + thumbnail + video; nhãn giảm giá.
- Thương hiệu · mã · tên (display) · đánh giá · đã bán.
- Giá + giá cũ + dòng "trả góp từ …/tháng" (chỉ hiển thị khi có cấu hình trả góp — GĐ7).
- **Biến thể** (màu, phiên bản, cân nặng…) đổi giá/ảnh/tồn kho tại chỗ, không tải lại trang; đồng bộ lên URL (`?v=`).
- **4 thông số chính** dạng ô cạnh giá.
- **Dịch vụ thêm** có giá (lắp đặt tận nơi, gia hạn bảo hành) — chọn bằng checkbox, cộng vào dòng hàng.
- Số lượng · Thêm vào giỏ · Mua ngay.
- Phí & thời gian giao theo tỉnh (chọn tỉnh), bảo hành, đổi trả, phương thức thanh toán.
- Tab/sub-nav: Mô tả (nội dung CMS) · Thông số kỹ thuật (bảng, gồm kích thước khi gấp, khối lượng) · Đánh giá · Hỏi đáp · Hướng dẫn & tài liệu. (Đánh giá/Hỏi đáp v1 hiển thị dạng chỉ đọc hoặc ẩn nếu chưa có dữ liệu — tính năng gửi đánh giá ở GĐ7.)
- "Thường mua cùng".
- Mobile: gallery vuốt; **thanh dính đáy** gồm chat (Zalo/Messenger) · Thêm giỏ · Mua ngay.

### 5.3 Các màn hình còn lại (v1)

| Màn hình | Yêu cầu |
|---|---|
| Danh mục | Bộ lọc **theo thuộc tính của danh mục** + giá, thương hiệu, còn hàng; sắp xếp bán chạy/mới/giá; trạng thái lọc trên URL; ngăn kéo lọc trên mobile; phân trang "Xem thêm" |
| Tìm kiếm | Gợi ý tức thì (sản phẩm + danh mục); trang kết quả dùng chung bộ lọc |
| Giỏ hàng | Ngăn kéo nhanh từ header + trang đầy đủ; dịch vụ thêm; tạm tính; ngưỡng miễn phí vận chuyển |
| Thanh toán | **1 trang, cho phép khách vãng lai**: liên hệ → địa chỉ → cách giao → thanh toán → ghi chú; tóm tắt đơn bên phải (mobile: thu gọn phía trên) |
| Kết quả đơn | Thành công / chờ thanh toán / thất bại + thanh toán lại |
| Tài khoản | Đăng ký/đăng nhập bằng email hoặc số điện thoại; đơn hàng + chi tiết + trạng thái; sổ địa chỉ |
| Tra cứu đơn | Mã đơn + số điện thoại |

- **Địa chỉ**: theo địa giới hành chính **2 cấp** (tỉnh/thành → phường/xã, hiệu lực 01/07/2025) + số nhà/đường.
- **Giỏ hàng**: khách vãng lai lưu trình duyệt (Zustand persist); đăng nhập → gộp vào giỏ server. **Giá, khuyến mãi, tồn kho luôn tính lại ở server khi đặt hàng.**

### 5.4 Thanh toán & trạng thái đơn

Luồng VNPay / MoMo (UI ở GĐ2, tích hợp thật ở GĐ6):

1. Đặt hàng → server tạo đơn `chờ thanh toán`, **giữ tồn kho**, tạo URL thanh toán có chữ ký.
2. Redirect sang cổng. Cổng gọi **IPN** về server (xác thực chữ ký, idempotent theo mã giao dịch). **Chỉ IPN cập nhật trạng thái thanh toán**; return URL chỉ để hiển thị.
3. Quá hạn (mặc định 15 phút, cấu hình được) chưa thanh toán → Celery hủy đơn, trả tồn kho.
4. COD / chuyển khoản (VietQR) → `chờ xác nhận`, nhân viên xác nhận trong quản trị.

Trạng thái: `chờ thanh toán → chờ xác nhận → đang chuẩn bị → đang giao → hoàn tất`; nhánh `hủy`, `hoàn tiền`, `đổi trả`. Mọi giao dịch cổng thanh toán được ghi log.

**Phí ship v1**: bảng vùng × khoảng cân nặng cấu hình trong quản trị; ngưỡng miễn phí theo giá trị đơn.

---

## 6. CMS

### 6.1 Đối tượng (đề xuất — chốt chi tiết trong DBML ở GĐ4)

| Đối tượng | Nội dung |
|---|---|
| Trang (Page) | slug, tiêu đề, loại (`home` / `landing` / `static`), SEO (title, description, og image), trạng thái, `draft_blocks`, `published_blocks`, `published_at` |
| Header / Footer | Cấu hình toàn site, dựng bằng khối |
| Menu | Nhiều cấp; mục trỏ tới trang / danh mục / sản phẩm / URL ngoài |
| Giao diện | Token màu, font, bo góc, logo, favicon, SEO mặc định |
| Thư viện media | Ảnh/video dùng chung, thư mục + tìm kiếm; xây trên tệp đính kèm sẵn có của template |

### 6.2 Mô hình khối

```json
[{ "id": "b_01", "type": "hero-split", "version": 1, "hidden": false, "props": { "kicker": "TẬP TẠI NHÀ", "title": "Phòng gym trong nhà bạn", "image": "media:123", "cta": { "label": "Khám phá", "href": "/danh-muc/cardio" } } }]
```

- `version` theo từng loại khối → cho phép viết hàm nâng cấp props khi schema đổi.
- Khối dữ liệu động lưu **điều kiện truy vấn**, không lưu dữ liệu chụp sẵn (vd lưới sản phẩm: `{source: "category" | "bestseller" | "new" | "sale" | "manual", categoryId?, productIds?, limit}`).
- Thêm khối mới = khai báo `schema.ts` (zod) + `Component.tsx` + đăng ký vào registry. Form trong trình soạn **sinh từ schema**.

### 6.3 Thư viện khối v1

- **Nhóm chung**: Hero (`split` / `full-image` / `slider`), Văn bản tự do, Ảnh + chữ, Dải cam kết, Lưới thẻ liên kết, Banner CTA, Banner đôi, Logo đối tác, Đánh giá khách hàng, FAQ, Nhúng video.
- **Nhóm thương mại** (bật/tắt theo site): Lưới sản phẩm (có tab), Danh mục dạng icon.
- Để sau: Flash sale (cần phân hệ khuyến mãi — GĐ7), Combo, Bài viết blog.

### 6.4 Trình soạn trang (kiểu B)

**v1**
- Cột trái: danh sách khối kéo thả (`@dnd-kit` đã có), ẩn/hiện, nhân bản, xóa, "+ Thêm khối" (chọn từ thư viện theo nhóm); khối đang chọn mở form (react-hook-form + zod resolver) ngay bên dưới.
- Cột phải: iframe `/preview/[pageId]`, chuyển desktop/mobile; nhận props nháp qua `postMessage` → cập nhật tức thì, chưa cần lưu.
- Tự lưu nháp (debounce 2 giây sau lần sửa cuối) vào `draft_blocks`; trạng thái "Đã lưu / Đang lưu / Lỗi".
- **Xuất bản**: chép `draft_blocks → published_blocks`, gọi `revalidateTag` (ISR on-demand).
- Kiểm tra 2 lớp: frontend theo zod; backend kiểm tra `type` hợp lệ + cấu trúc cơ bản.

**v2**: bấm khối trong preview để chọn; lịch sử phiên bản + khôi phục; hẹn giờ xuất bản.

### 6.5 Phân quyền

- Module RBAC `CMS` (dùng ModuleRegistry động sẵn có). Quyền xem / tạo / sửa / xóa theo chuẩn template **+ một action mới `PUBLISH`** để tách vai trò biên tập viên (chỉ sửa nháp) và người xuất bản.
- Route `/preview/*` chỉ trả bản nháp khi có token xem trước hợp lệ của nhân viên có quyền.

---

## 7. Quản trị bán hàng (`/admin`)

Dùng `ListPage` / `DetailPage` / `FormDialog` của template.

| Nhóm | Phân hệ |
|---|---|
| Sản phẩm | Danh mục (phân cấp), Thương hiệu, Thuộc tính & bộ lọc theo danh mục, Sản phẩm (biến thể, media, thông số, dịch vụ thêm, SEO) |
| Kho | Tồn kho theo biến thể, phiếu nhập / điều chỉnh (1 kho ở v1); nhà cung cấp dùng module `suppliers` sẵn có |
| Bán hàng | Đơn hàng (danh sách, chi tiết, đổi trạng thái, ghi chú nội bộ, in phiếu giao), Giao dịch thanh toán (log IPN), Khách hàng (thay module mẫu `customers` vốn thiết kế B2B) |
| Cấu hình | Bảng phí ship, phương thức thanh toán, thông tin cửa hàng |
| CMS | Trang, Menu, Header/Footer, Giao diện, Thư viện media |
| Tổng quan | Doanh thu, đơn theo trạng thái, top bán chạy, sắp hết hàng |

Dọn template: xóa module mẫu `master_data`; thay thiết kế sản xuất cũ trong `server/database.dbml` bằng thiết kế của dự án; cập nhật đoạn mô tả phạm vi trong `CLAUDE.md`. Giữ nguyên lõi (RBAC, người dùng, nhật ký, đính kèm, xuất Excel, tìm kiếm toàn cục).

Tài khoản khách hàng **tách khỏi** tài khoản nhân viên (bảng / luồng xác thực riêng — chốt ở DBML GĐ4).

---

## 8. Lộ trình

| GĐ | Nội dung | Kết quả |
|---|---|---|
| 1 | Nền tảng: dời quản trị sang `/admin`, Django admin sang `/django-admin/`; token Ember + Archivo; component cơ bản (Button, Price, Badge, ProductCard, Input, Chip…); header/footer, layout `(shop)` | Khung giao diện chạy được |
| 2 | Storefront trên dữ liệu giả: toàn bộ màn hình mục 5 + thư viện khối CMS v1 render trang chủ từ JSON mock | Bấm thử trọn luồng mua hàng |
| 3 | Trình soạn trang CMS v1 trên dữ liệu giả (`localStorage`) | Kiểm chứng UX soạn trang trước khi chốt CSDL |
| 4 | DBML (catalog, đơn hàng, khách hàng, CMS) → user duyệt → Django → chuyển service `mock → api` | Dữ liệu thật |
| 5 | Các phân hệ quản trị bán hàng (mục 7) | Vận hành được |
| 6 | VNPay + MoMo sandbox, IPN, hủy đơn quá hạn | Nhận thanh toán thật |
| 7 | Khuyến mãi / mã giảm giá / flash sale, đánh giá, so sánh, yêu thích, trả góp, CMS v2, kết nối hãng vận chuyển | Hoàn thiện |

Mỗi GĐ có kế hoạch triển khai riêng (writing-plans) trước khi code. GĐ 1–3 là phần "UI/UX trước".

---

## 9. Kiểm thử & tiêu chí hoàn thành

- **Vitest**: schema khối (parse/defaults/nâng cấp version), tính giỏ hàng (biến thể, dịch vụ thêm, phí ship, ngưỡng miễn phí), định dạng giá `₫`.
- **Playwright**: smoke luồng trang chủ → danh mục → chi tiết → giỏ → thanh toán (mock); trình soạn trang: thêm/sắp xếp khối → preview cập nhật → xuất bản.
- **Health check** cuối mỗi GĐ theo `CLAUDE.md`: frontend `tsc --noEmit` → `lint --max-warnings=0` → `build`; backend `makemigrations` → `migrate` → `check`.
- Kiểm tra hiển thị tiếng Việt có dấu với chuỗi ở mục 3.2 trên Chrome, Safari iOS, Chrome Android.
- Lighthouse mobile cho trang chủ & chi tiết sản phẩm: mục tiêu Performance ≥ 85, SEO ≥ 95, Accessibility ≥ 90.

---

## 10. Tham chiếu

- Mockup phiên brainstorm (không commit): `.superpowers/brainstorm/` — `color-direction`, `typography`, `homepage-layout-v2`, `component-style`, `product-detail`, `cms-editor`.
- Quy tắc template: `CLAUDE.md`, `.claude/rules/*`.
