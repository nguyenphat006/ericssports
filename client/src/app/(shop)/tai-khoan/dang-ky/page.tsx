import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RegisterView } from "@/modules/shop/views/account/AuthViews";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop.account");
  return { title: t("registerTitle"), robots: { index: false, follow: false } };
}

export default async function RegisterPage({ searchParams }: Props) {
  const next = (await searchParams).next;
  return <RegisterView next={typeof next === "string" ? next : undefined} />;
}
