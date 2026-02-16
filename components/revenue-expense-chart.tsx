'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface ChartData {
  month: string
  revenue: number
  expenses: number
}

interface RevenueExpenseChartProps {
  data: ChartData[]
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend />
          <Bar
            dataKey="revenue"
            fill="#22c55e"
            name="Revenus"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="expenses"
            fill="#ef4444"
            name="Dépenses"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
