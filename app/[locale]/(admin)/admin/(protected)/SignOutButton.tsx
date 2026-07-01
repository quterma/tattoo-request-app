"use client"

type Props = {
  action: () => Promise<void>
  label: string
}

export function SignOutButton({ action, label }: Props) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="text-sm font-medium text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {label}
      </button>
    </form>
  )
}
