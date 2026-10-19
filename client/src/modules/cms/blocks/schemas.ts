import { bannerPairDef } from "./banner-pair/schema";
import { categoryIconsDef } from "./category-icons/schema";
import { ctaBannerDef } from "./cta-banner/schema";
import { faqDef } from "./faq/schema";
import { heroDef } from "./hero/schema";
import { imageTextDef } from "./image-text/schema";
import { linkCardGridDef } from "./link-card-grid/schema";
import { logoStripDef } from "./logo-strip/schema";
import { productGridDef } from "./product-grid/schema";
import { richTextDef } from "./rich-text/schema";
import { testimonialsDef } from "./testimonials/schema";
import type { BlockSchemaDef } from "./types";
import { uspStripDef } from "./usp-strip/schema";
import { videoEmbedDef } from "./video-embed/schema";

/**
 * Phần dữ liệu của mọi khối (không kèm component) — dùng cho kiểm tra dữ liệu và trình soạn GĐ3.
 * Thêm khối mới: tạo blocks/<type>/schema.ts + component, đăng ký ở đây và ở registry.ts.
 */
export const BLOCK_SCHEMAS: BlockSchemaDef[] = [
  heroDef,
  richTextDef,
  imageTextDef,
  uspStripDef,
  linkCardGridDef,
  ctaBannerDef,
  bannerPairDef,
  logoStripDef,
  testimonialsDef,
  faqDef,
  videoEmbedDef,
  productGridDef,
  categoryIconsDef,
] as unknown as BlockSchemaDef[];

export const BLOCK_SCHEMA_BY_TYPE = new Map(BLOCK_SCHEMAS.map((d) => [d.type, d]));
