export default function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 font-serif text-xl font-medium text-foreground">
        {title}
      </h2>
      {children}
    </div>
  )
}