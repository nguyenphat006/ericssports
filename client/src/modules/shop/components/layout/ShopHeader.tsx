"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, LogOut, MapPin, Menu, Package, Search, ShoppingBag, User } from "@/modules/shop/components/icons";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";
import { SHOP_NAVIGATION, type ShopNavItem } from "../../config/navigation";
import { archivo } from "../../fonts";
import { useCartTabSync } from "../../hooks/useCart";
import { useCustomer } from "../../hooks/useCustomer";
import { useCustomerAuth } from "../../stores/useCustomerAuth";
import { selectItemCount, useCartStore } from "../../stores/useCartStore";
import { CartDrawer } from "../cart/CartDrawer";
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

/** Tài khoản khách: chưa đăng nhập -> link đăng nhập; đã đăng nhập -> menu đơn hàng / sổ địa chỉ / đăng xuất */
function AccountMenu() {
  const t = useTranslations("shop.header");
  const ta = useTranslations("shop.account");
  const router = useRouter();
  const { customer } = useCustomer();
  const logout = useCustomerAuth((s) => s.logout);
  if (!customer) {
    return (
      <Link href="/tai-khoan/dang-nhap" className={cn(ICON_BUTTON, "hidden sm:inline-flex")} aria-label={t("account")}>
        <User className="size-5" aria-hidden />
      </Link>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(ICON_BUTTON, "hidden sm:inline-flex")} aria-label={ta("menu")}>
        <span className="flex size-7 items-center justify-center rounded-full bg-[var(--shop-ink)] text-xs font-bold text-white" aria-hidden>
          {customer.name.trim().split(/\s+/).pop()?.[0]?.toUpperCase()}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("shop-theme w-56", archivo.variable)}>
        <DropdownMenuLabel className="truncate">{ta("hello", { name: customer.name })}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/tai-khoan/don-hang">
            <Package />
            {ta("orders")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/tai-khoan/dia-chi">
            <MapPin />
            {ta("addresses")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            logout();
            toast.success(ta("loggedOut"));
            router.push("/");
          }}
        >
          <LogOut />
          {ta("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Tài khoản trong menu trượt (mobile không có icon tài khoản trên header) */
function MobileAccountLinks({ onNavigate }: { onNavigate: () => void }) {
  const ta = useTranslations("shop.account");
  const { customer } = useCustomer();
  const links = customer
    ? [
        { href: "/tai-khoan/don-hang", label: ta("orders"), icon: Package },
        { href: "/tai-khoan/dia-chi", label: ta("addresses"), icon: MapPin },
      ]
    : [{ href: "/tai-khoan/dang-nhap", label: ta("loginTitle"), icon: User }];
  return (
    <ul className="mt-auto border-t border-[var(--c-border)] px-4 py-2">
      {links.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <Link href={href} onClick={onNavigate} className="flex items-center gap-2 py-2.5 text-sm font-medium">
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Header storefront: dính đầu trang. Desktop: logo · tìm kiếm có gợi ý · tài khoản · giỏ hàng + menu danh mục (mega menu).
 * Mobile: menu (Sheet trái) · logo · tìm kiếm (mở hàng ô nhập) · giỏ hàng.
 * Giỏ hàng: badge số lượng + ngăn kéo. Tài khoản: đăng nhập / menu tài khoản khách.
 */
export function ShopHeader() {
  const t = useTranslations("shop.header");
  const tc = useTranslations("shop.cart");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const openCart = useCartStore((s) => s.openDrawer);
  const storedCount = useCartStore(selectItemCount);
  // Số lượng giỏ đọc từ localStorage -> chỉ hiện sau khi mount (khớp HTML server)
  const cartCount = useMounted() ? storedCount : 0;
  useCartTabSync();

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
          <AccountMenu />
          <button type="button" className={cn(ICON_BUTTON, "relative")} aria-label={cartCount ? tc("openCart", { count: cartCount }) : t("cart")} onClick={openCart}>
            <ShoppingBag className="size-5" aria-hidden />
            {cartCount > 0 && (
              <span className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--shop-primary)] px-1 text-[10px] font-bold text-white tabular-nums" aria-hidden>
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
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
          <MobileAccountLinks onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
      <CartDrawer />
    </header>
  );
}
