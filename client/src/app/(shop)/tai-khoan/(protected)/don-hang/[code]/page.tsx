import { AccountOrderDetailView } from "@/modules/shop/views/account/AccountOrdersView";

type Props = { params: Promise<{ code: string }> };

export default async function AccountOrderPage({ params }: Props) {
  const { code } = await params;
  return <AccountOrderDetailView code={decodeURIComponent(code)} />;
}
