import { z } from "zod";
import { addressFieldsSchema } from "./checkoutSchema";
import { isVietnamesePhone } from "./validation";

/** Form sổ địa chỉ: người nhận + SĐT + địa chỉ 2 cấp. Khóa lỗi dùng chung `shop.checkout.errors`. */
export const addressFormSchema = addressFieldsSchema.extend({
  recipient: z.string().trim().min(2, { message: "nameRequired" }).max(80, { message: "nameRequired" }),
  phone: z.string().trim().refine(isVietnamesePhone, { message: "phoneInvalid" }),
  isDefault: z.boolean(),
});

export type AddressFormValues = z.input<typeof addressFormSchema>;

export const ADDRESS_DEFAULTS: AddressFormValues = { recipient: "", phone: "", provinceCode: 0, wardCode: 0, street: "", isDefault: false };
