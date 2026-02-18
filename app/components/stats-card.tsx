import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { formatCurrency } from '@/app/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  icon?: React.ReactNode
  isCurrency?: boolean
  className?: string
}

export function StatsCard({ title, value, icon, isCurrency = true, className = '' }: StatsCardProps) {
  const displayValue = isCurrency ? formatCurrency(typeof value === 'number' ? value : 0) : value

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
      </CardContent>
    </Card>
  )
}
