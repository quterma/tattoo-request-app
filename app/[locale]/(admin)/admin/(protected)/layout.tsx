import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getAuthenticatedStudioMember } from "@/services/auth"
import { logoutAction } from "./actions"
import { SignOutButton } from "./SignOutButton"

export default async function AdminProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const cookieStore = await cookies()

  const result = await getAuthenticatedStudioMember({
    getAll: () => cookieStore.getAll(),
    setAll: () => {},
  })

  if (!result.ok && result.reason === "unauthenticated") {
    redirect(`/${locale}/admin/login`)
  }

  const boundLogoutAction = logoutAction.bind(null, locale)

  if (!result.ok && result.reason === "unauthorized") {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="flex items-center justify-end border-b border-border px-4 py-3">
          <SignOutButton action={boundLogoutAction} />
        </header>
        <p className="px-4 py-3">This account is not authorized.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Admin</span>
        <SignOutButton action={boundLogoutAction} />
      </header>
      {children}
    </div>
  )
}
