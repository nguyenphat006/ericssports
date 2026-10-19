import { z } from "zod";
import { isVietnamesePhone } from "./validation";

/**
 * Kiểm tra form thanh toán. `message` là khóa i18n trong `shop.checkout.errors` (dịch lúc hiển thị).
 * Địa chỉ 2 cấp (tỉnh -> phường/xã, sau 01/07/2025).
 */
export const addressFieldsSchema = z.object({
  provinceCode: z.number().int().positive({ message: "provinceRequired" }),
  wardCode: z.number().int().positive({ message: "wardRequired" }),
  street: z.string().trim().min(3, { message: "streetRequired" }).max(200, { message: "streetRequired" }),
});

export const checkoutSchema = addressFieldsSchema.extend({
  name: z.string().trim().min(2, { message: "nameRequired" }).max(80, { message: "nameRequired" }),
  phone: z.string().trim().refine(isVietnamesePhone, { message: "phoneInvalid" }),
  email: z.union([z.literal(""), z.email({ message: "emailInvalid" })]),
  shippingMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["cod", "bank_transfer", "vnpay", "momo"]),
  note: z.string().trim().max(500, { message: "noteTooLong" }),
});

export type CheckoutFormValues = z.input<typeof checkoutSchema>;

export const CHECKOUT_DEFAULTS: CheckoutFormValues = {
  name: "",
  phone: "",
  email: "",
  provinceCode: 0,
  wardCode: 0,
  street: "",
  shippingMethod: "standard",
  paymentMethod: "cod",
  note: "",
};

export type CheckoutErrorKey = "nameRequired" | "phoneInvalid" | "emailInvalid" | "provinceRequired" | "wardRequired" | "streetRequired" | "noteTooLong";
