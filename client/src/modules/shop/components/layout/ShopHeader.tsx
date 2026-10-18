"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronDown, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SHOP_NAVIGATION, type ShopNavItem } from "../../config/navigation";
import { archivo } from "../../fonts";
import { Container } from "../ui";
import { Wordmark } from "./Wordmark";

const ICON_BUTTON =
  "inline-flex size-10 items-center justify-center rounded-[4px] text-[var(--shop-ink)] transition-colors hover:bg-[var(--shop-muted)] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

/**
 * Ô tìm kiếm — GĐ1 chỉ có giao diện; GĐ2 nối gợi ý tức thì + trang /tim-kiem.
 * Chặn submit để Enter không tải lại trang.
 */
function SearchField({ autoFocus = false, className }: { autoFocus?: boolean; className?: string }) {
  const t = useTranslations("shop.header");
  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className={cn("relative", className)}>
      <label htmlFor={autoFocus ? "shop-search-mobile" : "shop-search"} className="sr-only">
        {t("searchLabel")}
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--c-text-tertiary)]" aria-hidden />
      <input
        id={autoFocus ? "shop-search-mobile" : "shop-search"}
        type="search"
        autoFocus={autoFocus}
        placeholder={t("searchPlaceholder")}
        className="h-11 w-full rounded-[4px] border border-transparent bg-[var(--shop-muted)] pr-3 pl-9 text-sm text-[var(--shop-ink)] outline-none placeholder:text-[var(--c-text-tertiary)] focus:border-[var(--c-border-strong)] focus:bg-white"
      />
    </form>
  );
}

function MobileNavItem({ item }: { item: ShopNavItem }) {
  const t = useTranslations();
  const label = t(item.label);
  if (!item.children?.length) {
    return <li className={cn("py-3 text-[15px] font-semibold", item.highlight && "text-[var(--shop-primary)]")}>{label}</li>;
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
            {item.children.map((c) => (
              <li key={c.key} className="py-2 text-sm text-[var(--c-text-secondary)]">
                {t(c.label)}
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

/**
 * Header storefront: dính đầu trang. Desktop: logo · tìm kiếm · tài khoản · giỏ hàng + hàng menu danh mục.
 * Mobile: menu (Sheet trái) · logo · tìm kiếm (mở hàng ô nhập) · giỏ hàng.
 * GĐ1: menu chưa có trang danh mục, tài khoản / giỏ hàng chưa có chức năng (GĐ2).
 */
export function ShopHeader() {
  const t = useTranslations("shop.header");
  const tAll = useTranslations();
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

        <SearchField className="mx-auto hidden w-full max-w-xl lg:block" />

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
            <SearchField autoFocus />
          </Container>
        </div>
      )}

      <nav aria-label={t("mainNav")} className="hidden border-t border-[var(--c-border)] lg:block">
        <Container>
          <ul className="flex h-11 items-center gap-7 text-sm font-semibold">
            {SHOP_NAVIGATION.map((item) => (
              <li key={item.key} className={cn(item.highlight && "text-[var(--shop-primary)]")}>
                {tAll(item.label)}
              </li>
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
              <MobileNavItem key={item.key} item={item} />
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </header>
  );
}
