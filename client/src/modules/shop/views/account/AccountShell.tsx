"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { LogOut, MapPin, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCustomer } from "../../hooks/useCustomer";
import { useCustomerAuth } from "../../stores/useCustomerAuth";
import { Container } from "../../components/ui";

const NAV = [
  { href: "/tai-khoan/don-hang", key: "orders", icon: Package },
  { href: "/tai-khoan/dia-chi", key: "addresses", icon: MapPin },
] as const;

/** Khung trang tài khoản khách: chưa đăng nhập -> sang trang đăng nhập (kèm ?next= để quay lại); vừa đăng xuất -> trang chủ. */
export function AccountShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("shop.account");
  const router = useRouter();
  const pathname = usePathname();
  const { ready, customer } = useCustomer();
  const logout = useCustomerAuth((s) => s.logout);

  // Vừa đăng xuất (từ đây hoặc menu header) -> về trang chủ; chưa từng đăng nhập -> sang trang đăng nhập
  const hadCustomer = useRef(false);
  useEffect(() => {
    if (!ready) return;
    if (customer) {
      hadCustomer.current = true;
      return;
    }
    router.replace(hadCustomer.current ? "/" : `/tai-khoan/dang-nhap?next=${encodeURIComponent(pathname)}`);
  }, [customer, pathname, ready, router]);

  if (!ready || !customer) {
    return (
      <Container className="py-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-64 rounded-[6px]" />
      </Container>
    );
  }

  return (
    <Container className="py-6 lg:py-10">
      <p className="text-sm text-[var(--c-text-secondary)]">{t("hello", { name: customer.name })}</p>
      <div className="mt-4 grid items-start gap-6 lg:grid-cols-[220px_1fr] lg:gap-8">
        <nav aria-label={t("menu")} className="rounded-[6px] bg-white p-2">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {NAV.map(({ href, key, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href} className="shrink-0">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[4px] px-3 py-2.5 text-sm font-medium",
                      active ? "bg-[var(--shop-muted)] text-[var(--shop-ink)]" : "text-[var(--c-text-secondary)] hover:bg-[var(--shop-muted)]",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {t(key)}
                  </Link>
                </li>
              );
            })}
            <li className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  logout();
                  toast.success(t("loggedOut"));
                  router.replace("/");
                }}
                className="flex w-full items-center gap-2.5 rounded-[4px] px-3 py-2.5 text-sm font-medium text-[var(--c-text-secondary)] hover:bg-[var(--shop-muted)]"
              >
                <LogOut className="size-4" aria-hidden />
                {t("logout")}
              </button>
            </li>
          </ul>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
