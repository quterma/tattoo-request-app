import Link from "next/link"
import { cookies } from "next/headers"
import { createSupabaseAuthClient } from "@/services/supabaseAuth"
import { resetPasswordAction } from "./actions"
import { ResetPasswordForm } from "./ResetPasswordForm"

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const cookieStore = await cookies()

  const supabase = createSupabaseAuthClient({
    getAll: () => cookieStore.getAll(),
    setAll: () => {},
  })

  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <h1 className="text-xl font-semibold text-foreground">Reset password</h1>
          <p className="text-sm text-foreground">
            Reset link has expired or is no longer valid.
          </p>
          <Link
            href={`/${locale}/admin/forgot-password`}
            className="rounded-md bg-foreground px-6 py-3 text-center text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
          >
            Request a new link
          </Link>
        </div>
      </div>
    )
  }

  const action = resetPasswordAction.bind(null, locale)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-foreground">Set a new password</h1>
        <ResetPasswordForm action={action} />
      </div>
    </div>
  )
}
