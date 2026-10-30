# Nâng cấp UI trang landing (trang chủ): kế hoạch triển khai

**Ngày lập**: 2026-10-30
**Nền**: nhánh `feat/gd2-storefront-mock` (GĐ2 đã xong). Đề xuất nhánh mới: `feat/landing-ui-upgrade`.
**Đầu vào**:
- Phân tích UI/UX Decathlon VN (chỉ học nguyên tắc, **không** dùng logo / màu / ảnh / mã nguồn của họ).
- Bộ icon **B: Phosphor (Bold + Duotone)**.
- Bộ 12 ảnh Unsplash đã xem trong trang so sánh `icons-photos-v2.html`.

**Trạng thái**: Đã duyệt 2026-10-30 — Q1-A, Q2-A, Q3-A

---

## 0. Mục tiêu & phạm vi

Trang chủ `/` nhìn như một cửa hàng thật, không có cảm giác "AI làm":
1. Dùng ảnh thật cho hero, thẻ "Bạn muốn tập gì?", banner và danh mục.
2. Thẻ sản phẩm giúp quyết định mua nhanh: giá đặt trước tên, số đã bán, chấm màu, nút thêm giỏ nhanh.
3. Hàng sản phẩm dạng carousel, có link "Xem tất cả".
4. Bộ icon đồng bộ, có cá tính (Phosphor) cho toàn bộ storefront.
5. Giữ nguyên bản sắc Ember / Archivo, mỗi khối có `h2`, Accessibility 100.

**Ngoài phạm vi** (để đợt sau):
- Trang sản phẩm: gallery lưới 2 cột, khối lợi ích có icon, % khách giới thiệu, thanh mua cố định trên điện thoại.
- Trang danh mục: ô banner xen giữa lưới.
- Thẻ mã giảm giá có nút sao chép: chưa có hệ thống mã giảm giá (spec xếp vào GĐ7).
- Đếm ngược, widget nổi, thanh tải app.
- Trình soạn CMS (GĐ3) và backend (GĐ4).

**DBML**: không đổi. Các trường mới của `ProductSummary` là dữ liệu suy ra từ biến thể / tồn kho sẵn có, chỉ thêm ở kiểu dữ liệu frontend và mock.

---

## 1. Quyết định cần user xác nhận

### Q1: Lưu ảnh ở đâu? Khuyến nghị **A**
- **A. Tải 12 ảnh về `client/public/shop/photos/`** dạng WebP: ảnh hero rộng 1600px, ảnh thẻ / banner rộng 1000px. Kèm file `CREDITS.md` ghi tác giả và link gốc (giấy phép Unsplash cho dùng miễn phí, không bắt buộc ghi công).
  - ✅ Không phụ thuộc CDN bên ngoài, `next/image` tối ưu được, chạy offline / CI ổn định.
  - ⚠️ Repo nặng thêm khoảng 2–3MB.
- **B. Dùng link `images.unsplash.com`** và khai báo `remotePatterns`: repo nhẹ hơn nhưng phụ thuộc mạng; E2E và Lighthouse dễ dao động.

### Q2: Nút thêm giỏ nhanh trên thẻ. Khuyến nghị **A**
- **A. Sản phẩm 1 biến thể** → bấm là thêm vào giỏ, hiện toast và mở ngăn kéo giỏ. **Sản phẩm nhiều biến thể** → nút "Chọn phân loại" dẫn tới trang sản phẩm. **Hết hàng** → nút bị vô hiệu kèm chữ "Hết hàng".
- **B. Mở hộp thoại chọn nhanh biến thể ngay trên thẻ**: tiện hơn nhưng nặng JS và nhiều trạng thái; để sau.

### Q3: Hàng sản phẩm trên trang chủ. Khuyến nghị **A**
- **A. Khối `product-grid` có thêm `layout: "grid" | "carousel"`** (mặc định `grid`, có migrate v1→v2). Trang chủ dùng carousel; điện thoại vuốt với thẻ hiện khoảng 2,2 cái; máy tính có nút trước/sau. Dùng `embla` đã có sẵn.
- **B. Giữ lưới như hiện tại**, chỉ đổi thẻ.

---

## 2. Các mốc triển khai

### M1: Ảnh thật
- Tải 12 ảnh (`?w=…&fm=webp&q=75`), đặt tên theo nội dung. Ví dụ: `hero-home-gym.webp`, `card-weight-loss.webp`, `card-muscle.webp`, `card-flexibility.webp`, `banner-cardio.webp`, `banner-strength.webp`, `banner-accessories.webp`, `cat-yoga.webp`, `story-pushup.webp`, …
- `public/shop/photos/CREDITS.md`: tác giả, link Unsplash, ngày tải.
- Bảng phân bổ ảnh:

| Vị trí | Ảnh |
|---|---|
| Hero trang chủ | home gym, ghế gỗ, cửa sổ lớn (Aalo Lens) |
| Thẻ "Giảm cân" / "Tăng cơ" / "Dẻo dai" | chạy máy (Mike Cox) / tạ đòn (Alexander Jawfox) / yoga tại nhà (Vitaly Gariev) |
| Banner đôi Cardio / Tập tạ | máy chạy phòng khách (Intenza) / đòn tạ trên giá (Jelmer Assink) |
| Banner phụ kiện | tạ + dây kháng lực (Kelly Sikkema) |
| Danh mục Yoga | thảm + gạch yoga (Samantha Sheppard) |
| Ảnh + chữ / đánh giá | hít đất phòng khách (Rahul Gupta) |
| Dự phòng | gym nhìn ra thành phố, phòng tập thiết bị, nam chạy máy |

- Ảnh sản phẩm **giữ SVG tách nền** như hiện tại: ảnh sản phẩm thật sẽ có khi nhập hàng.

### M2: Bộ icon Phosphor
- Cài `@phosphor-icons/react`. Server component import từ `@phosphor-icons/react/ssr`; client component import từ `@phosphor-icons/react`.
- Chỉ áp dụng cho **storefront** (`modules/shop`, `modules/cms/blocks`). Trang quản trị giữ lucide (shadcn dùng lucide).
- Quy ước: icon giao diện (header, nút, mũi tên) dùng `weight="bold"`; icon minh họa (dải lợi ích, danh mục) dùng `weight="duotone"` với màu `--shop-primary`. Ghi quy ước vào `docs/STOREFRONT.md`.
- Thay icon ở: `UspStrip`, `BannerPair`, `LinkCardGrid`, `ProductGrid`, `Faq`, `Testimonials`, `VideoPlayer`, `ShopHeader`, `ShopFooter`, `SearchBox`, giỏ hàng. Enum `USP_ICONS` giữ nguyên tên nên dữ liệu CMS không đổi, chỉ đổi bảng ánh xạ sang Phosphor.

### M3: Thẻ sản phẩm v2 (`ProductCard.tsx`)
- Thứ tự mới: ảnh (nhãn góc) → chấm màu → **giá + giá gạch + viên %** → tên (2 dòng) → thương hiệu chữ hoa xám → sao · "Đã bán 1,2k+" → nút thêm giỏ.
- Nhãn góc ảnh: `-20%` (sale), `Mới`, `Bán chạy`. Mỗi thẻ tối đa 2 nhãn.
- Bỏ dòng thông số chính khỏi thẻ để thẻ gọn hơn, giống cách sàn bán lẻ trình bày. (Dòng này vẫn hiện ở trang so sánh / trang sản phẩm.)
- `ProductSummary` thêm 2 trường không bắt buộc:
  - `swatches?: { label: string; color: string }[]`: tối đa 4 chấm, dư thì hiện "+n".
  - `quickAddVariantId?: string | null`: chỉ có giá trị khi sản phẩm có đúng 1 biến thể.
  - Mock suy ra từ dữ liệu biến thể hiện có.
- Nút thêm giỏ hoạt động theo Q2. Nút là `button` riêng, **không lồng trong `<Link>`**. Thẻ đổi cấu trúc thành `article` với link phủ toàn thẻ (`after:absolute inset-0`), còn nút nằm trên lớp phủ.
- Hiển thị: điện thoại luôn thấy nút dạng icon tròn; máy tính nút hiện rõ khi hover nhưng vẫn focus được bằng bàn phím.
- Cập nhật `ProductCard.test.tsx`: thứ tự giá/tên, chấm màu "+n", 3 trạng thái nút.

### M4: Khối `product-grid` v2
- Schema `version: 2`, thêm `layout` theo Q3. `migrate(v1) → { ...v1, layout: "grid" }`.
- Carousel: tiêu đề `h2` + "Xem tất cả →" + nút trước/sau (máy tính); vẫn giữ tab Bán chạy / Mới về / Đang giảm.
- Danh sách cuộn ngang có `relative` (xem bẫy đã gặp trong `STOREFRONT.md`).

### M5: Khối `usp-strip` và `category-icons`
- `usp-strip`: mỗi mục thêm `href?` không bắt buộc ("Xem chi tiết" dẫn tới trang chính sách). Đây là trường tùy chọn nên không cần migrate. Icon duotone trong ô tròn nền `--shop-accent-soft`.
- `category-icons` thêm `shape: "square" | "circle"` (mặc định `square`, trường tùy chọn). Kiểu `circle` là ảnh chụp tròn, cắt theo `object-cover`. Ảnh danh mục mock lấy từ `Category.image` (thêm cho các danh mục gốc), không có thì dùng SVG như cũ.

### M6: Bố cục trang chủ mới (`cms/mocks/pages.ts`)
Thứ tự (vẫn là bố cục B, thêm 2 khối ảnh):
1. **Hero split**: ảnh thật, tiêu đề, 2 nút.
2. **Dải lợi ích** (4 mục, có link).
3. **"Bạn muốn tập gì?"**: 3 thẻ ảnh thật, chữ đè trên lớp phủ tối đạt AA.
4. **Hàng sản phẩm carousel**: tab Bán chạy / Mới về / Đang giảm giá.
5. **Danh mục vòng tròn**.
6. **Banner đôi** Cardio / Tập tạ, ảnh thật.
7. **Hàng sản phẩm carousel** "Phụ kiện tập tại nhà".
8. **Ảnh + chữ**: câu chuyện "Tập tại nhà 20 phút mỗi ngày" kèm nút xem danh mục.
9. **Thương hiệu** (logo-strip), **Đánh giá khách** (testimonials).

- Khi ảnh là ảnh chụp, `LinkCardGrid` / `BannerPair` / `Hero` cần `object-cover` thay cho `object-contain`. Thêm `imageFit?: "contain" | "cover"` vào `imageSchema` (mặc định `contain` để dữ liệu cũ không đổi).
- Ảnh hero: `priority` + `sizes` chuẩn để không làm tệ LCP.

### M7: Kiểm tra & tài liệu
- `npx tsc --noEmit`, `npm run lint -- --max-warnings=0`, `npm run build`: 0 lỗi, 0 cảnh báo.
- `npm test`: cập nhật test thẻ, test `resolve.test.ts` (migrate product-grid v1→v2).
- `npm run test:e2e:shop`: luồng mua hàng có thêm bước "thêm giỏ nhanh từ trang chủ".
- Kiểm tra bằng mắt trên máy tính và điện thoại (375px): không tràn ngang, ảnh không méo.
- Lighthouse mobile `/`: Accessibility / SEO / Best Practices giữ 100; Performance không thấp hơn mức hiện tại (63).
- Cập nhật `docs/STOREFRONT.md`: quy ước icon, nơi để ảnh và giấy phép, bẫy mới nếu gặp. Cập nhật song song `.claude/rules` và `.agents/rules` nếu có quy ước mới.

---

## 3. Rủi ro

| Rủi ro | Cách xử lý |
|---|---|
| Ảnh chụp làm chậm LCP | WebP, đúng `sizes`, chỉ ảnh hero có `priority`, ảnh dưới màn hình đầu lazy |
| Chữ đè trên ảnh không đủ tương phản | Lớp phủ gradient tối, kiểm bằng Lighthouse / axe |
| Nút trong thẻ link gây lỗi HTML lồng tương tác | Dùng link phủ (stretched link) thay vì bọc cả thẻ trong `<Link>` |
| Phosphor tăng bundle | Import theo tên từng icon (tree-shake), dùng bản `/ssr` cho server component |
