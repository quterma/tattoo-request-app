import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { forgotPasswordAction } from "./actions"
import { ForgotPasswordForm } from "./ForgotPasswordForm"

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { locale } = await params
  const { error } = await searchParams
  const t = await getTranslations({ locale, namespace: "admin" })

  const action = forgotPasswordAction.bind(null, locale)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-foreground">{t("forgotPasswordTitle")}</h1>
        <ForgotPasswordForm
          action={action}
          showExpiredLinkError={error === "reset"}
          emailLabel={t("emailLabel")}
          sendResetLinkButton={t("sendResetLinkButton")}
          sendResetLinkButtonLoading={t("sendResetLinkButtonLoading")}
          resetLinkSentMessage={t("resetLinkSentMessage")}
          resetLinkExpiredMessage={t("resetLinkExpiredMessage")}
        />
        <Link
          href={`/${locale}/admin/login`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("backToSignIn")}
        </Link>
      </div>
    </div>
  )
}
