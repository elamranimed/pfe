import { getDelayColor, getDelayText } from '@/app/lib/utils'

interface DelayBadgeProps {
  daysLate: number
  className?: string
}

export function DelayBadge({ daysLate, className = '' }: DelayBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDelayColor(daysLate)} ${className}`}>
      {getDelayText(daysLate)}
    </span>
  )
}
