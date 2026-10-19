import { priceCart } from "../lib/pricing";
import { findMockProduct, mockCatalogService } from "./mock/catalog";
import { mockCustomerService } from "./mock/customers";
import { staticLocationService } from "./mock/locations";
import { mockOrderService } from "./mock/orders";
import type { CatalogService, CustomerService, LocationService, OrderService, PricingService } from "./types";

/**
 * Chọn cài đặt lớp dữ liệu theo NEXT_PUBLIC_DATA_SOURCE ("mock" mặc định).
 * GĐ4 thêm services/api/* và nhánh "api" ở đây — component / hook không cần sửa.
 */
export const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";

const mockPricingService: PricingService = {
  async priceCart(lines, ctx) {
    return priceCart(lines, findMockProduct, ctx);
  },
};

export const catalogService: CatalogService = mockCatalogService;
export const pricingService: PricingService = mockPricingService;
export const orderService: OrderService = mockOrderService;
export const customerService: CustomerService = mockCustomerService;
export const locationService: LocationService = staticLocationService;

export * from "./types";
