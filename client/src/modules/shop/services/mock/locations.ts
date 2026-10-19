import type { Province, Ward } from "../../types";
import type { LocationService } from "../types";

/**
 * Địa giới hành chính 2 cấp (sau 01/07/2025): file tĩnh trong public/shop/locations
 * (nguồn + ngày lấy ghi trong provinces.json). Phường/xã tải theo tỉnh đang chọn.
 * Dữ liệu tĩnh, dùng chung cho mock và bản thật.
 */
const BASE = "/shop/locations";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Không tải được ${url} (${res.status})`);
  return (await res.json()) as T;
}

export const staticLocationService: LocationService = {
  async listProvinces() {
    const data = await getJson<{ provinces: Province[] }>(`${BASE}/provinces.json`);
    return data.provinces;
  },
  async listWards(provinceCode) {
    return getJson<Ward[]>(`${BASE}/wards/${provinceCode}.json`);
  },
};
