import { AppNav } from "@/shared/ui"

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <AppNav />
      <div className="pb-16 sm:pb-0">{children}</div>
    </>
  )
}
