import { Archivo } from "next/font/google";

/**
 * Font storefront: Archivo variable (trục wght + wdth). Bắt buộc subset "vietnamese" (dấu dựng sẵn U+1EA0–1EF9, ₫).
 * Gắn `archivo.variable` lên wrapper shop và lên nội dung portal (Sheet, Popover...) để có biến --font-archivo.
 */
export const archivo = Archivo({
  subsets: ["vietnamese", "latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
