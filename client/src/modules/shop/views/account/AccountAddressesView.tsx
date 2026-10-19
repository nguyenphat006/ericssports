"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ADDRESS_DEFAULTS, addressFormSchema, type AddressFormValues } from "../../lib/addressSchema";
import { archivo } from "../../fonts";
import { useCustomer } from "../../hooks/useCustomer";
import { useProvinces, useWards } from "../../hooks/useShopQueries";
import { customerService } from "../../services";
import type { Address } from "../../types";
import { ShopBadge, ShopButton } from "../../components/ui";
import { AddressFields } from "../../components/form/AddressFields";
import { SHOP_INPUT, ShopField } from "../../components/form/ShopField";

const THEMED = cn("shop-theme", archivo.variable);

function AddressFormDialog({ open, editing, onClose, onSave }: { open: boolean; editing: Address | null; onClose: () => void; onSave: (values: AddressFormValues, names: { province: string; ward: string }) => Promise<void> }) {
  const t = useTranslations("shop.account");
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    values: editing
      ? { recipient: editing.recipient, phone: editing.phone, provinceCode: editing.provinceCode, wardCode: editing.wardCode, street: editing.street, isDefault: editing.isDefault }
      : ADDRESS_DEFAULTS,
  });
  const [provinceCode, isDefault] = useWatch({ control: form.control, name: ["provinceCode", "isDefault"] });
  const { data: provinces } = useProvinces();
  const { data: wards } = useWards(provinceCode || null);
  const errors = form.formState.errors;

  const submit = form.handleSubmit(async (values) => {
    const province = provinces?.find((p) => p.code === values.provinceCode);
    const ward = wards?.find((w) => w.code === values.wardCode);
    if (!province || !ward) return;
    await onSave(values, { province: province.name, ward: ward.name });
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={cn(THEMED, "max-h-[92vh] max-w-xl overflow-y-auto bg-[var(--shop-bg)]")}>
        <DialogTitle className="shop-display-soft text-xl">{editing ? t("editAddress") : t("addAddress")}</DialogTitle>
        <FormProvider {...form}>
          <form onSubmit={submit} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ShopField id="addr-recipient" label={t("recipient")} error={errors.recipient?.message}>
                <input className={SHOP_INPUT} autoComplete="name" {...form.register("recipient")} />
              </ShopField>
              <ShopField id="addr-phone" label={t("phone")} error={errors.phone?.message}>
                <input className={SHOP_INPUT} type="tel" inputMode="tel" autoComplete="tel" {...form.register("phone")} />
              </ShopField>
            </div>
            <AddressFields<AddressFormValues> idPrefix="addr" />
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={isDefault} onCheckedChange={(v) => form.setValue("isDefault", v === true, { shouldDirty: true })} />
              {t("makeDefault")}
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <ShopButton type="button" variant="ghost" onClick={onClose}>
                {t("cancel")}
              </ShopButton>
              <ShopButton type="submit" loading={form.formState.isSubmitting}>
                {t("save")}
              </ShopButton>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

/** Sổ địa chỉ của khách: thêm / sửa / xóa / đặt mặc định (địa chỉ mặc định gợi ý sẵn ở bước thanh toán). */
export function AccountAddressesView() {
  const t = useTranslations("shop.account");
  const { customer } = useCustomer();
  const queryClient = useQueryClient();
  const key = ["shop", "addresses", customer?.id];
  const { data: addresses, isLoading } = useQuery({ queryKey: key, queryFn: () => customerService.listAddresses(customer!.id), enabled: !!customer });
  const [dialog, setDialog] = useState<{ open: boolean; editing: Address | null }>({ open: false, editing: null });
  const [deleting, setDeleting] = useState<Address | null>(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["shop", "addresses"] });

  const remove = useMutation({
    mutationFn: (id: string) => customerService.deleteAddress(customer!.id, id),
    onSuccess: () => {
      toast.success(t("deleted"));
      void refresh();
    },
  });
  const makeDefault = useMutation({ mutationFn: (id: string) => customerService.setDefaultAddress(customer!.id, id), onSuccess: () => void refresh() });

  const save = async (values: AddressFormValues, names: { province: string; ward: string }) => {
    await customerService.saveAddress(
      customer!.id,
      {
        recipient: values.recipient.trim(),
        phone: values.phone,
        provinceCode: values.provinceCode,
        provinceName: names.province,
        wardCode: values.wardCode,
        wardName: names.ward,
        street: values.street.trim(),
        isDefault: values.isDefault,
      },
      dialog.editing?.id,
    );
    toast.success(t("saved"));
    setDialog({ open: false, editing: null });
    await refresh();
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="shop-display text-[32px] lg:text-[40px]">{t("addresses")}</h1>
        <ShopButton size="sm" onClick={() => setDialog({ open: true, editing: null })}>
          <Plus />
          {t("addAddress")}
        </ShopButton>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 rounded-[6px]" />
      ) : !addresses?.length ? (
        <div className="flex flex-col items-center gap-2 rounded-[6px] bg-white p-8 text-center">
          <MapPin className="size-8 text-[var(--c-text-tertiary)]" aria-hidden />
          <p className="text-sm text-[var(--c-text-secondary)]">{t("addressesEmpty")}</p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className={cn("flex flex-col rounded-[6px] bg-white p-4", a.isDefault && "ring-[1.5px] ring-[var(--shop-primary)]")}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm">
                  <span className="font-semibold">{a.recipient}</span> · {a.phone}
                </p>
                {a.isDefault && <ShopBadge tone="sale">{t("default")}</ShopBadge>}
              </div>
              <p className="mt-1 flex-1 text-sm text-[var(--c-text-secondary)]">
                {a.street}, {a.wardName}, {a.provinceName}
              </p>
              <div className="mt-3 flex flex-wrap gap-1 border-t border-[var(--c-border)] pt-3">
                <ShopButton size="sm" variant="ghost" onClick={() => setDialog({ open: true, editing: a })}>
                  <Pencil />
                  {t("editAddress")}
                </ShopButton>
                {!a.isDefault && (
                  <ShopButton size="sm" variant="ghost" onClick={() => makeDefault.mutate(a.id)}>
                    {t("setDefault")}
                  </ShopButton>
                )}
                <ShopButton size="sm" variant="ghost" className="ml-auto text-[var(--c-error)]" onClick={() => setDeleting(a)}>
                  <Trash2 />
                  {t("deleteAddress")}
                </ShopButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddressFormDialog open={dialog.open} editing={dialog.editing} onClose={() => setDialog({ open: false, editing: null })} onSave={save} />

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent className={THEMED}>
          <AlertDialogTitle>{t("deleteConfirm")}</AlertDialogTitle>
          {deleting && (
            <p className="text-sm text-[var(--c-text-secondary)]">
              {deleting.street}, {deleting.wardName}, {deleting.provinceName}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--c-error)] hover:bg-[var(--c-error)]/90"
              onClick={() => {
                if (deleting) remove.mutate(deleting.id);
                setDeleting(null);
              }}
            >
              {t("deleteAddress")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
