import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createSupabaseAuthClient } from "@/services/supabaseAuth"
import { loginAction } from "./actions"
import { LoginForm } from "./LoginForm"

export default async function AdminLoginPage({
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
  if (data.user) {
    redirect(`/${locale}/admin`)
  }

  const action = loginAction.bind(null, locale)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-foreground">Admin sign in</h1>
        <LoginForm action={action} />
      </div>
    </div>
  )
}
