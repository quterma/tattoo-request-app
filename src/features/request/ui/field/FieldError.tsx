type FieldErrorProps = {
  children: string
}

export function FieldError({ children }: FieldErrorProps) {
  return <p className="text-xs text-destructive">{children}</p>
}
