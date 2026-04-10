type FieldHintProps = {
  children: string
}

export function FieldHint({ children }: FieldHintProps) {
  return <p className="text-xs text-muted-foreground">{children}</p>
}
