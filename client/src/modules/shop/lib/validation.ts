/** Chuẩn hóa số điện thoại: bỏ khoảng trắng, dấu chấm, gạch; +84 -> 0 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/[\s.\-()]/g, "");
  return digits.startsWith("+84") ? `0${digits.slice(3)}` : digits;
}

/** Số di động (03/05/07/08/09 + 8 số) hoặc cố định (02 + 9 số) Việt Nam */
export function isVietnamesePhone(input: string): boolean {
  return /^0(2\d{9}|[35789]\d{8})$/.test(normalizePhone(input));
}
