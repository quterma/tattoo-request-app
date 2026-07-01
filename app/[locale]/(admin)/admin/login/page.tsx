import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getOptionalUser } from "@/services/auth"
import { googleLoginAction, loginAction } from "./actions"
import { LoginForm } from "./LoginForm"

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string; reset?: string }>
}) {
  const { locale } = await params
  const { error, reset } = await searchParams
  const cookieStore = await cookies()
  const t = await getTranslations({ locale, namespace: "admin" })

  const user = await getOptionalUser({
    getAll: () => cookieStore.getAll(),
    setAll: () => {},
  })
  if (user) {
    redirect(`/${locale}/admin`)
  }

  const action = loginAction.bind(null, locale)
  const googleAction = googleLoginAction.bind(null, locale)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-foreground">{t("signInTitle")}</h1>
        {error === "oauth" && (
          <p role="alert" className="text-sm text-destructive">
            {t("oauthError")}
          </p>
        )}
        {reset === "success" && (
          <p role="status" className="text-sm text-foreground">
            {t("resetSuccess")}
          </p>
        )}
        <LoginForm
          action={action}
          googleAction={googleAction}
          emailLabel={t("emailLabel")}
          passwordLabel={t("passwordLabel")}
          signInButton={t("signInButton")}
          signInButtonLoading={t("signInButtonLoading")}
          googleButton={t("googleButton")}
        />
        <Link
          href={`/${locale}/admin/forgot-password`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("forgotPasswordLink")}
        </Link>
      </div>
    </div>
  )
}
