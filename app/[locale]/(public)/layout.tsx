import { AppNav } from "@/shared/ui"

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <AppNav />
      <div className="pb-(--nav-height) sm:pb-0">{children}</div>
    </>
  )
}
