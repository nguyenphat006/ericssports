"use client";

import { create } from "zustand";
import { STORAGE_KEYS } from "@/config/app";
import { ADMIN_BASE, isAdminPath } from "@/config/routes";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
/** Khu vực đang hiển thị: chỉ trang quản trị theo lựa chọn sáng / tối; storefront luôn sáng */
export type ThemeArea = "admin" | "shop";

interface ThemeState {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  /** Đọc lựa chọn đã lưu sau khi mount (server luôn render "light" để tránh hydration mismatch) */
  hydrate: () => void;
  /** Đồng bộ lại khi hệ điều hành đổi sáng/tối (chế độ "system") */
  syncSystem: () => void;
  /** Layout khu vực gọi khi mount (điều hướng client admin <-> shop không tải lại trang) */
  setArea: (area: ThemeArea) => void;
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return mode;
}

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEYS.themeMode);
  return stored === "dark" || stored === "system" || stored === "light" ? stored : "light";
}

let currentArea: ThemeArea = typeof window !== "undefined" && isAdminPath(window.location.pathname) ? "admin" : "shop";

function applyToDocument(resolved: ResolvedTheme) {
  if (typeof document !== "undefined") document.documentElement.dataset.theme = currentArea === "admin" ? resolved : "light";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "light",
  resolved: "light",
  hydrate: () => {
    const mode = readStoredMode();
    const resolved = resolve(mode);
    applyToDocument(resolved);
    set({ mode, resolved });
  },
  setMode: (mode) => {
    const resolved = resolve(mode);
    window.localStorage.setItem(STORAGE_KEYS.themeMode, mode);
    applyToDocument(resolved);
    set({ mode, resolved });
  },
  syncSystem: () => {
    if (get().mode !== "system") return;
    const resolved = resolve("system");
    applyToDocument(resolved);
    set({ resolved });
  },
  setArea: (area) => {
    currentArea = area;
    applyToDocument(get().resolved);
  },
}));

/**
 * Script chạy trước khi React hydrate: gán data-theme cho <html> để không bị nháy trắng khi F5 ở chế độ tối.
 * Ngoài khu quản trị luôn "light". Phải đồng bộ logic với readStoredMode/resolve/applyToDocument ở trên.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=location.pathname;if(p!=='${ADMIN_BASE}'&&p.indexOf('${ADMIN_BASE}/')!==0){document.documentElement.dataset.theme='light';return;}var m=localStorage.getItem('${STORAGE_KEYS.themeMode}')||'light';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`;
