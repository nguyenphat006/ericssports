import { BannerPair } from "./banner-pair/BannerPair";
import { bannerPairDef } from "./banner-pair/schema";
import { CategoryIcons } from "./category-icons/CategoryIcons";
import { categoryIconsDef } from "./category-icons/schema";
import { CtaBanner } from "./cta-banner/CtaBanner";
import { ctaBannerDef } from "./cta-banner/schema";
import { Faq } from "./faq/Faq";
import { faqDef } from "./faq/schema";
import { Hero } from "./hero/Hero";
import { heroDef } from "./hero/schema";
import { ImageText } from "./image-text/ImageText";
import { imageTextDef } from "./image-text/schema";
import { LinkCardGrid } from "./link-card-grid/LinkCardGrid";
import { linkCardGridDef } from "./link-card-grid/schema";
import { LogoStrip } from "./logo-strip/LogoStrip";
import { logoStripDef } from "./logo-strip/schema";
import { ProductGrid } from "./product-grid/ProductGrid";
import { productGridDef } from "./product-grid/schema";
import { RichTextBlock } from "./rich-text/RichTextBlock";
import { richTextDef } from "./rich-text/schema";
import { Testimonials } from "./testimonials/Testimonials";
import { testimonialsDef } from "./testimonials/schema";
import { defineBlock, type BlockDefinition } from "./types";
import { UspStrip } from "./usp-strip/UspStrip";
import { uspStripDef } from "./usp-strip/schema";
import { VideoEmbed } from "./video-embed/VideoEmbed";
import { videoEmbedDef } from "./video-embed/schema";

/** Khối kèm component render — chỉ dùng phía render trang (server). */
export const BLOCK_REGISTRY: BlockDefinition[] = [
  defineBlock(heroDef, Hero),
  defineBlock(richTextDef, RichTextBlock),
  defineBlock(imageTextDef, ImageText),
  defineBlock(uspStripDef, UspStrip),
  defineBlock(linkCardGridDef, LinkCardGrid),
  defineBlock(ctaBannerDef, CtaBanner),
  defineBlock(bannerPairDef, BannerPair),
  defineBlock(logoStripDef, LogoStrip),
  defineBlock(testimonialsDef, Testimonials),
  defineBlock(faqDef, Faq),
  defineBlock(videoEmbedDef, VideoEmbed),
  defineBlock(productGridDef, ProductGrid),
  defineBlock(categoryIconsDef, CategoryIcons),
];

export const BLOCK_BY_TYPE = new Map(BLOCK_REGISTRY.map((d) => [d.type, d]));
