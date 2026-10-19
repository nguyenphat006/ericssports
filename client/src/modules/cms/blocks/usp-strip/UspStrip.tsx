import { Award, Clock, CreditCard, Headset, RefreshCw, ShieldCheck, Truck, Wrench, type LucideIcon } from "lucide-react";
import { Container } from "@/modules/shop/components/ui";
import type { BlockComponent } from "../types";
import type { UspIcon, UspStripProps } from "./schema";

const ICONS: Record<UspIcon, LucideIcon> = {
  truck: Truck,
  wrench: Wrench,
  shield: ShieldCheck,
  refresh: RefreshCw,
  card: CreditCard,
  headset: Headset,
  award: Award,
  clock: Clock,
};

/** Dải cam kết nền đen ngay dưới hero (tạo niềm tin) */
export const UspStrip: BlockComponent<UspStripProps> = ({ props }) => (
  <section className="bg-[var(--shop-ink)] text-white">
    <Container>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-5 py-6 lg:flex lg:justify-between lg:py-5">
        {props.items.map((item, i) => {
          const Icon = ICONS[item.icon];
          return (
            <li key={i} className="flex items-start gap-3">
              <Icon className="mt-0.5 size-6 shrink-0 text-[var(--shop-primary-bright)]" aria-hidden />
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                {item.text && <p className="text-xs text-[var(--shop-on-ink-secondary)]">{item.text}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </Container>
  </section>
);
