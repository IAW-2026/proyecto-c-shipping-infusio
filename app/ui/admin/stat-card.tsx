export default function StatCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string
  value: string
  detail: string
  icon: React.ReactNode
}) {
  const Wrapper: any = "div"
  return (
    <Wrapper
      type="undefined"
      className={`rounded-2xl border border-border bg-card p-6 shadow-sm`}>
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