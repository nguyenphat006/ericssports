"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SHOP_NAVIGATION, type ShopNavItem } from "../../config/navigation";
import { archivo } from "../../fonts";
import { Container } from "../ui";
import { SearchBox } from "./SearchBox";
import { Wordmark } from "./Wordmark";

const ICON_BUTTON =
  "inline-flex size-10 items-center justify-center rounded-[4px] text-[var(--shop-ink)] transition-colors hover:bg-[var(--shop-muted)] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Mục menu desktop: link danh mục cha + bảng danh mục con mở khi rê chuột / focus bàn phím; Esc đóng. */
function DesktopNavItem({ item, pathname }: { item: ShopNavItem; pathname: string }) {
  const t = useTranslations();
  const [closed, setClosed] = useState(false);
  const active = isActive(pathname, item.href);
  const linkClass = cn(
    "flex h-11 items-center gap-1 border-b-2 text-sm font-semibold transition-colors",
    active ? "border-[var(--shop-primary)]" : "border-transparent hover:border-[var(--c-border-strong)]",
    item.highlight && "text-[var(--shop-primary)]",
  );
  if (!item.children?.length) {
    return (
      <li>
        <Link href={item.href} className={linkClass} aria-current={active ? "page" : undefined}>
          {t(item.label)}
        </Link>
      </li>
    );
  }
  return (
    <li
      className="group relative"
      onMouseLeave={() => setClosed(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setClosed(true);
          (e.currentTarget.querySelector("a") as HTMLElement | null)?.focus();
        }
      }}
    >
      <Link href={item.href} className={linkClass} aria-current={active ? "page" : undefined} onFocus={() => setClosed(false)}>
        {t(item.label)}
        <ChevronDown className="size-3.5 text-[var(--c-text-tertiary)]" aria-hidden />
      </Link>
      <div
        className={cn(
          "invisible absolute top-full left-0 z-50 min-w-[220px] translate-y-1 rounded-b-[6px] border border-t-0 border-[var(--c-border)] bg-white p-2 opacity-0 shadow-lg transition",
          !closed && "group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
        )}
      >
        <ul>
          {item.children.map((c) => (
            <li key={c.key}>
              <Link
                href={c.href}
                className={cn(
                  "block rounded-[4px] px-3 py-2 text-sm hover:bg-[var(--shop-muted)] focus-visible:bg-[var(--shop-muted)] focus-visible:outline-none",
                  isActive(pathname, c.href) && "font-semibold text-[var(--shop-primary)]",
                )}
              >
                {t(c.label)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function MobileNavItem({ item, onNavigate }: { item: ShopNavItem; onNavigate: () => void }) {
  const t = useTranslations();
  const label = t(item.label);
  const link = (href: string, text: string, className: string) => (
    <Link href={href} onClick={onNavigate} className={className}>
      {text}
    </Link>
  );
  if (!item.children?.length) {
    return <li>{link(item.href, label, cn("block py-3 text-[15px] font-semibold", item.highlight && "text-[var(--shop-primary)]"))}</li>;
  }
  return (
    <li>
      <Collapsible>
        <CollapsibleTrigger className="group flex w-full items-center justify-between py-3 text-left text-[15px] font-semibold">
          {label}
          <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="pb-2 pl-3">
            <li>{link(item.href, t("shop.header.viewAllIn", { category: label }), "block py-2 text-sm font-medium text-[var(--shop-primary)]")}</li>
            {item.children.map((c) => (
              <li key={c.key}>{link(c.href, t(c.label), "block py-2 text-sm text-[var(--c-text-secondary)]")}</li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

/**
 * Header storefront: dính đầu trang. Desktop: logo · tìm kiếm có gợi ý · tài khoản · giỏ hàng + menu danh mục (mega menu).
 * Mobile: menu (Sheet trái) · logo · tìm kiếm (mở hàng ô nhập) · giỏ hàng.
 * Tài khoản / giỏ hàng nối chức năng ở mốc M5, M7.
 */
export function ShopHeader() {
  const t = useTranslations("shop.header");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--c-border)] bg-white">
      <Container className="flex h-16 items-center gap-2 lg:h-[72px] lg:gap-6">
        <button type="button" className={cn(ICON_BUTTON, "-ml-2 lg:hidden")} aria-label={t("openMenu")} onClick={() => setMenuOpen(true)}>
          <Menu className="size-5" aria-hidden />
        </button>

        <Link href="/" aria-label={t("home")} className="shrink-0 rounded-[4px] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
          <Wordmark />
        </Link>

        <SearchBox className="mx-auto hidden w-full max-w-xl lg:block" />

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <button
            type="button"
            className={cn(ICON_BUTTON, "lg:hidden")}
            aria-label={t("openSearch")}
            aria-expanded={searchOpen}
            aria-controls="shop-mobile-search"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="size-5" aria-hidden />
          </button>
          <button type="button" className={cn(ICON_BUTTON, "hidden sm:inline-flex")} aria-label={t("account")}>
            <User className="size-5" aria-hidden />
          </button>
          <button type="button" className={ICON_BUTTON} aria-label={t("cart")}>
            <ShoppingBag className="size-5" aria-hidden />
          </button>
        </div>
      </Container>

      {searchOpen && (
        <div id="shop-mobile-search" className="border-t border-[var(--c-border)] py-2 lg:hidden">
          <Container>
            <SearchBox autoFocus onNavigate={() => setSearchOpen(false)} />
          </Container>
        </div>
      )}

      <nav aria-label={t("mainNav")} className="hidden border-t border-[var(--c-border)] lg:block">
        <Container>
          <ul className="flex items-center gap-7">
            {SHOP_NAVIGATION.map((item) => (
              <DesktopNavItem key={item.key} item={item} pathname={pathname} />
            ))}
          </ul>
        </Container>
      </nav>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className={cn("shop-theme w-[86vw] max-w-sm gap-0 p-0", archivo.variable)}>
          <div className="flex h-16 items-center border-b border-[var(--c-border)] px-4">
            <Wordmark />
          </div>
          <SheetTitle className="shop-eyebrow px-4 pt-4 text-[var(--c-text-tertiary)]">{t("menuTitle")}</SheetTitle>
          <ul className="divide-y divide-[var(--c-border)] overflow-y-auto px-4">
            {SHOP_NAVIGATION.map((item) => (
              <MobileNavItem key={item.key} item={item} onNavigate={() => setMenuOpen(false)} />
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </header>
  );
}
