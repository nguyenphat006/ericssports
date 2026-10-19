import Image from "next/image";
import Link from "next/link";
import { Container, SectionHeading } from "@/modules/shop/components/ui";
import { catalogService } from "@/modules/shop/services";
import type { BlockComponent } from "../types";
import type { CategoryIconsProps } from "./schema";

/** Ảnh minh họa tạm theo danh mục (GĐ4: ảnh danh mục từ CMS / media) */
const PLACEHOLDER_BY_SLUG: Record<string, string> = {
  cardio: "treadmill",
  "may-chay-bo": "treadmill",
  "xe-dap-tap": "bike",
  "may-tap-elip": "elliptical",
  "tap-ta": "dumbbell",
  "ta-don": "dumbbell",
  "ta-don-banh-ta": "barbell",
  "ghe-tap": "bench",
  "khung-gian-ta": "rack",
  "yoga-phuc-hoi": "mat",
  "tham-tap": "mat",
  massage: "massage",
  "phu-kien": "band",
};

export const CategoryIcons: BlockComponent<CategoryIconsProps> = async ({ props }) => {
  const all = await catalogService.listCategories();
  const list = props.categoryIds.length
    ? props.categoryIds.map((id) => all.find((c) => c.id === id)).filter((c): c is (typeof all)[number] => !!c)
    : all.filter((c) => !c.parentId);
  if (list.length === 0) return null;

  return (
    <section className="py-10 lg:py-14">
      <Container>
        {props.title && <SectionHeading title={props.title} />}
        <ul className="flex snap-x gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-6 lg:gap-4">
          {list.map((c) => (
            <li key={c.id} className="w-28 shrink-0 snap-start sm:w-auto">
              <Link href={c.path} className="group block text-center outline-none">
                <span className="relative block aspect-square overflow-hidden rounded-[6px] bg-white transition-colors group-hover:bg-[var(--shop-muted)] group-focus-visible:ring-[3px] group-focus-visible:ring-ring/50">
                  <Image
                    src={c.image?.src ?? `/shop/placeholder/${PLACEHOLDER_BY_SLUG[c.slug] ?? "dumbbell"}.svg`}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 180px, 112px"
                    className="object-contain p-5"
                  />
                </span>
                <span className="mt-2 block text-sm font-semibold text-[var(--shop-ink)]">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
};
