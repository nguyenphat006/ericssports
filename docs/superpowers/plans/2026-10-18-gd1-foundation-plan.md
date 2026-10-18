# GĐ1 — Nền tảng storefront: kế hoạch triển khai

**Ngày lập**: 2026-10-18
**Spec gốc**: `docs/superpowers/specs/2026-10-18-ericssports-storefront-cms-design.md` (mục 3, 4, 8)
**Trạng thái**: Chờ user duyệt — chưa code
**Nhánh dự kiến**: `feat/gd1-foundation`

---

## 0. Mục tiêu & kết quả bàn giao

Kết thúc GĐ1:

1. Trang quản trị hiện tại chạy ở **`/admin/*`** (đăng nhập `/admin/login`), mọi link / menu / tìm kiếm / thông báo / breadcrumb / phân quyền route vẫn đúng.
2. Django admin chạy ở **`/django-admin/`** (dev + nginx production).
3. Storefront có layout `(shop)` ở `/`: **header + footer responsive**, theme **Ember**, font **Archivo** (subset tiếng Việt), luôn sáng.
4. Bộ **component cơ bản** của storefront + trang **UI kit** (`/dev/ui-kit`, chỉ chạy ngoài production) để duyệt bằng mắt.
5. Trang chủ tạm (hero + lưới ProductCard dữ liệu mẫu) — sẽ thay bằng renderer khối CMS ở GĐ2.
6. Trang 404 / lỗi riêng cho storefront.
7. Health check xanh: `tsc`, `lint --max-warnings=0`, `vitest`, `build`; backend `check`; Playwright smoke cập nhật.

**Ngoài phạm vi GĐ1**: tìm kiếm thật, giỏ hàng (badge số lượng), danh mục, trang sản phẩm, renderer khối CMS, lớp service mock/api (tất cả thuộc GĐ2). Không xóa module mẫu `master_data` (làm cùng DBML ở GĐ4).

---

## 1. Quyết định kỹ thuật cần user xác nhận

### Q1 — Cách thêm tiền tố `/admin` cho route quản trị (khuyến nghị: **A**)

Backend đang lưu đường dẫn màn hình ở nhiều nơi: `ModuleRegistry.route_path` (`/users`, `/master-data/customers`…), URL kết quả tìm kiếm (`search.py`), `link` thông báo (đã lưu trong DB, vd `/profile`), `href` thẻ KPI dashboard, và lệnh `startmodule --route`.

- **A. Backend giữ đường dẫn "tương đối với khu quản trị"** (`/users`), frontend thêm tiền tố tại **một helper duy nhất** `adminPath()` ở các điểm nhận đường dẫn từ backend (menu, command palette, tìm kiếm, thông báo, dashboard) và trong link nội bộ của module.
  - ✅ Không đổi dữ liệu DB, không migration, không sửa `rbac.py` / `search.py` / `startmodule`; thông báo cũ vẫn đúng; backend không cần biết frontend đặt quản trị ở đâu (đổi `/admin` thành gì cũng chỉ sửa 1 hằng số).
  - ⚠️ Phải bọc đủ mọi chỗ — có test + Playwright để bắt sót.
- **B. Đổi toàn bộ dữ liệu sang `/admin/...`** (seed, `rbac.py`, `search.py`, dashboard, `startmodule`, data migration cho `route_path` & `link` thông báo cũ).
  - ✅ URL trong DB = URL thật.
  - ⚠️ Sửa nhiều file backend + migration dữ liệu; khóa cứng `/admin` vào backend.

### Q2 — Điều chỉnh màu để đạt WCAG AA (khuyến nghị: **đồng ý**)

Đo tương phản thực tế:

| Cặp màu | Tỉ lệ | AA chữ thường (≥ 4.5) |
|---|---|---|
| Trắng trên `#EA3A1E` | 4.10 | ❌ (chỉ đạt chữ lớn ≥ 24px / 18.66px đậm) |
| `#EA3A1E` trên nền kem `#FAF7F2` | 3.84 | ❌ |
| Trắng trên `#D4321A` | 4.92 | ✅ |
| `#D4321A` trên kem / trắng | 4.60 / 4.92 | ✅ |
| `#9A9187` (chữ phụ cấp 3) trên kem | 2.90 | ❌ |
| `#78706A` trên kem / trắng | 4.54 / 4.86 | ✅ |

Đề xuất token:

- `--shop-primary: #D4321A` — nút, giá, link, nhãn chữ nhỏ (mắt thường gần như không phân biệt với `#EA3A1E`).
- `--shop-primary-bright: #EA3A1E` — mảng màu lớn / chữ display cỡ lớn / trang trí (nền hero, thẻ "Giảm cân", gạch chân tab).
- `--shop-primary-hover: #B82A14`.
- `--shop-text-tertiary: #78706A` (thay `#9A9187`).

### Q3 — Trang UI kit `/dev/ui-kit` (khuyến nghị: **có**)

Trang nội bộ liệt kê mọi component + chuỗi kiểm tra dấu tiếng Việt, `notFound()` khi `NODE_ENV === "production"`. Dùng để duyệt GĐ1 bằng mắt và làm tài liệu sống cho GĐ2. Không có liên kết từ site.

---

## 2. Các bước triển khai

Thứ tự được chọn để mỗi bước build được và kiểm tra được độc lập.

### Bước 1 — Django admin sang `/django-admin/`

| File | Thay đổi |
|---|---|
| `server/config/urls.py` | `path('admin/', …)` → `path('django-admin/', …)` |
| `deploy/nginx.conf` | `location /admin/` → `location /django-admin/`; cập nhật comment đầu file (`/admin` giờ thuộc Next.js) |
| `README.md`, `server/README.md`, `docs/TEMPLATE.md`, `CLAUDE.md` | Cập nhật mọi nhắc đến đường dẫn Django admin |

Kiểm tra: `python manage.py check`; mở `http://localhost:8000/django-admin/`.

### Bước 2 — Hằng số & helper đường dẫn quản trị

- Tạo `client/src/config/routes.ts`:
  - `ADMIN_BASE = "/admin"`, `ADMIN_LOGIN = "/admin/login"`.
  - `adminPath(p)` — thêm tiền tố, không nhân đôi nếu đã có, bỏ qua URL tuyệt đối (`http…`).
  - `stripAdminBase(pathname)` — dùng cho so khớp quyền / breadcrumb.
  - `isAdminPath(pathname)`.
- Unit test Vitest `routes.test.ts`: `/` → `/admin`, `/users/5` → `/admin/users/5`, `/admin/users` giữ nguyên, query string giữ nguyên, URL ngoài giữ nguyên.

### Bước 3 — Dời route quản trị vào `/admin`

Cấu trúc mới:

```text
src/app/
  admin/
    login/page.tsx            ← từ (auth)/login (bỏ group (auth) nếu không còn trang nào)
    (panel)/                  ← từ (dashboard)/ — giữ AuthGuard + DashboardLayout
      layout.tsx, page.tsx, error.tsx, loading.tsx, not-found.tsx, 403/,
      users/, audit-logs/, master-data/, profile/, settings/
```

Cập nhật dùng `adminPath` / `ADMIN_LOGIN` (danh sách từ rà soát code):

| Khu vực | File |
|---|---|
| Chuyển hướng đăng nhập | `components/auth/AuthGuard.tsx`, `lib/api/axiosClient.ts` (chỉ redirect khi đang ở khu quản trị — storefront không bị đá sang trang login), `modules/auth/LoginView.tsx` (sau đăng nhập → `/admin`), `components/layouts/DashboardLayout.tsx` (đăng xuất, hồ sơ) |
| Phân quyền route | `components/auth/RouteGuard.tsx` — so khớp trên `stripAdminBase(pathname)`; `ALWAYS_ALLOWED` giữ dạng tương đối |
| Menu / palette / breadcrumb | `DashboardLayout.tsx` (menu sidebar từ `useNavigation`, `paletteRoutes`, `onNavigate`), `layouts/DynamicBreadcrumb.tsx` (bỏ tiền tố trước khi tách segment; link về "Tổng quan" = `/admin`) |
| Tìm kiếm toàn cục | `layouts/command-palette/*` — URL kết quả từ backend đi qua `adminPath`; cập nhật `searchNavigation.test.ts`, `recentSearch.test.ts` |
| Thông báo | `layouts/notifications/NotificationBell.tsx` — `router.push(adminPath(item.link))` |
| Dashboard | Thẻ KPI có `href` từ API → `adminPath` |
| Link trong module | `modules/users/*`, `modules/master-data/materials/*` (`LIST_HREF`, `link: r => …`, `quickView.href`), `components/detail/DetailPage.tsx` (`backHref`), `components/common/StatusPage` (nút "Về trang chủ" trong khu quản trị → `/admin`) |
| Bộ sinh module | `scripts/gen-module.mjs`: trang sinh vào `src/app/admin/(panel)/<route>/page.tsx`; khuôn `module-template/*` dùng `adminPath` cho link; route lưu backend giữ tương đối (theo Q1-A) |
| E2E | `e2e/smoke.spec.ts`: `/login` → `/admin/login`, `CORE_PAGES` thêm tiền tố |

Sau bước này: rà lại bằng `grep` mọi chuỗi `"/users"`, `"/profile"`, `"/login"`, `router.push(` trong `src/` để chắc không sót.

> Nếu user chọn Q1-B: thay phần "đi qua `adminPath`" bằng sửa dữ liệu backend + data migration; liệt kê lại file trước khi làm.

### Bước 4 — Tách theme sáng/tối khỏi storefront

Vấn đề: `THEME_INIT_SCRIPT` và `AppProviders` gán `data-theme` lên `<html>` cho toàn site, variant `dark:` khớp `[data-theme=dark] *` → storefront sẽ bị tối theo lựa chọn của nhân viên.

- `THEME_INIT_SCRIPT`: chỉ áp lựa chọn đã lưu khi `location.pathname` thuộc `/admin`; ngoài ra luôn `light`.
- Dời `hydrate()` + theo dõi `prefers-color-scheme` từ `AppProviders` vào layout `admin/(panel)` (và trang login).
- Layout `(shop)` khi mount đặt `data-theme="light"` (trường hợp điều hướng client từ admin sang shop).
- Nút đổi theme chỉ tồn tại trong quản trị (giữ nguyên).

### Bước 5 — Token Ember & font Archivo

- `src/app/(shop)/layout.tsx`: wrapper `<div data-site="shop" className={archivo.variable}>`.
- Font: `next/font/google` → `Archivo({ subsets: ["vietnamese", "latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" })`.
- `src/app/(shop)/shop.css` (import trong layout shop, không đụng `globals.css` của admin):
  - `[data-site="shop"]` ghi đè token template → shadcn/ui tự đổi màu: `--c-primary` (Q2), `--c-primary-hover`, `--c-surface: #FFFFFF`, `--c-layout: #FAF7F2`, `--c-bg-muted: #F3EEE6`, `--c-border: #E5DCCF`, `--c-border-strong: #D6CCBE`, `--c-text: #1C1917`, `--c-text-secondary: #6B635A`, `--c-text-tertiary` (Q2), `--c-success: #059669`, `--radius: 0.25rem`; `--font-sans-app: var(--font-archivo)`.
  - Token riêng storefront: `--shop-ink`, `--shop-primary-bright`, `--shop-accent-soft: #F3B8A8`.
  - Tiện ích Tailwind v4 (`@utility`): `font-display` (`font-stretch: 62%`, weight 900, uppercase, `line-height: .95`), `font-display-soft` (70% / 800), `text-price` (`font-stretch: 85%`, 800, `tabular-nums`).
  - Nền `body` khu shop = kem.

### Bước 6 — Component cơ bản (`src/modules/shop/components/ui/`)

| Component | Ghi chú |
|---|---|
| `Container` | max-width 1280px, gutter 16px mobile / 24px desktop |
| `ShopButton` | bọc shadcn `Button`; biến thể `primary` (nền đỏ, chữ display in hoa), `outline` (viền đỏ), `ink` (nền `#1C1917`), `ghost`; cỡ `sm/md/lg`; trạng thái loading, disabled |
| `Price` | `formatPrice()` cố định định dạng Việt `12.990.000₫` (không phụ thuộc cấu hình số của trang quản trị); props `value`, `compareAt?` (giá gạch), `size` |
| `Badge` | `sale` (`-15%`), `new`, `ink`, `soft`; đặt góc ảnh |
| `Chip` | nhãn lọc bật/tắt (`aria-pressed`) |
| `Rating` | sao + điểm + số đánh giá / đã bán |
| `SectionHeading` | tiêu đề display + link "Xem tất cả" |
| `ProductCard` | theo spec 3.3: khung ảnh `muted` lồng trong thẻ (`next/image`), badge, thương hiệu, tên (2 dòng), tối đa 3 thông số, giá + giá gạch, rating; toàn thẻ là link; hover nhẹ (đổi nền khung ảnh, không bóng) |
| Ô nhập / select / checkbox | dùng shadcn `Input`, `Select`, `Checkbox` — chỉ nhận token shop, không viết lại |

Kiểu dữ liệu tạm `ProductSummary` đặt ở `src/modules/shop/types.ts` (tên, slug, ảnh, thương hiệu, thông số chính, giá, giá gạch, nhãn, rating, đã bán) — GĐ2 dùng tiếp cho lớp service.

### Bước 7 — Header & footer storefront

- **Header** (`modules/shop/components/layout/ShopHeader.tsx`):
  - Desktop: wordmark `ERICS` + `SPORTS` (màu đỏ, chữ display) · menu danh mục chính · ô tìm kiếm · tài khoản · giỏ hàng.
  - Mobile: nút menu (shadcn `Sheet` từ trái) · wordmark · tìm kiếm (icon mở ô nhập) · giỏ hàng.
  - Header dính đầu trang khi cuộn.
  - Menu đọc từ `modules/shop/config/navigation.ts` (dữ liệu tĩnh tạm, GĐ3/4 thay bằng Menu CMS).
  - Ô tìm kiếm và giỏ hàng **chỉ là giao diện** ở GĐ1 (chức năng ở GĐ2) — không tạo link dẫn tới trang chưa có.
- **Footer** (`ShopFooter.tsx`, nền `ink`): thông tin cửa hàng, cột chính sách, cột hỗ trợ, mạng xã hội, phương thức thanh toán (COD, VNPay, MoMo, chuyển khoản — dạng chữ/icon trung tính, chưa dùng logo thương hiệu). Accordion trên mobile.
- Kèm link "Bỏ qua đến nội dung" (a11y), `aria-label` cho nút icon.

### Bước 8 — Trang chủ tạm, 404, lỗi, UI kit

- `(shop)/page.tsx`: hero chia đôi tĩnh + `SectionHeading` + lưới 4–8 `ProductCard` từ `modules/shop/mocks/products.ts` (6–8 sản phẩm gym mẫu). Ghi chú rõ trong code: GĐ2 thay bằng renderer khối.
- `app/not-found.tsx` (gốc) chuyển sang giao diện storefront (404 thân thiện + nút về trang chủ); khu quản trị giữ `admin/(panel)/not-found.tsx`.
- `(shop)/error.tsx` giao diện storefront.
- `(shop)/dev/ui-kit/page.tsx` (theo Q3) — mọi biến thể component + chuỗi `Ầ Ẩ Ẫ Ậ Ề Ể Ễ Ệ Ở Ỡ Ợ Ừ Ử Ữ Ự · đặng ưởng ỹ · 12.990.000₫` ở các độ đậm/độ rộng.
- Metadata storefront: `title` template riêng (`%s | Ericssports`), `lang="vi"`.
- Ảnh mẫu: placeholder trung tính tự vẽ (SVG trong `public/shop/placeholder/`) — không dùng ảnh/logo thương hiệu thật.

### Bước 9 — Chữ hiển thị (i18n)

- Namespace mới `shop` trong `messages/vi/shop.json` + `messages/en/shop.json` (khớp khóa cho CI), đăng ký trong `index.ts`.
- Không viết cứng chữ trong component (theo `frontend-i18n.md`); dữ liệu mock (tên sản phẩm) không cần i18n.

### Bước 10 — Kiểm thử & health check

- Vitest: `routes.test.ts` (Bước 2), `formatPrice.test.ts` (`0₫`, `890.000₫`, `12.990.000₫`, số âm/không hợp lệ), test render `Price` có giá gạch, `ProductCard` hiển thị badge/thông số.
- Cập nhật test có sẵn bị ảnh hưởng bởi tiền tố (command palette, `useListState` nếu liên quan).
- Playwright `e2e/smoke.spec.ts`: luồng admin với tiền tố mới; thêm test storefront: mở `/` không lỗi console, thấy header/footer, `/khong-ton-tai` ra 404 storefront, viewport 390px không cuộn ngang.
- Health check theo `CLAUDE.md`: `npx tsc --noEmit` → `npm run lint -- --max-warnings=0` → `npm test` → `npm run build`; backend `python manage.py check`.
- Kiểm tra tay: hiển thị dấu tiếng Việt trên Chrome desktop + giả lập mobile; chuyển qua lại admin ↔ shop không lệch theme.

---

## 3. Rủi ro & cách xử lý

| Rủi ro | Xử lý |
|---|---|
| Sót link không có tiền tố `/admin` | Helper duy nhất + grep rà soát + Playwright mở mọi màn hình lõi + menu |
| Theme tối của admin lọt sang shop | Bước 4; test chuyển trang admin → shop |
| `axiosClient` đá khách storefront sang trang login khi gặp 401 | Chỉ redirect khi `isAdminPath(location.pathname)` |
| Font variable nặng | `next/font` tự host + subset; chỉ tải trục `wght` + `wdth` cần dùng; kiểm tra kích thước trong build |
| Next 16 có thay đổi API | Đọc `node_modules/next/dist/docs/` cho `next/font`, route group, `not-found` trước khi code (theo `client/AGENTS.md`) |

---

## 4. Tiêu chí hoàn thành GĐ1

- [ ] `/admin/*` hoạt động đủ: đăng nhập, menu, tìm kiếm (Ctrl K), thông báo, breadcrumb, 403, xuất Excel.
- [ ] `/django-admin/` hoạt động (dev).
- [ ] `/` hiển thị storefront theme Ember + Archivo, header/footer responsive, không cuộn ngang ở 390px.
- [ ] `/dev/ui-kit` hiển thị đủ component; 404 trong production.
- [ ] Màu chữ/nút đạt AA theo bảng Q2.
- [ ] Health check frontend + backend xanh, Playwright smoke xanh.
- [ ] Tài liệu cập nhật đường dẫn mới (`README.md`, `CLAUDE.md`, `docs/TEMPLATE.md`, `server/README.md`, `client/README.md`).

Commit theo từng bước lớn (Conventional Commits, vd `refactor(client): dời trang quản trị sang /admin`, `feat(shop): token Ember và font Archivo`). Chỉ commit/push khi user đồng ý.
