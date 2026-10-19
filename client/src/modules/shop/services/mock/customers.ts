import { isVietnamesePhone, normalizePhone } from "../../lib/validation";
import type { Address, Customer } from "../../types";
import { ShopServiceError, type CustomerService } from "../types";
import { delay, hashPassword, randomId, readStore, writeStore } from "./storage";

/**
 * Tài khoản khách MOCK (tách hẳn tài khoản nhân viên). GĐ4 thay bằng API + phiên đăng nhập thật.
 * Mật khẩu chỉ lưu dạng băm SHA-256.
 */

interface StoredCustomer extends Customer {
  passwordHash: string;
}

const USERS_KEY = "customers";
const ADDRESSES_KEY = "addresses";

function normalizeIdentifier(identifier: string): { email?: string; phone?: string } {
  const value = identifier.trim();
  return isVietnamesePhone(value) ? { phone: normalizePhone(value) } : { email: value.toLowerCase() };
}

function findUser(users: StoredCustomer[], identifier: string): StoredCustomer | undefined {
  const id = normalizeIdentifier(identifier);
  return users.find((u) => (id.phone && u.phone === id.phone) || (id.email && u.email === id.email));
}

function publicCustomer(user: StoredCustomer): Customer {
  const { id, name, email, phone } = user;
  return { id, name, ...(email && { email }), ...(phone && { phone }) };
}

function loadAddresses(customerId: string): Address[] {
  return readStore<Record<string, Address[]>>(ADDRESSES_KEY, {})[customerId] ?? [];
}

function saveAddresses(customerId: string, list: Address[]) {
  writeStore(ADDRESSES_KEY, { ...readStore<Record<string, Address[]>>(ADDRESSES_KEY, {}), [customerId]: list });
}

export const mockCustomerService: CustomerService = {
  async register({ name, identifier, password }) {
    await delay(500);
    const users = readStore<StoredCustomer[]>(USERS_KEY, []);
    if (findUser(users, identifier)) throw new ShopServiceError("already_exists");
    const user: StoredCustomer = { id: randomId("cus"), name: name.trim(), ...normalizeIdentifier(identifier), passwordHash: await hashPassword(password) };
    writeStore(USERS_KEY, [...users, user]);
    return publicCustomer(user);
  },

  async login(identifier, password) {
    await delay(500);
    const user = findUser(readStore<StoredCustomer[]>(USERS_KEY, []), identifier);
    if (!user || user.passwordHash !== (await hashPassword(password))) throw new ShopServiceError("invalid_credentials");
    return publicCustomer(user);
  },

  async listAddresses(customerId) {
    await delay();
    return loadAddresses(customerId).sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  },

  async saveAddress(customerId, input, id) {
    await delay();
    let list = loadAddresses(customerId);
    const makeDefault = input.isDefault || list.length === 0;
    if (makeDefault) list = list.map((a) => ({ ...a, isDefault: false }));
    const existing = id ? list.find((a) => a.id === id) : undefined;
    const saved: Address = {
      ...input,
      phone: normalizePhone(input.phone),
      id: existing?.id ?? randomId("addr"),
      isDefault: makeDefault || (existing?.isDefault ?? false),
    };
    list = existing ? list.map((a) => (a.id === saved.id ? saved : a)) : [...list, saved];
    saveAddresses(customerId, list);
    return saved;
  },

  async deleteAddress(customerId, id) {
    await delay();
    const list = loadAddresses(customerId).filter((a) => a.id !== id);
    if (list.length && !list.some((a) => a.isDefault)) list[0] = { ...list[0], isDefault: true };
    saveAddresses(customerId, list);
  },

  async setDefaultAddress(customerId, id) {
    await delay();
    saveAddresses(
      customerId,
      loadAddresses(customerId).map((a) => ({ ...a, isDefault: a.id === id })),
    );
  },
};
