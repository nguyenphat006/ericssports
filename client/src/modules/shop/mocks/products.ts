import type { RichTextDoc } from "@/modules/cms/richtext/types";
import type { AttributeValue, Product, ProductBadge, ProductService, ProductSummary, VariantAxis } from "../types";
import { MOCK_BRANDS, MOCK_CATEGORIES } from "./taxonomy";

/**
 * Sản phẩm MẪU (GĐ1–3, chưa có backend). Thương hiệu "ES …" giả lập, ảnh placeholder trung tính.
 * Khai báo gọn bằng `def()`; biến thể sinh từ tích các trục, giá = giá gốc + chênh lệch từng lựa chọn.
 */

type Placeholder = "treadmill" | "bike" | "elliptical" | "dumbbell" | "barbell" | "plate" | "bench" | "rack" | "mat" | "massage" | "band";

interface AxisDef {
  id: string;
  name: string;
  values: { value: string; label: string; delta?: number; swatch?: string }[];
}

interface ProductDef {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: Placeholder;
  price: number;
  compareAt?: number;
  axes?: AxisDef[];
  /** Tồn kho theo thứ tự biến thể (thiếu -> 12) */
  stock?: number[];
  weightKg: number;
  /** Trục khối lượng "Nkg": cộng N × hệ số vào khối lượng giao (2 = bán theo cặp) */
  kgMultiplier?: number;
  bulky?: boolean;
  keySpecs: [string, string][];
  specs: Record<string, [string, string][]>;
  attrs: Record<string, AttributeValue>;
  services?: ("install" | "warranty")[];
  badges?: ProductBadge[];
  rating?: number;
  reviews?: number;
  sold?: number;
  created: string;
  short: string;
  highlights: string[];
  together?: string[];
}

const SERVICES: Record<"install" | "warranty", ProductService> = {
  install: { id: "install", name: "Lắp đặt tận nơi", description: "Kỹ thuật viên lắp đặt và hướng dẫn sử dụng tại nhà.", price: 200_000 },
  warranty: { id: "warranty", name: "Gia hạn bảo hành +12 tháng", description: "Bảo hành mở rộng cho động cơ và khung.", price: 590_000 },
};

const COLOR_RED_BLACK = { value: "den-do", label: "Đen đỏ", swatch: "#2A2522" };
const COLOR_SILVER = { value: "xam-bac", label: "Xám bạc", swatch: "#B9B4AD" };

function toSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function description(def: ProductDef): RichTextDoc {
  return {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: def.short }] },
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Điểm nổi bật" }] },
      {
        type: "bulletList",
        content: def.highlights.map((h) => ({ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: h }] }] })),
      },
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Phù hợp với ai?" }] },
      {
        type: "paragraph",
        content: [
          { type: "text", text: `${def.name} phù hợp cho người tập tại nhà muốn duy trì thói quen vận động đều đặn. ` },
          { type: "text", text: "Ericssports giao hàng và hướng dẫn sử dụng tận nơi.", marks: [{ type: "bold" }] },
        ],
      },
    ],
  };
}

function cartesian(axes: AxisDef[]): AxisDef["values"][] {
  return axes.reduce<AxisDef["values"][]>((acc, axis) => acc.flatMap((combo) => axis.values.map((v) => [...combo, v])), [[]]);
}

/** Khối lượng đọc từ lựa chọn dạng "20kg" (trục khối lượng tạ), không có -> 0 */
function axisKg(combo: AxisDef["values"]): number {
  const kg = combo.find((v) => /^\d+kg$/.test(v.value));
  return kg ? Number(kg.value.slice(0, -2)) : 0;
}

function build(def: ProductDef): Product {
  const slug = toSlug(def.name);
  const brand = MOCK_BRANDS.find((b) => b.id === def.brand)!;
  const category = MOCK_CATEGORIES.find((cat) => cat.id === def.category)!;
  const axes = def.axes ?? [];
  const img = `/shop/placeholder/${def.image}.svg`;
  const variants = cartesian(axes).map((combo, i) => {
    const delta = combo.reduce((sum, v) => sum + (v.delta ?? 0), 0);
    const suffix = combo.map((v) => v.value.toUpperCase()).join("-");
    return {
      id: `${def.id}-v${i + 1}`,
      sku: [def.id.toUpperCase(), suffix].filter(Boolean).join("-"),
      options: Object.fromEntries(combo.map((v, k) => [axes[k].id, v.value])),
      price: def.price + delta,
      compareAtPrice: def.compareAt ? def.compareAt + delta : null,
      stock: def.stock?.[i] ?? 12,
      weightKg: def.weightKg + axisKg(combo) * (def.kgMultiplier ?? 1),
      mediaIndex: 0,
    };
  });
  const variantAxes: VariantAxis[] = axes.map((a) => ({ id: a.id, name: a.name, values: a.values.map(({ value, label, swatch }) => ({ value, label, swatch })) }));

  return {
    id: def.id,
    slug,
    name: def.name,
    brand,
    primaryCategoryId: category.id,
    categoryIds: [category.id, ...(category.parentId ? [category.parentId] : [])],
    shortDescription: def.short,
    media: [
      { kind: "image", src: img, alt: def.name },
      { kind: "image", src: img, alt: `${def.name} — góc nghiêng` },
      { kind: "image", src: img, alt: `${def.name} — chi tiết` },
    ],
    variantAxes,
    variants,
    keySpecs: def.keySpecs.map(([label, value]) => ({ label, value })),
    specGroups: Object.entries(def.specs).map(([name, items]) => ({ name, items: items.map(([label, value]) => ({ label, value })) })),
    services: (def.services ?? []).map((s) => SERVICES[s]),
    description: description(def),
    attributes: def.attrs,
    documents: def.services?.includes("install") ? [{ name: "Hướng dẫn lắp đặt (PDF)", url: "#" }] : [],
    badges: def.badges ?? [],
    rating: def.rating ?? null,
    reviewCount: def.reviews ?? 0,
    soldCount: def.sold ?? 0,
    bulky: def.bulky ?? false,
    relatedIds: [],
    boughtTogetherIds: def.together ?? [],
    createdAt: def.created,
  };
}

const TREADMILL_SPECS = (dims: string, folded: string, mass: string, belt: string): Record<string, [string, string][]> => ({
  "Kích thước & khối lượng": [
    ["Kích thước sử dụng", dims],
    ["Kích thước khi gấp", folded],
    ["Khối lượng máy", mass],
  ],
  "Vận hành": [
    ["Băng tải", belt],
    ["Nguồn điện", "220V / 50Hz"],
  ],
});

const DEFS: ProductDef[] = [
  // ── Máy chạy bộ ───────────────────────────────────────────
  {
    id: "tm-x5", name: "Máy chạy bộ điện X5 gấp gọn", brand: "b-cardio", category: "c-treadmills", image: "treadmill",
    price: 12_990_000, compareAt: 15_290_000, weightKg: 82, bulky: true,
    axes: [{ id: "color", name: "Màu sắc", values: [COLOR_RED_BLACK, COLOR_SILVER] }, { id: "version", name: "Phiên bản", values: [{ value: "x5", label: "X5 – 3.0HP" }, { value: "x5-pro", label: "X5 Pro – 3.5HP, nâng dốc điện", delta: 3_000_000 }] }],
    stock: [8, 5, 3, 0],
    keySpecs: [["Động cơ", "3.0HP"], ["Tải tối đa", "120kg"], ["Tốc độ", "1–16 km/h"], ["Gấp gọn", "Có"]],
    specs: TREADMILL_SPECS("1.720 × 760 × 1.380 mm", "980 × 760 × 1.450 mm", "78 kg", "1.350 × 480 mm"),
    attrs: { "a-power": 3, "a-load": 120, "a-foldable": true, "a-incline": false, "a-bluetooth": true },
    services: ["install", "warranty"], badges: ["bestseller"], rating: 4.8, reviews: 126, sold: 1200, created: "2026-03-02",
    short: "Máy chạy bộ gấp gọn cho căn hộ, động cơ 3.0HP êm, băng tải rộng 48cm.",
    highlights: ["Gấp gọn bằng piston thủy lực, đẩy di chuyển dễ dàng", "12 chương trình tập cài sẵn, kết nối ứng dụng qua Bluetooth", "Giảm chấn 8 điểm bảo vệ khớp gối"],
    together: ["ac-oil", "mat-floor", "ac-hr"],
  },
  {
    id: "tm-x7", name: "Máy chạy bộ X7 Pro nâng dốc điện 15 cấp", brand: "b-pro", category: "c-treadmills", image: "treadmill",
    price: 24_900_000, weightKg: 118, bulky: true, stock: [4],
    keySpecs: [["Động cơ", "4.0HP"], ["Tải tối đa", "150kg"], ["Độ dốc", "0–15%"], ["Gấp gọn", "Không"]],
    specs: TREADMILL_SPECS("1.950 × 850 × 1.480 mm", "Không gấp", "112 kg", "1.500 × 560 mm"),
    attrs: { "a-power": 4, "a-load": 150, "a-foldable": false, "a-incline": true, "a-bluetooth": true },
    services: ["install", "warranty"], rating: 5, reviews: 19, sold: 95, created: "2026-06-12",
    short: "Máy chạy bán chuyên nghiệp, nâng dốc điện 15 cấp, băng tải 56cm cho người chạy cự ly dài.",
    highlights: ["Động cơ AC 4.0HP chạy liên tục nhiều giờ", "Màn hình cảm ứng 10 inch", "Băng tải dày 2.5mm, sàn chạy gỗ ép chống ồn"],
    together: ["ac-oil", "mat-floor"],
  },
  {
    id: "tm-walk", name: "Máy đi bộ mini W1 siêu mỏng", brand: "b-home", category: "c-treadmills", image: "treadmill",
    price: 5_490_000, compareAt: 6_290_000, weightKg: 28, bulky: false,
    axes: [{ id: "color", name: "Màu sắc", values: [{ value: "den", label: "Đen", swatch: "#1C1917" }, { value: "trang", label: "Trắng", swatch: "#F4F1EC" }] }],
    keySpecs: [["Động cơ", "1.5HP"], ["Tải tối đa", "100kg"], ["Tốc độ", "1–6 km/h"], ["Gấp gọn", "Có"]],
    specs: TREADMILL_SPECS("1.400 × 560 × 130 mm", "Cất gầm giường", "26 kg", "1.150 × 420 mm"),
    attrs: { "a-power": 1.5, "a-load": 100, "a-foldable": true, "a-incline": false, "a-bluetooth": false },
    services: ["warranty"], badges: ["new"], rating: 4.6, reviews: 211, sold: 2300, created: "2026-09-20",
    short: "Máy đi bộ mỏng 13cm, cất gọn gầm giường, điều khiển từ xa.",
    highlights: ["Dày chỉ 13cm, đặt gầm sofa, gầm giường", "Vận hành êm dưới 50dB", "Điều khiển từ xa và hiển thị LED"],
  },
  {
    id: "tm-x3", name: "Máy chạy bộ điện X3 đa năng", brand: "b-cardio", category: "c-treadmills", image: "treadmill",
    price: 8_990_000, weightKg: 68, bulky: true, stock: [0],
    keySpecs: [["Động cơ", "2.5HP"], ["Tải tối đa", "110kg"], ["Tốc độ", "1–14 km/h"], ["Gấp gọn", "Có"]],
    specs: TREADMILL_SPECS("1.600 × 720 × 1.300 mm", "900 × 720 × 1.400 mm", "64 kg", "1.250 × 430 mm"),
    attrs: { "a-power": 2.5, "a-load": 110, "a-foldable": true, "a-incline": false, "a-bluetooth": false },
    services: ["install", "warranty"], rating: 4.5, reviews: 74, sold: 860, created: "2025-11-15",
    short: "Máy chạy đa năng tích hợp đai massage, gập bụng và thanh vặn eo.",
    highlights: ["Tích hợp đai massage và gập bụng", "Nâng dốc cơ 3 mức", "Khung thép sơn tĩnh điện"],
  },
  // ── Xe đạp tập ────────────────────────────────────────────
  {
    id: "bk-c3", name: "Xe đạp tập từ tính C3 kết nối ứng dụng", brand: "b-cardio", category: "c-bikes", image: "bike",
    price: 4_290_000, weightKg: 38, bulky: false,
    keySpecs: [["Kháng lực", "32 cấp"], ["Bánh đà", "8kg"], ["Tải tối đa", "130kg"], ["Bluetooth", "Có"]],
    specs: { "Thông số": [["Kích thước", "1.050 × 520 × 1.420 mm"], ["Khối lượng", "34 kg"], ["Kiểu kháng lực", "Từ tính"]] },
    attrs: { "a-resistance": ["tu-tinh"], "a-load": 130, "a-foldable": false, "a-bluetooth": true },
    services: ["install"], badges: ["new"], rating: 4.6, reviews: 54, sold: 410, created: "2026-08-05",
    short: "Xe đạp tập từ tính 32 cấp, kết nối ứng dụng theo dõi buổi tập.",
    highlights: ["Kháng lực từ tính êm, không mài mòn", "Yên và ghi đông chỉnh 4 hướng", "Giá đỡ máy tính bảng"],
    together: ["ac-hr", "mat-floor"],
  },
  {
    id: "bk-spin", name: "Xe đạp spin S9 bánh đà 18kg", brand: "b-pro", category: "c-bikes", image: "bike",
    price: 7_890_000, compareAt: 8_990_000, weightKg: 58, bulky: true,
    keySpecs: [["Kháng lực", "Phanh nỉ vô cấp"], ["Bánh đà", "18kg"], ["Tải tối đa", "150kg"], ["Bluetooth", "Không"]],
    specs: { "Thông số": [["Kích thước", "1.200 × 560 × 1.150 mm"], ["Khối lượng", "54 kg"], ["Kiểu kháng lực", "Cơ học"]] },
    attrs: { "a-resistance": ["co"], "a-load": 150, "a-foldable": false, "a-bluetooth": false },
    services: ["install", "warranty"], rating: 4.7, reviews: 38, sold: 220, created: "2026-02-18",
    short: "Xe đạp spin bánh đà 18kg cho bài đạp cường độ cao.",
    highlights: ["Bánh đà 18kg chạy đầm", "Khung thép dày chịu tải 150kg", "Bàn đạp có quai giữ chân"],
  },
  {
    id: "bk-fold", name: "Xe đạp tập gấp gọn F1", brand: "b-home", category: "c-bikes", image: "bike",
    price: 2_190_000, weightKg: 20,
    axes: [{ id: "color", name: "Màu sắc", values: [{ value: "den", label: "Đen", swatch: "#1C1917" }, { value: "trang", label: "Trắng", swatch: "#F4F1EC" }] }],
    keySpecs: [["Kháng lực", "8 cấp"], ["Bánh đà", "2.5kg"], ["Tải tối đa", "100kg"], ["Gấp gọn", "Có"]],
    specs: { "Thông số": [["Kích thước", "800 × 450 × 1.100 mm"], ["Khối lượng", "17 kg"], ["Kiểu kháng lực", "Từ tính"]] },
    attrs: { "a-resistance": ["tu-tinh"], "a-load": 100, "a-foldable": true, "a-bluetooth": false },
    rating: 4.4, reviews: 302, sold: 4100, created: "2025-12-01",
    short: "Xe đạp tập gấp chữ X, gọn nhẹ cho không gian nhỏ.",
    highlights: ["Gấp chữ X gọn trong 10 giây", "Có tựa lưng", "Dây kháng lực tập tay đi kèm"],
  },
  {
    id: "bk-air", name: "Xe đạp kháng gió Air A2", brand: "b-pro", category: "c-bikes", image: "bike",
    price: 14_500_000, weightKg: 62, bulky: true, stock: [2],
    keySpecs: [["Kháng lực", "Kháng gió"], ["Bánh đà", "Quạt gió"], ["Tải tối đa", "150kg"], ["Bluetooth", "Có"]],
    specs: { "Thông số": [["Kích thước", "1.300 × 650 × 1.300 mm"], ["Khối lượng", "58 kg"], ["Kiểu kháng lực", "Kháng gió"]] },
    attrs: { "a-resistance": ["gio"], "a-load": 150, "a-foldable": false, "a-bluetooth": true },
    services: ["install", "warranty"], rating: 4.9, reviews: 12, sold: 40, created: "2026-07-22",
    short: "Xe đạp kháng gió tập toàn thân cho bài HIIT.",
    highlights: ["Kháng lực tăng theo tốc độ đạp", "Tập đồng thời tay và chân", "Màn hình theo dõi calo, công suất"],
  },
  // ── Elip ──────────────────────────────────────────────────
  {
    id: "el-e5", name: "Máy tập elip E5 điện từ", brand: "b-cardio", category: "c-ellipticals", image: "elliptical",
    price: 11_490_000, compareAt: 12_990_000, weightKg: 72, bulky: true,
    keySpecs: [["Kháng lực", "24 cấp điện từ"], ["Sải bước", "45cm"], ["Tải tối đa", "130kg"], ["Bluetooth", "Có"]],
    specs: { "Thông số": [["Kích thước", "1.600 × 640 × 1.580 mm"], ["Khối lượng", "68 kg"], ["Kiểu kháng lực", "Điện từ"]] },
    attrs: { "a-resistance": ["dien-tu"], "a-load": 130, "a-bluetooth": true },
    services: ["install", "warranty"], rating: 4.7, reviews: 41, sold: 180, created: "2026-05-10",
    short: "Máy elip điện từ 24 cấp, sải bước 45cm êm khớp.",
    highlights: ["Chuyển động elip ít tác động lên khớp", "24 cấp kháng lực điện từ", "Đo nhịp tim tay cầm"],
  },
  {
    id: "el-e2", name: "Máy tập elip E2 từ tính nhỏ gọn", brand: "b-home", category: "c-ellipticals", image: "elliptical",
    price: 6_290_000, weightKg: 45, bulky: true,
    keySpecs: [["Kháng lực", "8 cấp từ tính"], ["Sải bước", "36cm"], ["Tải tối đa", "110kg"], ["Bluetooth", "Không"]],
    specs: { "Thông số": [["Kích thước", "1.250 × 560 × 1.520 mm"], ["Khối lượng", "41 kg"], ["Kiểu kháng lực", "Từ tính"]] },
    attrs: { "a-resistance": ["tu-tinh"], "a-load": 110, "a-bluetooth": false },
    services: ["install"], rating: 4.3, reviews: 27, sold: 150, created: "2025-10-08",
    short: "Máy elip nhỏ gọn cho căn hộ, kháng lực từ tính 8 cấp.",
    highlights: ["Thiết kế gọn 1.25m", "Bánh đà 6kg", "Màn hình LCD 5 thông số"],
  },
  // ── Tạ đơn ────────────────────────────────────────────────
  {
    id: "db-rubber", name: "Tạ đơn bọc cao su (cặp 2 quả)", brand: "b-strength", category: "c-dumbbells", image: "dumbbell",
    price: 450_000, weightKg: 0, kgMultiplier: 2,
    axes: [{ id: "weight", name: "Khối lượng mỗi quả", values: [{ value: "5kg", label: "5kg" }, { value: "10kg", label: "10kg", delta: 220_000 }, { value: "15kg", label: "15kg", delta: 420_000 }, { value: "20kg", label: "20kg", delta: 440_000 }, { value: "25kg", label: "25kg", delta: 690_000 }] }],
    stock: [30, 22, 14, 9, 0],
    keySpecs: [["Khối lượng", "5–25kg / quả"], ["Chất liệu", "Gang bọc cao su"], ["Tay cầm", "Chống trượt"], ["Bán theo", "Cặp"]],
    specs: { "Thông số": [["Chất liệu", "Gang đúc bọc cao su"], ["Tay cầm", "Thép mạ chrome khía nhám"], ["Hình dạng", "Lục giác chống lăn"]] },
    attrs: { "a-weight": 20, "a-material": ["cao-su"], "a-adjustable": false },
    badges: ["bestseller"], rating: 4.9, reviews: 312, sold: 3400, created: "2025-09-01",
    short: "Tạ đơn lục giác bọc cao su, không lăn, không làm trầy sàn.",
    highlights: ["Đầu lục giác chống lăn", "Lớp cao su giảm tiếng ồn", "Tay cầm khía nhám bám tay"],
    together: ["bn-b200", "ac-gloves"],
  },
  {
    id: "db-adjust", name: "Tạ đơn điều chỉnh nhanh 2–24kg", brand: "b-pro", category: "c-dumbbells", image: "dumbbell",
    price: 3_690_000, compareAt: 4_390_000, weightKg: 26,
    axes: [{ id: "pack", name: "Đóng gói", values: [{ value: "1-qua", label: "1 quả" }, { value: "2-qua", label: "Cặp 2 quả", delta: 3_400_000 }] }],
    keySpecs: [["Khoảng tạ", "2–24kg"], ["Số mức", "15"], ["Đổi mức", "Xoay núm 2 giây"], ["Chất liệu", "Thép + nhựa ABS"]],
    specs: { "Thông số": [["Khoảng tạ", "2–24kg"], ["Số mức", "15"], ["Khay đựng", "Có"]] },
    attrs: { "a-weight": 24, "a-material": ["chrome"], "a-adjustable": true },
    rating: 4.7, reviews: 61, sold: 380, created: "2026-04-14",
    short: "Một quả thay cả bộ tạ 15 mức, đổi mức bằng núm xoay.",
    highlights: ["Thay thế 15 cặp tạ, tiết kiệm diện tích", "Đổi mức trong 2 giây", "Khay đựng chắc chắn"],
    together: ["bn-b200"],
  },
  {
    id: "db-chrome", name: "Tạ đơn thép mạ chrome (cặp 2 quả)", brand: "b-strength", category: "c-dumbbells", image: "dumbbell",
    price: 290_000, weightKg: 0, kgMultiplier: 2,
    axes: [{ id: "weight", name: "Khối lượng mỗi quả", values: [{ value: "2kg", label: "2kg" }, { value: "3kg", label: "3kg", delta: 90_000 }, { value: "5kg", label: "5kg", delta: 230_000 }] }],
    keySpecs: [["Khối lượng", "2–5kg / quả"], ["Chất liệu", "Thép mạ chrome"], ["Phù hợp", "Tập nhẹ, aerobic"], ["Bán theo", "Cặp"]],
    specs: { "Thông số": [["Chất liệu", "Thép đặc mạ chrome"], ["Tay cầm", "Khía nhám"]] },
    attrs: { "a-weight": 5, "a-material": ["chrome"], "a-adjustable": false },
    rating: 4.6, reviews: 98, sold: 1500, created: "2025-08-20",
    short: "Tạ tay mạ chrome sáng bóng cho bài tập nhẹ và aerobic.",
    highlights: ["Thép đặc, bền", "Kích thước nhỏ, dễ cầm", "Phù hợp nữ và người mới tập"],
  },
  {
    id: "db-kettle", name: "Tạ ấm kettlebell gang đúc", brand: "b-strength", category: "c-dumbbells", image: "dumbbell",
    price: 390_000, weightKg: 0,
    axes: [{ id: "weight", name: "Khối lượng", values: [{ value: "8kg", label: "8kg" }, { value: "12kg", label: "12kg", delta: 180_000 }, { value: "16kg", label: "16kg", delta: 360_000 }] }],
    keySpecs: [["Khối lượng", "8–16kg"], ["Chất liệu", "Gang đúc"], ["Đế", "Phẳng"], ["Bán theo", "Quả"]],
    specs: { "Thông số": [["Chất liệu", "Gang đúc nguyên khối"], ["Lớp phủ", "Sơn tĩnh điện"]] },
    attrs: { "a-weight": 16, "a-material": ["gang"], "a-adjustable": false },
    rating: 4.8, reviews: 45, sold: 520, created: "2026-01-11",
    short: "Kettlebell gang đúc nguyên khối cho bài swing, squat.",
    highlights: ["Đúc nguyên khối, không mối hàn", "Tay cầm rộng cầm 2 tay", "Đế phẳng đặt vững"],
  },
  // ── Tạ đòn & bánh tạ ──────────────────────────────────────
  {
    id: "bb-olympic", name: "Đòn tạ Olympic 2m2 chịu tải 300kg", brand: "b-pro", category: "c-barbells", image: "barbell",
    price: 2_890_000, weightKg: 20, bulky: true,
    keySpecs: [["Chiều dài", "2,2m"], ["Khối lượng", "20kg"], ["Tải tối đa", "300kg"], ["Lỗ bánh", "50mm"]],
    specs: { "Thông số": [["Chiều dài", "2.200 mm"], ["Đường kính tay cầm", "28 mm"], ["Ống xoay", "Bạc đạn kim"]] },
    attrs: { "a-weight": 20, "a-material": ["chrome"] },
    rating: 4.8, reviews: 33, sold: 140, created: "2026-03-25",
    short: "Đòn tạ Olympic chuẩn 2m2, ống xoay bạc đạn cho bài squat, deadlift.",
    highlights: ["Chịu tải 300kg", "Ống xoay bạc đạn kim", "Khía nhám chuẩn thi đấu"],
    together: ["pl-bumper", "rk-r1"],
  },
  {
    id: "pl-bumper", name: "Bánh tạ bumper cao su lỗ 50mm", brand: "b-strength", category: "c-barbells", image: "plate",
    price: 690_000, weightKg: 0,
    axes: [{ id: "weight", name: "Khối lượng", values: [{ value: "5kg", label: "5kg" }, { value: "10kg", label: "10kg", delta: 450_000 }, { value: "15kg", label: "15kg", delta: 900_000 }, { value: "20kg", label: "20kg", delta: 1_300_000 }] }],
    keySpecs: [["Khối lượng", "5–20kg"], ["Lỗ", "50mm"], ["Chất liệu", "Cao su đặc"], ["Bán theo", "Bánh"]],
    specs: { "Thông số": [["Chất liệu", "Cao su đặc nguyên khối"], ["Lõi", "Thép không gỉ"]] },
    attrs: { "a-weight": 20, "a-material": ["cao-su"] },
    rating: 4.7, reviews: 52, sold: 640, created: "2025-12-12",
    short: "Bánh tạ bumper cao su đặc, thả rơi không nảy, không vỡ sàn.",
    highlights: ["Thả rơi an toàn", "Lõi thép không gỉ khít đòn", "Mùi cao su thấp"],
  },
  {
    id: "bb-ez", name: "Đòn tạ EZ cong 1m2", brand: "b-strength", category: "c-barbells", image: "barbell",
    price: 790_000, weightKg: 8,
    keySpecs: [["Chiều dài", "1,2m"], ["Khối lượng", "8kg"], ["Tải tối đa", "150kg"], ["Lỗ bánh", "28mm"]],
    specs: { "Thông số": [["Chiều dài", "1.200 mm"], ["Kiểu", "Đòn cong EZ"]] },
    attrs: { "a-weight": 8, "a-material": ["chrome"] },
    rating: 4.5, reviews: 21, sold: 260, created: "2025-07-30",
    short: "Đòn cong EZ giảm áp lực cổ tay khi tập tay trước, tay sau.",
    highlights: ["Tay cầm cong giảm áp lực cổ tay", "Khóa bánh tạ đi kèm", "Mạ chrome chống gỉ"],
  },
  // ── Ghế tập ───────────────────────────────────────────────
  {
    id: "bn-b200", name: "Ghế tập đa năng B200 điều chỉnh 7 nấc", brand: "b-strength", category: "c-benches", image: "bench",
    price: 2_450_000, compareAt: 2_890_000, weightKg: 24,
    keySpecs: [["Tải tối đa", "300kg"], ["Góc nghiêng", "-15° → 85°"], ["Số nấc", "7"], ["Gấp gọn", "Có"]],
    specs: { "Thông số": [["Kích thước", "1.300 × 620 × 1.200 mm"], ["Khối lượng", "22 kg"], ["Đệm", "Mút D40 bọc da PU"]] },
    attrs: { "a-load": 300, "a-adjustable": true, "a-foldable": true },
    services: ["install"], rating: 4.7, reviews: 88, sold: 640, created: "2026-02-02",
    short: "Ghế tập điều chỉnh 7 nấc từ dốc xuống đến gần thẳng đứng.",
    highlights: ["Chịu tải 300kg", "Gấp gọn, có bánh xe", "Đệm dày 6cm"],
    together: ["db-rubber", "db-adjust"],
  },
  {
    id: "bn-flat", name: "Ghế tập phẳng F100", brand: "b-home", category: "c-benches", image: "bench",
    price: 990_000, weightKg: 12,
    keySpecs: [["Tải tối đa", "200kg"], ["Kiểu", "Phẳng"], ["Chiều cao", "43cm"], ["Gấp gọn", "Không"]],
    specs: { "Thông số": [["Kích thước", "1.150 × 480 × 430 mm"], ["Khối lượng", "11 kg"]] },
    attrs: { "a-load": 200, "a-adjustable": false, "a-foldable": false },
    rating: 4.5, reviews: 56, sold: 900, created: "2025-06-15",
    short: "Ghế phẳng chắc chắn cho bài đẩy ngực, chống đẩy, step-up.",
    highlights: ["Khung thép hộp 50×50", "Đệm chống trượt", "Chân đế cao su"],
  },
  {
    id: "bn-abs", name: "Ghế tập bụng gấp gọn có dây kháng lực", brand: "b-home", category: "c-benches", image: "bench",
    price: 1_190_000, weightKg: 14,
    keySpecs: [["Tải tối đa", "150kg"], ["Độ dốc", "5 nấc"], ["Phụ kiện", "Dây kháng lực"], ["Gấp gọn", "Có"]],
    specs: { "Thông số": [["Kích thước", "1.250 × 450 × 650 mm"], ["Khối lượng", "12 kg"]] },
    attrs: { "a-load": 150, "a-adjustable": true, "a-foldable": true },
    rating: 4.5, reviews: 203, sold: 2100, created: "2025-11-01",
    short: "Ghế gập bụng chỉnh dốc 5 nấc, gấp gọn cất tủ.",
    highlights: ["Chỉnh dốc 5 nấc", "Kèm dây kháng lực tập tay", "Gấp gọn"],
  },
  // ── Khung & giàn tạ ───────────────────────────────────────
  {
    id: "rk-r1", name: "Khung squat R1 có thanh xà đơn", brand: "b-pro", category: "c-racks", image: "rack",
    price: 6_990_000, weightKg: 75, bulky: true,
    keySpecs: [["Tải tối đa", "350kg"], ["Chiều cao", "2,1m"], ["Xà đơn", "Có"], ["Chốt an toàn", "Có"]],
    specs: { "Thông số": [["Kích thước", "1.250 × 1.200 × 2.100 mm"], ["Thép", "Hộp 60×60, dày 2.5mm"]] },
    attrs: { "a-load": 350 },
    services: ["install", "warranty"], rating: 4.9, reviews: 17, sold: 70, created: "2026-05-28",
    short: "Khung squat chắc chắn có xà đơn và thanh chặn an toàn.",
    highlights: ["Thép hộp 60×60 chịu tải 350kg", "Thanh chặn an toàn chỉnh độ cao", "Tích hợp xà đơn"],
    together: ["bb-olympic", "pl-bumper"],
  },
  {
    id: "rk-pullup", name: "Xà đơn treo tường đa năng", brand: "b-gear", category: "c-racks", image: "rack",
    price: 690_000, weightKg: 9,
    keySpecs: [["Tải tối đa", "200kg"], ["Lắp đặt", "Bắt vít tường"], ["Tay cầm", "3 kiểu"], ["Chất liệu", "Thép sơn tĩnh điện"]],
    specs: { "Thông số": [["Kích thước", "1.100 × 600 mm"]] },
    attrs: { "a-load": 200 },
    rating: 4.6, reviews: 66, sold: 820, created: "2025-10-20",
    short: "Xà đơn bắt tường, 3 kiểu tay cầm cho bài kéo xà.",
    highlights: ["Chịu tải 200kg", "3 kiểu cầm: rộng, hẹp, trung tính", "Kèm bộ vít nở"],
  },
  // ── Thảm tập ──────────────────────────────────────────────
  {
    id: "mat-tpe", name: "Thảm tập yoga TPE 8mm hai lớp", brand: "b-recovery", category: "c-mats", image: "mat",
    price: 350_000, compareAt: 450_000, weightKg: 1,
    axes: [{ id: "color", name: "Màu sắc", values: [{ value: "cam", label: "Cam đất", swatch: "#D4321A" }, { value: "xanh", label: "Xanh rêu", swatch: "#5E6B4E" }, { value: "tim", label: "Tím khói", swatch: "#7A6A86" }] }],
    keySpecs: [["Độ dày", "8mm"], ["Kích thước", "183 × 61cm"], ["Chất liệu", "TPE"], ["Chống trượt", "2 mặt"]],
    specs: { "Thông số": [["Kích thước", "1.830 × 610 × 8 mm"], ["Khối lượng", "0,9 kg"], ["Túi đựng", "Có"]] },
    attrs: { "a-thickness": 8, "a-material": ["tpe"] },
    badges: ["bestseller"], rating: 4.8, reviews: 740, sold: 9800, created: "2025-05-05",
    short: "Thảm TPE hai lớp êm, bám sàn, không mùi.",
    highlights: ["Hai lớp, hai màu", "Chống trượt cả hai mặt", "Kèm túi đựng và dây buộc"],
    together: ["ms-roller", "ac-band"],
  },
  {
    id: "mat-pu", name: "Thảm yoga cao su PU 5mm định tuyến", brand: "b-recovery", category: "c-mats", image: "mat",
    price: 1_290_000, weightKg: 2.5,
    keySpecs: [["Độ dày", "5mm"], ["Kích thước", "183 × 68cm"], ["Chất liệu", "PU + cao su"], ["Định tuyến", "Có"]],
    specs: { "Thông số": [["Kích thước", "1.830 × 680 × 5 mm"], ["Khối lượng", "2,5 kg"]] },
    attrs: { "a-thickness": 5, "a-material": ["pu", "cao-su"] },
    rating: 4.9, reviews: 85, sold: 600, created: "2026-04-01",
    short: "Thảm PU bám tay tuyệt đối kể cả khi ra mồ hôi, có đường định tuyến.",
    highlights: ["Mặt PU thấm hút mồ hôi", "Đế cao su tự nhiên", "Đường định tuyến căn chỉnh tư thế"],
  },
  {
    id: "mat-floor", name: "Thảm lót sàn máy tập 2m × 1m", brand: "b-gear", category: "c-mats", image: "mat",
    price: 350_000, weightKg: 4,
    keySpecs: [["Độ dày", "6mm"], ["Kích thước", "200 × 100cm"], ["Chất liệu", "Cao su EVA"], ["Chống ồn", "Có"]],
    specs: { "Thông số": [["Kích thước", "2.000 × 1.000 × 6 mm"]] },
    attrs: { "a-thickness": 6, "a-material": ["cao-su"] },
    rating: 4.7, reviews: 130, sold: 1700, created: "2025-09-09",
    short: "Thảm lót dưới máy chạy, xe đạp giảm ồn, chống trầy sàn.",
    highlights: ["Giảm rung và tiếng ồn", "Chống trầy sàn gỗ", "Cắt theo kích thước dễ dàng"],
  },
  {
    id: "mat-puzzle", name: "Thảm ghép xốp phòng gym (bộ 6 tấm)", brand: "b-gear", category: "c-mats", image: "mat",
    price: 420_000, weightKg: 5,
    keySpecs: [["Độ dày", "20mm"], ["Kích thước tấm", "60 × 60cm"], ["Chất liệu", "EVA"], ["Số tấm", "6"]],
    specs: { "Thông số": [["Diện tích phủ", "2,16 m²"]] },
    attrs: { "a-thickness": 20, "a-material": ["tpe"] },
    rating: 4.4, reviews: 49, sold: 700, created: "2026-01-25",
    short: "Thảm ghép EVA dày 2cm tạo góc tập tại nhà.",
    highlights: ["Dày 2cm giảm chấn khi thả tạ nhẹ", "Ghép mép răng cưa chắc chắn", "Lau chùi dễ"],
  },
  // ── Massage ───────────────────────────────────────────────
  {
    id: "ms-gun", name: "Súng massage cầm tay M3 6 đầu", brand: "b-recovery", category: "c-massage", image: "massage",
    price: 1_490_000, compareAt: 1_990_000, weightKg: 1.5,
    axes: [{ id: "color", name: "Màu sắc", values: [{ value: "den", label: "Đen", swatch: "#1C1917" }, { value: "xam", label: "Xám", swatch: "#8D8780" }] }],
    keySpecs: [["Tốc độ", "30 mức"], ["Pin", "6 giờ"], ["Đầu massage", "6"], ["Bluetooth", "Không"]],
    specs: { "Thông số": [["Khối lượng", "0,9 kg"], ["Sạc", "USB-C"]] },
    attrs: { "a-bluetooth": false },
    badges: ["new"], rating: 4.7, reviews: 158, sold: 1900, created: "2026-09-02",
    short: "Súng massage 30 mức, 6 đầu, pin 6 giờ giảm căng cơ sau tập.",
    highlights: ["30 mức tốc độ", "Pin 6 giờ, sạc USB-C", "Vận hành êm"],
  },
  {
    id: "ms-roller", name: "Con lăn massage foam roller gai 33cm", brand: "b-recovery", category: "c-massage", image: "massage",
    price: 290_000, weightKg: 0.8,
    keySpecs: [["Chiều dài", "33cm"], ["Đường kính", "14cm"], ["Bề mặt", "Gai 3 vùng"], ["Chất liệu", "EVA + lõi ABS"]],
    specs: { "Thông số": [["Kích thước", "330 × 140 mm"]] },
    attrs: { "a-bluetooth": false },
    rating: 4.6, reviews: 220, sold: 3100, created: "2025-08-08",
    short: "Con lăn foam roller giãn cơ, giảm đau nhức sau tập.",
    highlights: ["Bề mặt 3 vùng gai", "Lõi rỗng cứng chịu lực", "Nhẹ, mang theo dễ"],
  },
  {
    id: "ms-smart", name: "Súng massage thông minh M5 Pro kết nối ứng dụng", brand: "b-pro", category: "c-massage", image: "massage",
    price: 3_290_000, weightKg: 1.8, stock: [0],
    keySpecs: [["Tốc độ", "Tự động theo nhóm cơ"], ["Pin", "8 giờ"], ["Đầu massage", "8"], ["Bluetooth", "Có"]],
    specs: { "Thông số": [["Khối lượng", "1,1 kg"], ["Lực đập", "16mm"]] },
    attrs: { "a-bluetooth": true },
    rating: 4.8, reviews: 31, sold: 210, created: "2026-06-30",
    short: "Súng massage biên độ 16mm, chương trình tự động theo nhóm cơ.",
    highlights: ["Biên độ sâu 16mm", "Kết nối ứng dụng gợi ý bài giãn cơ", "Pin 8 giờ"],
  },
  // ── Phụ kiện ──────────────────────────────────────────────
  {
    id: "ac-band", name: "Bộ dây kháng lực 5 mức", brand: "b-gear", category: "c-accessories", image: "band",
    price: 190_000, weightKg: 0.5,
    keySpecs: [["Số dây", "5"], ["Lực kéo", "5–40kg"], ["Chất liệu", "Latex"], ["Túi đựng", "Có"]],
    specs: { "Thông số": [["Chiều dài", "120 cm"]] },
    attrs: {},
    rating: 4.6, reviews: 410, sold: 6500, created: "2025-07-07",
    short: "Bộ 5 dây kháng lực tập toàn thân mọi lúc mọi nơi.",
    highlights: ["5 mức lực kéo", "Latex tự nhiên đàn hồi tốt", "Kèm tay cầm và móc cửa"],
  },
  {
    id: "ac-gloves", name: "Găng tay tập gym hở ngón", brand: "b-gear", category: "c-accessories", image: "band",
    price: 159_000, weightKg: 0.2,
    axes: [{ id: "size", name: "Kích cỡ", values: [{ value: "s", label: "S" }, { value: "m", label: "M" }, { value: "l", label: "L" }, { value: "xl", label: "XL" }] }],
    stock: [10, 20, 15, 0],
    keySpecs: [["Kích cỡ", "S–XL"], ["Chất liệu", "Da PU + lưới"], ["Bảo vệ cổ tay", "Có"], ["Giặt được", "Có"]],
    specs: { "Thông số": [["Chất liệu", "Da PU, lưới thoáng khí"]] },
    attrs: {},
    rating: 4.5, reviews: 260, sold: 3900, created: "2025-06-01",
    short: "Găng tay hở ngón có quấn cổ tay, chống chai tay khi tập tạ.",
    highlights: ["Đệm lòng bàn tay", "Quấn cổ tay dán chắc chắn", "Lưới thoáng khí"],
  },
  {
    id: "ac-belt", name: "Đai lưng tập tạ da 10cm", brand: "b-gear", category: "c-accessories", image: "band",
    price: 590_000, weightKg: 0.6,
    axes: [{ id: "size", name: "Kích cỡ", values: [{ value: "m", label: "M" }, { value: "l", label: "L" }, { value: "xl", label: "XL" }] }],
    keySpecs: [["Bản rộng", "10cm"], ["Chất liệu", "Da bò"], ["Khóa", "Cài kim đôi"], ["Kích cỡ", "M–XL"]],
    specs: { "Thông số": [["Độ dày", "10 mm"]] },
    attrs: {},
    rating: 4.7, reviews: 58, sold: 480, created: "2026-02-20",
    short: "Đai lưng da bò bản 10cm hỗ trợ cột sống khi squat, deadlift.",
    highlights: ["Da bò dày 10mm", "Khóa kim đôi chắc chắn", "Ôm lưng, không cấn"],
  },
  {
    id: "ac-oil", name: "Dầu bôi trơn băng tải máy chạy 50ml", brand: "b-gear", category: "c-accessories", image: "band",
    price: 120_000, weightKg: 0.1,
    keySpecs: [["Dung tích", "50ml"], ["Thành phần", "Silicon 100%"], ["Dùng cho", "Mọi máy chạy"], ["Chu kỳ", "1–2 tháng/lần"]],
    specs: { "Thông số": [["Dung tích", "50 ml"]] },
    attrs: {},
    rating: 4.8, reviews: 190, sold: 5200, created: "2025-04-04",
    short: "Dầu silicon chuyên dụng giúp băng tải chạy êm, bền động cơ.",
    highlights: ["Silicon nguyên chất", "Đầu vòi dài dễ tra", "Giảm tải cho động cơ"],
  },
  {
    id: "ac-hr", name: "Đai đo nhịp tim Bluetooth", brand: "b-gear", category: "c-accessories", image: "band",
    price: 690_000, weightKg: 0.1,
    keySpecs: [["Kết nối", "Bluetooth + ANT+"], ["Pin", "CR2032, 300 giờ"], ["Chống nước", "IP67"], ["Tương thích", "iOS, Android"]],
    specs: { "Thông số": [["Pin", "CR2032"]] },
    attrs: {},
    rating: 4.6, reviews: 72, sold: 640, created: "2026-03-15",
    short: "Đai ngực đo nhịp tim chính xác, kết nối máy tập và điện thoại.",
    highlights: ["Đo nhịp tim chính xác hơn đồng hồ", "Kết nối máy chạy, xe đạp có Bluetooth", "Chống nước IP67"],
  },
];

export const MOCK_PRODUCT_LIST: Product[] = (() => {
  const list = DEFS.map(build);
  // Sản phẩm tương tự: cùng danh mục chính, tối đa 8
  for (const p of list) {
    p.relatedIds = list.filter((o) => o.id !== p.id && o.primaryCategoryId === p.primaryCategoryId).slice(0, 8).map((o) => o.id);
  }
  return list;
})();

/** Chuyển sản phẩm đầy đủ -> dạng thẻ (giá thấp nhất trong các biến thể còn bán) */
export function toSummary(p: Product): ProductSummary {
  const sellable = p.variants.filter((v) => v.stock > 0);
  const pool = sellable.length ? sellable : p.variants;
  const cheapest = pool.reduce((min, v) => (v.price < min.price ? v : min), pool[0]);
  const image = p.media.find((m) => m.kind === "image");
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand.name,
    image: image && image.kind === "image" ? { src: image.src, alt: image.alt } : { src: "/shop/placeholder/treadmill.svg", alt: p.name },
    keySpecs: p.keySpecs.slice(0, 3),
    price: cheapest.price,
    compareAtPrice: cheapest.compareAtPrice ?? null,
    badges: p.badges,
    rating: p.rating,
    reviewCount: p.reviewCount,
    soldCount: p.soldCount,
    inStock: sellable.length > 0,
  };
}

/** Dạng thẻ — dùng cho trang chủ tạm GĐ1 (GĐ2 M2 thay bằng khối CMS) */
export const MOCK_PRODUCTS: ProductSummary[] = MOCK_PRODUCT_LIST.slice(0, 8).map(toSummary);
