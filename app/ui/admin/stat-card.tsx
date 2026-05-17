export default function StatCard({
  title,
  value,
  detail,
  icon,
  onClick,
}: {
  title: string
  value: string
  detail: string
  icon: React.ReactNode
  onClick?: () => void
}) {
  const Wrapper: any = onClick ? "button" : "div"
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`rounded-2xl border border-border bg-card p-6 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md" : ""}`}>
      <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-foreground">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
      </div>
    </Wrapper>
  )
}