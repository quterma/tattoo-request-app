import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getAuthenticatedStudioMember } from "@/services/auth"

export default async function AdminLayout({
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

  if (!result.ok && result.reason === "unauthorized") {
    return <p>This account is not authorized.</p>
  }

  return <>{children}</>
}
