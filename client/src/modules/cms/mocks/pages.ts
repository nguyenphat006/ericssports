import type { RichTextBlock, RichTextDoc } from "../richtext/types";
import type { CmsPage } from "../types";

/**
 * Trang CMS MẪU (GĐ2). GĐ3 soạn bằng trình soạn trang; GĐ4 lưu CSDL (draft_blocks / published_blocks).
 * Nội dung chính sách là văn bản mẫu — thay bằng chính sách thật trước khi chạy thật.
 */

const IMG = "/shop/placeholder";
/** Ảnh chụp minh họa (Unsplash — nguồn trong public/shop/photos/CREDITS.md) */
const PHOTO = "/shop/photos";
const PUBLISHED = "2026-10-19T08:00:00+07:00";

const p = (text: string): RichTextBlock => ({ type: "paragraph", content: [{ type: "text", text }] });
const h2 = (text: string): RichTextBlock => ({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] });
const ul = (...items: string[]): RichTextBlock => ({
  type: "bulletList",
  content: items.map((t) => ({ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: t }] }] })),
});
const doc = (...content: RichTextBlock[]): RichTextDoc => ({ type: "doc", content });

function policyPage(id: string, slug: string, title: string, description: string, body: RichTextDoc): CmsPage {
  return {
    id,
    slug,
    title,
    kind: "static",
    seo: { description },
    publishedAt: PUBLISHED,
    blocks: [{ id: `${id}-b1`, type: "rich-text", version: 1, props: { doc: body, width: "narrow" } }],
  };
}

export const MOCK_PAGES: CmsPage[] = [
  {
    id: "page-home",
    slug: "home",
    title: "Ericssports — Thiết bị tập gym chính hãng",
    kind: "home",
    seo: {},
    publishedAt: PUBLISHED,
    blocks: [
      {
        id: "home-hero",
        type: "hero",
        version: 1,
        props: {
          variant: "split",
          slides: [
            {
              eyebrow: "Tập tại nhà",
              title: "Phòng gym trong nhà bạn",
              text: "Máy chạy, xe đạp, tạ và ghế tập chính hãng. Giao và lắp đặt miễn phí nội thành.",
              image: { src: `${PHOTO}/hero-home-gym.webp`, alt: "Góc tập tại nhà với ghế tập và tạ cạnh cửa sổ lớn", fit: "cover" },
              cta: { label: "Khám phá cardio", href: "/danh-muc/cardio" },
              secondaryCta: { label: "Tạ & ghế tập", href: "/danh-muc/tap-ta" },
            },
          ],
        },
      },
      {
        id: "home-usp",
        type: "usp-strip",
        version: 1,
        props: {
          items: [
            { icon: "truck", title: "Giao toàn quốc", text: "Miễn phí nội thành từ 5 triệu", href: "/giao-hang-lap-dat" },
            { icon: "wrench", title: "Lắp đặt tận nhà", text: "Kỹ thuật viên hướng dẫn sử dụng", href: "/giao-hang-lap-dat" },
            { icon: "shield", title: "Bảo hành đến 24 tháng", text: "Chính hãng, có phiếu bảo hành", href: "/chinh-sach-bao-hanh" },
            { icon: "refresh", title: "Đổi trả 7 ngày", text: "Lỗi do nhà sản xuất", href: "/chinh-sach-doi-tra" },
          ],
        },
      },
      {
        id: "home-goals",
        type: "link-card-grid",
        version: 1,
        props: {
          eyebrow: "Theo mục tiêu",
          title: "Bạn muốn tập gì?",
          items: [
            { title: "Giảm cân", text: "Máy chạy, xe đạp, máy elip", href: "/danh-muc/cardio", image: { src: `${PHOTO}/card-weight-loss.webp`, alt: "", fit: "cover" } },
            { title: "Tăng cơ", text: "Tạ, ghế tập, giàn tạ", href: "/danh-muc/tap-ta", image: { src: `${PHOTO}/card-muscle.webp`, alt: "", fit: "cover" } },
            { title: "Dẻo dai", text: "Thảm yoga, phục hồi cơ", href: "/danh-muc/yoga-phuc-hoi", image: { src: `${PHOTO}/card-flexibility.webp`, alt: "", fit: "cover" } },
          ],
        },
      },
      {
        id: "home-products",
        type: "product-grid",
        version: 2,
        props: {
          title: "Sản phẩm nổi bật",
          layout: "carousel",
          viewAllHref: "/tim-kiem",
          tabs: [
            { label: "Bán chạy", selection: { source: "bestseller", limit: 10 } },
            { label: "Mới về", selection: { source: "new", limit: 10 } },
            { label: "Đang giảm giá", selection: { source: "sale", limit: 10 } },
          ],
        },
      },
      { id: "home-categories", type: "category-icons", version: 1, props: { title: "Mua theo danh mục", shape: "circle" } },
      {
        id: "home-banners",
        type: "banner-pair",
        version: 1,
        props: {
          items: [
            {
              eyebrow: "Cardio",
              title: "Máy chạy cho căn hộ",
              text: "Gấp gọn, êm, cất sau khi tập",
              href: "/danh-muc/cardio/may-chay-bo",
              image: { src: `${PHOTO}/banner-cardio.webp`, alt: "", fit: "cover" },
            },
            {
              eyebrow: "Tập tạ",
              title: "Góc tạ tại nhà",
              text: "Tạ đơn, ghế, giàn tạ",
              href: "/danh-muc/tap-ta",
              image: { src: `${PHOTO}/banner-strength.webp`, alt: "", fit: "cover" },
            },
          ],
        },
      },
      {
        id: "home-recovery",
        type: "product-grid",
        version: 2,
        props: {
          eyebrow: "Sau buổi tập",
          title: "Yoga & phục hồi",
          layout: "carousel",
          viewAllHref: "/danh-muc/yoga-phuc-hoi",
          tabs: [{ label: "Tất cả", selection: { source: "category", categoryId: "c-recovery", limit: 10 } }],
        },
      },
      {
        id: "home-story",
        type: "image-text",
        version: 1,
        props: {
          eyebrow: "Bắt đầu nhẹ nhàng",
          title: "20 phút mỗi ngày, ngay tại phòng khách",
          text: "Không cần phòng gym lớn. Một tấm thảm, đôi tạ đơn và bộ dây kháng lực đủ cho bài toàn thân cơ bản.\nChọn dần thiết bị khi bạn tập đều hơn.",
          image: { src: `${PHOTO}/story-pushup.webp`, alt: "Người đàn ông hít đất trên thảm trong phòng khách", fit: "cover" },
          imagePosition: "left",
          cta: { label: "Xem phụ kiện", href: "/danh-muc/phu-kien" },
        },
      },
      {
        id: "home-testimonials",
        type: "testimonials",
        version: 1,
        props: {
          eyebrow: "Khách hàng",
          title: "Họ đã tập tại nhà",
          items: [
            { quote: "Giao nhanh, kỹ thuật viên lắp máy chạy cẩn thận và hướng dẫn rất kỹ.", author: "Anh Minh", meta: "Quận 7, TP. Hồ Chí Minh", rating: 5 },
            { quote: "Tạ và ghế chắc chắn, đóng gói kỹ. Phòng tập nhỏ ở nhà giờ đủ bài cơ bản.", author: "Chị Lan", meta: "Cầu Giấy, Hà Nội", rating: 5 },
            { quote: "Tư vấn đúng nhu cầu, không ép mua máy đắt. Sẽ quay lại mua thêm phụ kiện.", author: "Anh Khoa", meta: "Biên Hòa, Đồng Nai", rating: 4 },
          ],
        },
      },
      {
        id: "home-brands",
        type: "logo-strip",
        version: 1,
        props: {
          title: "Thương hiệu",
          items: [{ name: "ES Cardio" }, { name: "ES Strength" }, { name: "ES Recovery" }, { name: "ES Pro" }, { name: "ES Home" }, { name: "ES Gear" }],
        },
      },
    ],
  },
  {
    id: "page-sale",
    slug: "khuyen-mai",
    title: "Khuyến mãi mùa tập mới",
    kind: "landing",
    seo: { description: "Ưu đãi máy chạy bộ, xe đạp tập, tạ và phụ kiện gym — số lượng có hạn." },
    publishedAt: PUBLISHED,
    blocks: [
      {
        id: "sale-hero",
        type: "hero",
        version: 1,
        props: {
          variant: "full-image",
          slides: [
            {
              eyebrow: "Đến hết 31/12",
              title: "Mùa tập mới giảm đến 25%",
              text: "Ưu đãi cho máy chạy, xe đạp tập, tạ và phụ kiện. Số lượng có hạn.",
              image: { src: `${IMG}/treadmill.svg`, alt: "" },
              cta: { label: "Xem sản phẩm giảm giá", href: "#sale-grid" },
            },
          ],
        },
      },
      {
        id: "sale-grid",
        type: "product-grid",
        version: 1,
        props: { eyebrow: "Ưu đãi", title: "Đang giảm giá", tabs: [{ label: "Tất cả", selection: { source: "sale", limit: 12 } }] },
      },
      {
        id: "sale-banners",
        type: "banner-pair",
        version: 1,
        props: {
          items: [
            { eyebrow: "Cardio", title: "Máy chạy gấp gọn", text: "Hợp căn hộ, cất gọn sau khi tập", href: "/danh-muc/cardio/may-chay-bo", tone: "ink", image: { src: `${IMG}/treadmill.svg`, alt: "" } },
            { eyebrow: "Tập tạ", title: "Bộ tạ tại nhà", text: "Tạ đơn, ghế, giàn tạ", href: "/danh-muc/tap-ta", tone: "soft", image: { src: `${IMG}/dumbbell.svg`, alt: "" } },
          ],
        },
      },
      {
        id: "sale-faq",
        type: "faq",
        version: 1,
        props: {
          title: "Câu hỏi thường gặp",
          items: [
            { question: "Giá khuyến mãi áp dụng đến khi nào?", answer: "Đến hết ngày 31/12 hoặc khi hết số lượng ưu đãi, tùy điều kiện nào đến trước." },
            { question: "Sản phẩm khuyến mãi có được lắp đặt miễn phí không?", answer: "Có. Đơn nội thành Hà Nội và TP. Hồ Chí Minh được lắp đặt miễn phí với máy chạy, xe đạp và giàn tạ." },
            { question: "Có được đổi trả hàng khuyến mãi không?", answer: "Được đổi trong 7 ngày nếu sản phẩm lỗi do nhà sản xuất, theo chính sách đổi trả." },
          ],
        },
      },
      {
        id: "sale-cta",
        type: "cta-banner",
        version: 1,
        props: { title: "Cần tư vấn chọn máy?", text: "Gọi hotline để được tư vấn theo diện tích và mục tiêu tập.", cta: { label: "Xem chính sách giao hàng", href: "/giao-hang-lap-dat" }, tone: "primary" },
      },
    ],
  },
  policyPage(
    "page-warranty",
    "chinh-sach-bao-hanh",
    "Chính sách bảo hành",
    "Thời hạn, điều kiện và quy trình bảo hành sản phẩm tại Ericssports.",
    doc(
      p("Sản phẩm mua tại Ericssports được bảo hành chính hãng theo thời hạn ghi trên phiếu bảo hành và trang sản phẩm."),
      h2("Thời hạn bảo hành"),
      ul("Máy chạy bộ, xe đạp tập, máy elip: động cơ và khung 24 tháng, linh kiện điện tử 12 tháng.", "Ghế tập, giàn tạ: khung 24 tháng.", "Tạ, thảm và phụ kiện: 6 tháng với lỗi do nhà sản xuất."),
      h2("Điều kiện bảo hành"),
      ul("Sản phẩm còn trong thời hạn và có mã đơn hàng hoặc phiếu bảo hành.", "Lỗi phát sinh do nhà sản xuất, không do va đập, ngấm nước hoặc tự ý sửa chữa."),
      h2("Quy trình"),
      p("Liên hệ hotline hoặc gửi yêu cầu kèm mã đơn hàng. Kỹ thuật viên sẽ hẹn lịch kiểm tra tại nhà với sản phẩm cồng kềnh."),
    ),
  ),
  policyPage(
    "page-return",
    "chinh-sach-doi-tra",
    "Chính sách đổi trả",
    "Điều kiện và thời hạn đổi trả sản phẩm.",
    doc(
      p("Ericssports hỗ trợ đổi sản phẩm trong 7 ngày kể từ ngày nhận hàng nếu sản phẩm lỗi do nhà sản xuất hoặc giao sai mẫu."),
      h2("Điều kiện đổi trả"),
      ul("Sản phẩm còn đủ phụ kiện, hộp và quà tặng kèm (nếu có).", "Không áp dụng với sản phẩm đã lắp đặt cố định theo yêu cầu riêng."),
      h2("Chi phí"),
      p("Ericssports chịu toàn bộ chi phí vận chuyển khi lỗi do nhà sản xuất hoặc giao sai mẫu."),
    ),
  ),
  policyPage(
    "page-shipping",
    "giao-hang-lap-dat",
    "Giao hàng & lắp đặt",
    "Phí giao hàng, thời gian giao và dịch vụ lắp đặt tận nhà.",
    doc(
      p("Phí giao hàng tính theo khu vực và khối lượng đơn hàng, hiển thị rõ ở bước thanh toán trước khi đặt hàng."),
      h2("Thời gian giao hàng"),
      ul("Nội thành Hà Nội và TP. Hồ Chí Minh: 1–2 ngày (có giao nhanh trong ngày).", "Tỉnh lân cận: 2–4 ngày.", "Các tỉnh khác: 3–7 ngày."),
      h2("Miễn phí giao hàng"),
      p("Đơn từ 5.000.000₫ được miễn phí giao hàng tại nội thành và tỉnh lân cận. Hàng cồng kềnh có phụ phí riêng ngoài nội thành."),
      h2("Lắp đặt"),
      p("Máy chạy, xe đạp, máy elip, ghế và giàn tạ có dịch vụ lắp đặt tận nơi; chọn dịch vụ ngay ở trang sản phẩm."),
    ),
  ),
  policyPage(
    "page-privacy",
    "bao-mat-thong-tin",
    "Bảo mật thông tin",
    "Cách Ericssports thu thập, sử dụng và bảo vệ thông tin khách hàng.",
    doc(
      p("Ericssports chỉ thu thập thông tin cần thiết để xử lý đơn hàng: họ tên, số điện thoại, email và địa chỉ giao hàng."),
      h2("Sử dụng thông tin"),
      ul("Xác nhận và giao đơn hàng, hỗ trợ bảo hành.", "Gửi thông báo về đơn hàng. Chỉ gửi tin khuyến mãi khi khách đồng ý."),
      h2("Thanh toán"),
      p("Thông tin thẻ được xử lý trực tiếp bởi cổng thanh toán; Ericssports không lưu số thẻ của khách hàng."),
    ),
  ),
];
