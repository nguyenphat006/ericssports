import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginView } from "@/modules/shop/views/account/AuthViews";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop.account");
  return { title: t("loginTitle"), robots: { index: false, follow: false } };
}

export default async function LoginPage({ searchParams }: Props) {
  const next = (await searchParams).next;
  return <LoginView next={typeof next === "string" ? next : undefined} />;
}
