import Link from "next/link";
import { ChevronRight } from "@/modules/shop/components/icons";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/modules/cms/seo/JsonLd";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

/** Breadcrumb storefront + JSON-LD BreadcrumbList. Mục cuối là trang hiện tại (không link). */
export async function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const t = await getTranslations("shop.catalog");
  const all: Crumb[] = [{ label: t("breadcrumbHome"), href: "/" }, ...items];
  return (
    <nav aria-label={t("breadcrumbLabel")} className={cn("text-[13px] text-[var(--c-text-secondary)]", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1">
              {last || !c.href ? (
                <span aria-current={last ? "page" : undefined} className={cn(last && "font-medium text-[var(--shop-ink)]")}>
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="hover:text-[var(--shop-ink)] hover:underline">
                  {c.label}
                </Link>
              )}
              {!last && <ChevronRight className="size-3.5 text-[var(--c-text-tertiary)]" aria-hidden />}
            </li>
          );
        })}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.href && { item: c.href }) })),
        }}
      />
    </nav>
  );
}
