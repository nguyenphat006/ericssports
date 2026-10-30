# Storefront & CMS — hướng dẫn cho dev

Spec: `docs/superpowers/specs/2026-10-18-ericssports-storefront-cms-design.md` · Kế hoạch: `docs/superpowers/plans/`

## 1. Bản đồ

| Đường dẫn | Nội dung |
|---|---|
| `client/src/app/(shop)/` | Route storefront ở `/` (mỏng — chỉ metadata + render view) |
| `client/src/modules/shop/` | Toàn bộ storefront: `types/`, `services/` (interface + `mock/`), `lib/` (hàm thuần có test), `stores/` (Zustand), `hooks/`, `components/`, `views/`, `mocks/` (dữ liệu mẫu), `styles/shop.css` (theme Ember) |
| `client/public/shop/photos/` | Ảnh chụp minh họa (Unsplash) + `CREDITS.md` |
| `client/src/modules/cms/` | CMS: `blocks/` (13 khối), `renderer/`, `richtext/` (JSON kiểu Tiptap), `mocks/pages.ts`, `services.ts`, `views/CmsPageView.tsx` |
| `client/public/shop/locations/` | Địa giới 2 cấp sau 01/07/2025 (34 tỉnh, 3.321 phường/xã; nguồn + ngày lấy trong `provinces.json`) |
| `client/e2e/storefront.spec.ts` | E2E storefront (không cần backend) |

Trang quản trị nằm ở `/admin/*` (`app/admin/`), Django admin ở `/django-admin/`. Backend lưu đường dẫn màn hình quản trị **tương đối** (`/users`) — frontend thêm tiền tố qua `adminPath()` (`src/config/routes.ts`).

## 2. Lớp dữ liệu

- Component / view **chỉ gọi service** trong `modules/shop/services` (`catalogService`, `pricingService`, `orderService`, `customerService`, `locationService`) và `modules/cms/services.ts`.
- `NEXT_PUBLIC_DATA_SOURCE=mock` (mặc định): dữ liệu mẫu; đơn hàng / tài khoản khách lưu `localStorage` của trình duyệt.
- GĐ4: thêm `services/api/*` cùng interface, chọn ở `services/index.ts` khi `NEXT_PUBLIC_DATA_SOURCE=api`. Không sửa component.
- Giá / tồn kho / phí ship **luôn tính lại** (`lib/pricing.ts`, `lib/shipping.ts`) — giỏ hàng chỉ lưu dòng hàng, không lưu giá.

## 3. Thêm một khối CMS

1. Tạo `modules/cms/blocks/<type>/schema.ts`: schema zod (props), `defaults`, `version`, `group`, `label` (khóa i18n `cms.blocks.*`).
2. Tạo component `modules/cms/blocks/<type>/<Name>.tsx` kiểu `BlockComponent<Props>` (server component; phần tương tác tách file `"use client"`).
3. Đăng ký ở `blocks/schemas.ts` (phần dữ liệu — trình soạn GĐ3 dùng) và `blocks/registry.ts` (kèm component).
4. Thêm nhãn vào `messages/vi/cms.json` + `messages/en/cms.json`.
5. Test `blocks/resolve.test.ts` tự kiểm `defaults` hợp lệ; thêm khối vào trang mẫu nếu cần.

Quy tắc: link / ảnh trong props dùng `hrefSchema` / `imageSchema` (chặn `javascript:`); khối dữ liệu động lưu **điều kiện** (vd. `selection`), không lưu dữ liệu chụp sẵn; đổi cấu trúc props → tăng `version` + viết `migrate`.

## 4. Icon & ảnh storefront

- **Icon**: Phosphor (`@phosphor-icons/react`, bản SSR) qua một file duy nhất `modules/shop/components/icons.tsx` — component storefront / khối CMS import từ đây, không import thẳng thư viện. Mặc định `bold` (nút, header, mũi tên); icon minh họa (dải lợi ích, danh mục) truyền `weight="duotone"`; sao đã tô / nút phát mặc định `fill`, sao rỗng `weight="regular"`. Trang quản trị giữ lucide (shadcn). Đổi bộ icon storefront: chỉ sửa file này.
- **Ảnh chụp minh họa**: `client/public/shop/photos/*.webp` (Unsplash, nguồn + tác giả trong `CREDITS.md` cùng thư mục). Ảnh sản phẩm vẫn là SVG tách nền `public/shop/placeholder/` đến khi có ảnh thật.
- Props ảnh của khối (`imageSchema`) có `fit`: `contain` (mặc định — ảnh sản phẩm tách nền, thu vào khung) / `cover` (ảnh chụp phủ kín khung). Thẻ / banner dùng ảnh `cover` tự đổi sang chữ trắng + lớp phủ tối `PHOTO_SCRIM` (`blocks/shared.ts`).
- Carousel storefront: `Carousel` của shadcn + `CarouselArrows` (`components/ui`, icon Phosphor, nhãn theo ngôn ngữ) — không dùng `CarouselPrevious/Next` (icon lucide, nhãn tiếng Anh cứng).

## 5. Chạy & kiểm tra

```bash
cd client
npm run dev                                   # http://localhost:3000 (storefront) · /admin (quản trị) · /dev/ui-kit
npm test                                      # Vitest
npm run build && npx next start -p 3100       # bản production (dữ liệu mock)
E2E_BASE_URL=http://localhost:3100 npm run test:e2e:shop
```

Trang nội bộ: `/dev/ui-kit` (chỉ khi dev), `/dev/cong-thanh-toan` (cổng thanh toán giả lập — chỉ khi `NEXT_PUBLIC_DATA_SOURCE=mock`).

## 6. Bẫy đã gặp

| Lỗi | Quy tắc |
|---|---|
| Span `sr-only` (absolute) trong thẻ nằm trong danh sách cuộn ngang thoát khỏi vùng cuộn → trang tràn ngang trên mobile | Thẻ có nội dung absolute phải `relative`; danh sách `overflow-x-auto` thêm `relative` |
| Bảng lọc render 2 nơi (cột trái + ngăn kéo mobile) trùng `id` → nhãn trỏ sai ô, ô trong ngăn kéo không có tên | Component render nhiều lần nhận `idPrefix` |
| Token shadcn (`--primary`…) tính ở `:root` → ghi đè `--c-*` trong vùng shop không đổi màu nút | Khai báo lại bảng token shadcn trong `[data-site="shop"], .shop-theme` (`styles/shop.css`); nội dung portal (Sheet, Select, Dialog) gắn `shop-theme` + `archivo.variable` |
| Dữ liệu `localStorage` (giỏ, tỉnh, phiên khách) đọc lúc render đầu → lệch hydration | Chỉ dùng sau khi mount (`useMounted`, `useCart`, `useCustomer`) |
| Thẻ sản phẩm bọc cả thẻ trong `<a>` thì không đặt được nút "Thêm vào giỏ" (phần tử tương tác lồng nhau, HTML không hợp lệ) | Link phủ: link nằm trên tên với `after:absolute after:inset-0`, thẻ `relative`; nút riêng đặt `z-10` để nằm trên lớp phủ |
| Node ≥ 25 có `localStorage` toàn cục (rỗng khi thiếu `--localstorage-file`) che `localStorage` của jsdom → test store Zustand persist lỗi `setItem` of undefined | `vitest.config.ts` chạy worker với `--no-experimental-webstorage` |
| Python `Path.write_text` trên Windows ghi CRLF → cả file đổi dòng | Script sửa file dùng `write_bytes(s.encode())` / `newline="
"`; kiểm tra `git diff --stat` trước khi commit |
| Layout gốc gửi mọi namespace i18n (cả quản trị) xuống mọi trang | Layout gốc chỉ gửi namespace storefront + dùng chung; `app/admin/layout.tsx` nạp đủ |

## 7. Hiệu năng (đo 2026-10-19, Lighthouse 12 mobile, bản production, dữ liệu mock)

| Trang | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | 63 | 100 | 100 | 100 |
| `/san-pham/may-chay-bo-dien-x5-gap-gon` | 58 | 100 | 100 | 100 |
| `/` sau nâng cấp landing (2026-10-31, trung vị 3 lần: 54 / 61 / 62) | 61 | 100 | 100 | 100 |

Mục tiêu spec: Performance ≥ 85 — **chưa đạt**. Sau nâng cấp landing, phần tử LCP là ảnh hero (chỉ 43KB, đã `priority`); LCP giả lập ≈ 7,4s vẫn chủ yếu do font + JS bên dưới, carousel sản phẩm (embla) thêm một ít JS cho trang chủ. LCP ≈ 6,4s (mạng 4G chậm giả lập) do:
1. Font Archivo variable (trục `wght` + `wdth`, 3 file ≈ 206KB) — hướng xử lý: tự host bản subset chỉ các độ đậm / độ rộng đang dùng, hoặc chỉ preload subset `vietnamese` + `latin` cho chữ tiêu đề.
2. JS hydrate (TBT 0,55–0,78s) — hướng xử lý: GĐ4 bỏ dữ liệu mock khỏi bundle client (gợi ý tìm kiếm / định giá gọi API), tách thêm phần client của trang sản phẩm.
