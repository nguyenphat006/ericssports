import * as React from "react";
import { cn } from "@/lib/utils";

/** Khung nội dung storefront: rộng tối đa 1280px, lề 16px (mobile) / 24px (desktop). */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[var(--shop-container)] px-4 lg:px-6", className)} {...props} />;
}
