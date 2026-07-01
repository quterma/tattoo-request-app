import Link from "next/link"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { getOptionalUser } from "@/services/auth"
import { resetPasswordAction } from "./actions"
import { ResetPasswordForm } from "./ResetPasswordForm"

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const cookieStore = await cookies()
  const t = await getTranslations({ locale, namespace: "admin" })

  const user = await getOptionalUser({
    getAll: () => cookieStore.getAll(),
    setAll: () => {},
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <h1 className="text-xl font-semibold text-foreground">
            {t("resetPasswordExpiredTitle")}
          </h1>
          <p className="text-sm text-foreground">{t("resetPasswordExpiredMessage")}</p>
          <Link
            href={`/${locale}/admin/forgot-password`}
            className="rounded-md bg-foreground px-6 py-3 text-center text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
          >
            {t("requestNewLinkButton")}
          </Link>
        </div>
      </div>
    )
  }

  const action = resetPasswordAction.bind(null, locale)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-foreground">{t("resetPasswordTitle")}</h1>
        <ResetPasswordForm
          action={action}
          newPasswordLabel={t("newPasswordLabel")}
          confirmNewPasswordLabel={t("confirmNewPasswordLabel")}
          updatePasswordButton={t("updatePasswordButton")}
          updatePasswordButtonLoading={t("updatePasswordButtonLoading")}
        />
      </div>
    </div>
  )
}
