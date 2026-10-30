import Link from "next/link";
import { Award, ChevronRight, Clock, CreditCard, Headset, RefreshCw, ShieldCheck, Truck, Wrench, type ShopIcon } from "@/modules/shop/components/icons";
import { Container } from "@/modules/shop/components/ui";
import type { BlockComponent } from "../types";
import type { UspIcon, UspStripProps } from "./schema";

const ICONS: Record<UspIcon, ShopIcon> = {
  truck: Truck,
  wrench: Wrench,
  shield: ShieldCheck,
  refresh: RefreshCw,
  card: CreditCard,
  headset: Headset,
  award: Award,
  clock: Clock,
};

/** Dải cam kết ngay dưới hero (tạo niềm tin): icon duotone trong ô tròn; mục có `href` bấm được cả ô (link phủ) */
export const UspStrip: BlockComponent<UspStripProps> = ({ props }) => (
  <section className="border-y border-[var(--c-border)] bg-white">
    <Container>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-5 py-6 lg:grid-cols-4 lg:gap-6">
        {props.items.map((item, i) => {
          const Icon = ICONS[item.icon];
          return (
            <li key={i} className="group relative flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--shop-muted)] text-[var(--shop-primary)]">
                <Icon weight="duotone" className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--shop-ink)]">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="outline-none after:absolute after:inset-0 after:rounded-[6px] group-hover:text-[var(--shop-primary)] focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
                    >
                      {item.title}
                      <ChevronRight className="ml-0.5 hidden size-3.5 align-[-2px] lg:inline" />
                    </Link>
                  ) : (
                    item.title
                  )}
                </p>
                {item.text && <p className="mt-0.5 text-xs text-[var(--c-text-secondary)]">{item.text}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </Container>
  </section>
);
