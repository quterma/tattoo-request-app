import { useTranslations } from "next-intl"

export default function Home() {
  const t = useTranslations("app")

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{t("title")}</h1>
        <p className="mt-4 text-lg text-zinc-500">{t("description")}</p>
      </div>
    </main>
  )
}
