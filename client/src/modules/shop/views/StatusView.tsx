import Link from "next/link";
import { Container, ShopButton } from "../components/ui";

interface StatusViewProps {
  code: string;
  title: string;
  text: string;
  homeLabel: string;
  /** Nút phụ (vd. "Thử lại" ở trang lỗi) */
  action?: React.ReactNode;
}

/** Trang trạng thái storefront (404 / lỗi) — nằm trong khung header + footer. */
export function StatusView({ code, title, text, homeLabel, action }: StatusViewProps) {
  return (
    <Container className="flex flex-col items-start py-16 lg:py-24">
      <p className="shop-display text-[96px] text-[var(--shop-primary-bright)] lg:text-[160px]" aria-hidden>
        {code}
      </p>
      <h1 className="shop-display mt-2 text-[32px] lg:text-[48px]">{title}</h1>
      <p className="mt-3 max-w-md text-[var(--c-text-secondary)]">{text}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {action}
        <ShopButton asChild size="lg">
          <Link href="/">{homeLabel}</Link>
        </ShopButton>
      </div>
    </Container>
  );
}
