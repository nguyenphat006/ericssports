import { cn } from "@/lib/utils";
import { Container } from "@/modules/shop/components/ui";
import { RichText } from "../../richtext/RichText";
import type { BlockComponent } from "../types";
import type { RichTextBlockProps } from "./schema";

export const RichTextBlock: BlockComponent<RichTextBlockProps> = ({ props }) => (
  <section className="py-8 lg:py-12">
    <Container>
      <div className={cn(props.width === "narrow" && "max-w-[720px]")}>
        {props.title && <h2 className="shop-display mb-6 text-[28px] lg:text-[40px]">{props.title}</h2>}
        <RichText doc={props.doc} />
      </div>
    </Container>
  </section>
);
