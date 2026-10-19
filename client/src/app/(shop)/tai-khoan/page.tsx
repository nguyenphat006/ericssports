import { redirect } from "next/navigation";

/** /tai-khoan -> danh sách đơn (trang chính của khu tài khoản) */
export default function AccountIndexPage() {
  redirect("/tai-khoan/don-hang");
}
