"use client";

import { useMemo } from "react";
import { Controller, useFormContext, type FieldValues, type Path, type PathValue } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Combobox } from "@/components/controls/Combobox";
import { cn } from "@/lib/utils";
import { archivo } from "../../fonts";
import { useProvinces, useWards } from "../../hooks/useShopQueries";
import { SHOP_INPUT, ShopField } from "./ShopField";

/** Tên ô của cụm địa chỉ trong form cha */
export interface AddressFieldValues extends FieldValues {
  provinceCode: number;
  wardCode: number;
  street: string;
}

const PICKER = "min-h-11 rounded-[4px] bg-white";

/**
 * Cụm địa chỉ 2 cấp (tỉnh -> phường/xã, sau 01/07/2025) + số nhà. Cả hai ô chọn gõ tìm không dấu;
 * phường/xã chỉ tải danh sách của tỉnh đang chọn. Dùng trong form thanh toán và sổ địa chỉ.
 */
export function AddressFields<T extends AddressFieldValues>({ idPrefix, onProvinceChange }: { idPrefix: string; onProvinceChange?: (code: number) => void }) {
  const t = useTranslations("shop.checkout");
  const { control, register, setValue, watch, formState } = useFormContext<T>();
  const provinceField = "provinceCode" as Path<T>;
  const wardField = "wardCode" as Path<T>;
  const provinceCode = watch(provinceField) as number;
  const { data: provinces } = useProvinces();
  const { data: wards, isFetching: wardsLoading } = useWards(provinceCode || null);
  const provinceOptions = useMemo(() => (provinces ?? []).map((p) => ({ value: String(p.code), label: p.name })), [provinces]);
  const wardOptions = useMemo(() => (wards ?? []).map((w) => ({ value: String(w.code), label: w.name })), [wards]);
  const errors = formState.errors as Record<string, { message?: string } | undefined>;
  const themed = cn("shop-theme", archivo.variable);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Controller
        control={control}
        name={provinceField}
        render={({ field }) => (
          <ShopField id={`${idPrefix}-province`} label={t("province")} error={errors.provinceCode?.message}>
            <Combobox
              options={provinceOptions}
              value={field.value ? String(field.value) : null}
              onChange={(v) => {
                const code = v ? Number(v) : 0;
                field.onChange(code);
                // Đổi tỉnh -> phường/xã cũ không còn hợp lệ
                setValue(wardField, 0 as PathValue<T, Path<T>>, { shouldDirty: true });
                onProvinceChange?.(code);
              }}
              placeholder={t("province")}
              loading={!provinces}
              contentClassName={themed}
              className={PICKER}
            />
          </ShopField>
        )}
      />
      <Controller
        control={control}
        name={wardField}
        render={({ field }) => (
          <ShopField id={`${idPrefix}-ward`} label={t("ward")} error={errors.wardCode?.message}>
            <Combobox
              options={wardOptions}
              value={field.value ? String(field.value) : null}
              onChange={(v) => field.onChange(v ? Number(v) : 0)}
              placeholder={provinceCode ? t("wardPlaceholder") : t("wardFirst")}
              disabled={!provinceCode}
              loading={wardsLoading}
              contentClassName={themed}
              className={PICKER}
            />
          </ShopField>
        )}
      />
      <ShopField id={`${idPrefix}-street`} label={t("street")} error={errors.street?.message} className="sm:col-span-2">
        <input className={SHOP_INPUT} placeholder={t("streetPlaceholder")} autoComplete="street-address" {...register("street" as Path<T>)} />
      </ShopField>
    </div>
  );
}
