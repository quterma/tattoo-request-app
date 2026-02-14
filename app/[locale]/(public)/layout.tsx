import { AppNav, PublicFooter } from "@/shared/ui"

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-w-[320px] overflow-x-hidden">
      <AppNav />
      <div className="pb-(--nav-height) sm:pb-0">
        {children}
        <PublicFooter />
      </div>
    </div>
  )
}
