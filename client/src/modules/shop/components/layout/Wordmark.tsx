import { cn } from "@/lib/utils";

/**
 * Logo chữ tạm thời "ERICSSPORTS" (chưa có logo chính thức). GĐ3/4: lấy logo từ cấu hình Giao diện trong CMS.
 * Phần "SPORTS" dùng đỏ tươi — chữ display cỡ lớn nên vẫn đạt tương phản cho chữ lớn.
 */
export function Wordmark({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("shop-display text-[26px] leading-none lg:text-[30px]", inverted ? "text-white" : "text-[var(--shop-ink)]", className)}>
      ERICS<span className="text-[var(--shop-primary-bright)]">SPORTS</span>
    </span>
  );
}
