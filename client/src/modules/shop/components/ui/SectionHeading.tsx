import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: React.ReactNode;
  /** Dòng nhỏ phía trên tiêu đề */
  eyebrow?: React.ReactNode;
  /** Hành động bên phải (vd. link "Xem tất cả") */
  action?: React.ReactNode;
  /** Thẻ tiêu đề — mặc định h2 */
  as?: "h1" | "h2" | "h3";
  className?: string;
}

/** Tiêu đề khối nội dung storefront: chữ display + hành động bên phải. */
export function SectionHeading({ title, eyebrow, action, as: Tag = "h2", className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4 lg:mb-6", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="shop-eyebrow mb-1 text-[var(--shop-primary)]">{eyebrow}</p>}
        <Tag className="shop-display text-[28px] lg:text-[40px]">{title}</Tag>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
