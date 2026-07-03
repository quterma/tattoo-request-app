type EmptyStateProps = {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{message}</p>
}
