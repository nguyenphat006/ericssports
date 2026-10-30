"use client";

import { useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Spinner, Search } from "@/modules/shop/components/icons";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";
import { formatPrice } from "../../lib/formatPrice";
import { catalogService } from "../../services";

interface Option {
  id: string;
  href: string;
  kind: "product" | "category" | "all";
  label: string;
  meta?: string;
  image?: { src: string; alt: string };
}

/**
 * Ô tìm kiếm header có gợi ý (combobox ARIA): gõ -> sau 250ms gọi gợi ý (không dấu), ↑ ↓ chọn, Enter mở,
 * Esc đóng. Enter khi không chọn gợi ý -> trang /tim-kiem?q=.
 */
export function SearchBox({ autoFocus = false, onNavigate, className }: { autoFocus?: boolean; onNavigate?: () => void; className?: string }) {
  const t = useTranslations("shop.header");
  const ts = useTranslations("shop.search");
  const router = useRouter();
  const uid = useId();
  const listId = `${uid}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const q = useDebouncedValue(value.trim(), 250);

  const { data, isFetching } = useQuery({
    queryKey: ["shop", "suggest", q],
    queryFn: () => catalogService.suggest(q),
    enabled: q.length >= 1,
    staleTime: 60_000,
  });

  const options = useMemo<Option[]>(() => {
    if (!q || !data) return [];
    return [
      ...data.categories.map((c) => ({ id: `c-${c.id}`, href: c.path, kind: "category" as const, label: c.name })),
      ...data.products.map((p) => ({ id: `p-${p.id}`, href: `/san-pham/${p.slug}`, kind: "product" as const, label: p.name, meta: formatPrice(p.price), image: p.image })),
      { id: "all", href: `/tim-kiem?q=${encodeURIComponent(q)}`, kind: "all" as const, label: ts("viewAllResults", { q }) },
    ];
  }, [data, q, ts]);

  const showList = open && q.length >= 1 && (!!data || isFetching);

  const go = (href: string) => {
    setOpen(false);
    setActive(-1);
    inputRef.current?.blur();
    onNavigate?.();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!options.length) return;
      e.preventDefault();
      setOpen(true);
      setActive((i) => (e.key === "ArrowDown" ? (i + 1) % options.length : (i - 1 + options.length) % options.length));
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
        setActive(-1);
      }
    }
  };

  const categories = options.filter((o) => o.kind === "category");
  const products = options.filter((o) => o.kind === "product");
  const renderOption = (o: Option) => {
    const index = options.indexOf(o);
    return (
      <li
        key={o.id}
        id={`${uid}-${o.id}`}
        role="option"
        aria-selected={index === active}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => go(o.href)}
        onMouseEnter={() => setActive(index)}
        className={cn("flex cursor-pointer items-center gap-3 px-3 py-2 text-sm", index === active && "bg-[var(--shop-muted)]")}
      >
        {o.kind === "product" && o.image && (
          <span className="relative size-10 shrink-0 overflow-hidden rounded-[4px] bg-[var(--shop-muted)]">
            <Image src={o.image.src} alt="" fill sizes="40px" className="object-contain p-1" />
          </span>
        )}
        {o.kind === "category" && <FolderOpen className="size-4 shrink-0 text-[var(--c-text-tertiary)]" aria-hidden />}
        {o.kind === "all" && <Search className="size-4 shrink-0 text-[var(--shop-primary)]" aria-hidden />}
        <span className={cn("min-w-0 flex-1 truncate", o.kind === "all" && "font-semibold text-[var(--shop-primary)]")}>{o.label}</span>
        {o.meta && <span className="shop-price shrink-0 text-[13px] text-[var(--shop-primary)]">{o.meta}</span>}
      </li>
    );
  };

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const text = value.trim();
        if (active >= 0 && options[active]) go(options[active].href);
        else if (text) go(`/tim-kiem?q=${encodeURIComponent(text)}`);
      }}
    >
      <label htmlFor={`${uid}-input`} className="sr-only">
        {t("searchLabel")}
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--c-text-tertiary)]" aria-hidden />
      <input
        ref={inputRef}
        id={`${uid}-input`}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 && options[active] ? `${uid}-${options[active].id}` : undefined}
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder={t("searchPlaceholder")}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className="h-11 w-full rounded-[4px] border border-transparent bg-[var(--shop-muted)] pr-9 pl-9 text-sm text-[var(--shop-ink)] outline-none placeholder:text-[var(--c-text-tertiary)] focus:border-[var(--c-border-strong)] focus:bg-white [&::-webkit-search-cancel-button]:hidden"
      />
      {isFetching && <Spinner className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-[var(--c-text-tertiary)]" aria-hidden />}

      {showList && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-[6px] border border-[var(--c-border)] bg-white py-1 shadow-lg">
          <ul id={listId} role="listbox" aria-label={t("searchLabel")}>
            {categories.length > 0 && (
              <li role="presentation" className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-[var(--c-text-tertiary)] uppercase">
                {ts("suggestCategories")}
              </li>
            )}
            {categories.map(renderOption)}
            {products.length > 0 && (
              <li role="presentation" className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-[var(--c-text-tertiary)] uppercase">
                {ts("suggestProducts")}
              </li>
            )}
            {products.map(renderOption)}
            {data && !categories.length && !products.length && (
              <li role="presentation" className="px-3 py-2 text-sm text-[var(--c-text-secondary)]">
                {ts("noSuggestions", { q })}
              </li>
            )}
            {options.filter((o) => o.kind === "all").map(renderOption)}
          </ul>
        </div>
      )}
    </form>
  );
}
