"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { isVietnamesePhone } from "../../lib/validation";
import { customerService, ShopServiceError } from "../../services";
import { useCustomerAuth } from "../../stores/useCustomerAuth";
import { safeNextPath } from "../../hooks/useCustomer";
import { Container, ShopButton } from "../../components/ui";
import { SHOP_INPUT } from "../../components/form/ShopField";

type ErrorKey =
  | "identifierRequired"
  | "identifierInvalid"
  | "passwordRequired"
  | "passwordMin"
  | "passwordMismatch"
  | "nameRequired"
  | "invalidCredentials"
  | "alreadyExists"
  | "generic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isIdentifier = (v: string) => EMAIL.test(v.trim()) || isVietnamesePhone(v);

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-[var(--c-error)]">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordInput({ id, invalid, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { id: string; invalid: boolean }) {
  const t = useTranslations("shop.account");
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={show ? "text" : "password"} className={`${SHOP_INPUT} pr-11`} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined} {...rest} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? t("hidePassword") : t("showPassword")}
        className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center text-[var(--c-text-tertiary)] hover:text-[var(--shop-ink)]"
      >
        {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  );
}

function AuthCard({ title, intro, children, footer }: { title: string; intro: string; children: React.ReactNode; footer: React.ReactNode }) {
  const t = useTranslations("shop.account");
  return (
    <Container className="flex justify-center py-10 lg:py-16">
      <div className="w-full max-w-md rounded-[6px] bg-white p-6 lg:p-8">
        <h1 className="shop-display text-[32px]">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-[var(--c-text-secondary)]">{intro}</p>
        {children}
        <div className="mt-6 space-y-2 border-t border-[var(--c-border)] pt-4 text-center text-sm">{footer}</div>
        <p className="mt-3 text-center text-[11px] text-[var(--c-text-tertiary)]">{t("mockNote")}</p>
      </div>
    </Container>
  );
}

/** Thẻ <link> trong chuỗi i18n (t.rich) -> Link nội bộ */
function linkTag(href: string) {
  return function RichLink(chunks: React.ReactNode) {
    return (
      <Link href={href} className="font-semibold text-[var(--shop-primary)] hover:underline">
        {chunks}
      </Link>
    );
  };
}

/** Đăng nhập khách (email hoặc SĐT + mật khẩu). `next`: quay lại trang đang dở (vd. thanh toán). */
export function LoginView({ next }: { next?: string }) {
  const t = useTranslations("shop.account");
  const te = useTranslations("shop.account.errors");
  const router = useRouter();
  const setCustomer = useCustomerAuth((s) => s.setCustomer);
  const [formError, setFormError] = useState<ErrorKey | null>(null);
  const { register, handleSubmit, formState } = useForm({ defaultValues: { identifier: "", password: "" } });
  const errors = formState.errors;
  const target = safeNextPath(next);

  const onSubmit = handleSubmit(async ({ identifier, password }) => {
    setFormError(null);
    try {
      setCustomer(await customerService.login(identifier, password));
      router.replace(target);
    } catch (err) {
      setFormError(err instanceof ShopServiceError && err.code === "invalid_credentials" ? "invalidCredentials" : "generic");
    }
  });

  return (
    <AuthCard
      title={t("loginTitle")}
      intro={t("loginIntro")}
      footer={
        <>
          <p>{t.rich("noAccount", { link: linkTag(`/tai-khoan/dang-ky${next ? `?next=${encodeURIComponent(target)}` : ""}`) })}</p>
          <p className="text-xs text-[var(--c-text-secondary)]">{t("guestNote")}</p>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && (
          <p role="alert" className="rounded-[4px] bg-[var(--c-error-bg)] p-3 text-sm font-medium text-[var(--c-error)]">
            {te(formError)}
          </p>
        )}
        <Field id="login-identifier" label={t("identifier")} error={errors.identifier ? te(errors.identifier.message as ErrorKey) : undefined}>
          <input
            id="login-identifier"
            className={SHOP_INPUT}
            autoComplete="username"
            aria-invalid={errors.identifier ? true : undefined}
            aria-describedby={errors.identifier ? "login-identifier-error" : undefined}
            {...register("identifier", { required: "identifierRequired", validate: (v) => isIdentifier(v) || "identifierInvalid" })}
          />
        </Field>
        <Field id="login-password" label={t("password")} error={errors.password ? te(errors.password.message as ErrorKey) : undefined}>
          <PasswordInput id="login-password" invalid={!!errors.password} autoComplete="current-password" {...register("password", { required: "passwordRequired" })} />
        </Field>
        <ShopButton type="submit" size="lg" className="w-full" loading={formState.isSubmitting}>
          {t("submitLogin")}
        </ShopButton>
      </form>
    </AuthCard>
  );
}

/** Tạo tài khoản khách; xong thì đăng nhập luôn. */
export function RegisterView({ next }: { next?: string }) {
  const t = useTranslations("shop.account");
  const te = useTranslations("shop.account.errors");
  const router = useRouter();
  const setCustomer = useCustomerAuth((s) => s.setCustomer);
  const [formError, setFormError] = useState<ErrorKey | null>(null);
  const { register, handleSubmit, formState, getValues } = useForm({ defaultValues: { name: "", identifier: "", password: "", confirm: "" } });
  const errors = formState.errors;
  const target = safeNextPath(next);
  const msg = (e?: { message?: string }) => (e?.message ? te(e.message as ErrorKey) : undefined);

  const onSubmit = handleSubmit(async ({ name, identifier, password }) => {
    setFormError(null);
    try {
      setCustomer(await customerService.register({ name, identifier, password }));
      router.replace(target);
    } catch (err) {
      setFormError(err instanceof ShopServiceError && err.code === "already_exists" ? "alreadyExists" : "generic");
    }
  });

  const aria = (field: "name" | "identifier", id: string) => ({ "aria-invalid": errors[field] ? true : undefined, "aria-describedby": errors[field] ? `${id}-error` : undefined });

  return (
    <AuthCard
      title={t("registerTitle")}
      intro={t("registerIntro")}
      footer={<p>{t.rich("hasAccount", { link: linkTag(`/tai-khoan/dang-nhap${next ? `?next=${encodeURIComponent(target)}` : ""}`) })}</p>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && (
          <p role="alert" className="rounded-[4px] bg-[var(--c-error-bg)] p-3 text-sm font-medium text-[var(--c-error)]">
            {te(formError)}
          </p>
        )}
        <Field id="reg-name" label={t("name")} error={msg(errors.name)}>
          <input id="reg-name" className={SHOP_INPUT} autoComplete="name" {...aria("name", "reg-name")} {...register("name", { validate: (v) => v.trim().length >= 2 || "nameRequired" })} />
        </Field>
        <Field id="reg-identifier" label={t("identifier")} error={msg(errors.identifier)}>
          <input
            id="reg-identifier"
            className={SHOP_INPUT}
            autoComplete="username"
            {...aria("identifier", "reg-identifier")}
            {...register("identifier", { required: "identifierRequired", validate: (v) => isIdentifier(v) || "identifierInvalid" })}
          />
        </Field>
        <Field id="reg-password" label={t("password")} error={msg(errors.password)}>
          <PasswordInput id="reg-password" invalid={!!errors.password} autoComplete="new-password" {...register("password", { minLength: { value: 8, message: "passwordMin" }, required: "passwordMin" })} />
        </Field>
        <Field id="reg-confirm" label={t("confirmPassword")} error={msg(errors.confirm)}>
          <PasswordInput
            id="reg-confirm"
            invalid={!!errors.confirm}
            autoComplete="new-password"
            {...register("confirm", { validate: (v) => v === getValues("password") || "passwordMismatch" })}
          />
        </Field>
        <ShopButton type="submit" size="lg" className="w-full" loading={formState.isSubmitting}>
          {t("submitRegister")}
        </ShopButton>
      </form>
    </AuthCard>
  );
}
