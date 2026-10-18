import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const shopButtonVariants = cva("rounded-[4px] font-semibold transition-colors", {
  variants: {
    variant: {
      /** Nút chính: nền đỏ, chữ display in hoa */
      primary: "shop-display-soft bg-[var(--shop-primary)] text-white hover:bg-[var(--shop-primary-hover)]",
      /** Nút phụ viền đỏ (vd. "Thêm vào giỏ" cạnh "Mua ngay") */
      outline:
        "border-[1.5px] border-[var(--shop-primary)] bg-white text-[var(--shop-primary)] hover:bg-[var(--c-primary-bg)]",
      /** Nút nền đen (trên nền đỏ / ảnh) */
      ink: "bg-[var(--shop-ink)] text-white hover:bg-[var(--shop-ink-soft)]",
      /** Nút viền đen trên nền sáng */
      "outline-ink": "border-[1.5px] border-[var(--shop-ink)] bg-transparent text-[var(--shop-ink)] hover:bg-[var(--shop-muted)]",
      ghost: "bg-transparent text-[var(--shop-ink)] hover:bg-[var(--shop-muted)]",
    },
    size: {
      sm: "h-9 px-3 text-[13px]",
      md: "h-11 px-5 text-sm",
      lg: "h-12 px-6 text-[15px]",
      icon: "size-10 p-0",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export interface ShopButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "variant" | "size">,
    VariantProps<typeof shopButtonVariants> {
  /** Đang xử lý: hiện spinner, chặn bấm lặp */
  loading?: boolean;
}

/** Nút storefront (bọc shadcn Button, nhận token Ember). */
export function ShopButton({ variant, size, loading = false, disabled, className, children, asChild, ...props }: ShopButtonProps) {
  return (
    <Button
      {...props}
      asChild={asChild}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(shopButtonVariants({ variant, size }), className)}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="animate-spin" aria-hidden />}
          {children}
        </>
      )}
    </Button>
  );
}
