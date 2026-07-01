import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createSupabaseAuthClient } from "@/services/supabaseAuth"
import { googleLoginAction, loginAction } from "./actions"
import { LoginForm } from "./LoginForm"

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { locale } = await params
  const { error } = await searchParams
  const cookieStore = await cookies()

  const supabase = createSupabaseAuthClient({
    getAll: () => cookieStore.getAll(),
    setAll: () => {},
  })

  const { data } = await supabase.auth.getUser()
  if (data.user) {
    redirect(`/${locale}/admin`)
  }

  const action = loginAction.bind(null, locale)
  const googleAction = googleLoginAction.bind(null, locale)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-foreground">Admin sign in</h1>
        {error === "oauth" && (
          <p role="alert" className="text-sm text-destructive">
            Google sign-in failed. Please try again.
          </p>
        )}
        <LoginForm action={action} googleAction={googleAction} />
      </div>
    </div>
  )
}
