import Link from "next/link"
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

  const action = forgotPasswordAction.bind(null, locale)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-foreground">Reset password</h1>
        <ForgotPasswordForm action={action} showExpiredLinkError={error === "reset"} />
        <Link
          href={`/${locale}/admin/login`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
