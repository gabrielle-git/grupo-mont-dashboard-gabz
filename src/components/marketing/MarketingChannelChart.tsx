import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChannelMetrics } from '../../domain/marketing'
import { formatCurrency, formatPercent } from '../../utils/format'

type MarketingChannelChartProps = {
  channels: ChannelMetrics[]
}

export function MarketingChannelChart({ channels }: MarketingChannelChartProps) {
  const chartData = channels.map((channel) => ({
    name: channel.channel,
    investimento: channel.investment,
    oportunidades: channel.opportunities,
    conversao: Number(channel.leadToOpportunityRate.toFixed(1)),
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'conversao') return formatPercent(Number(value))
              if (name === 'investimento') return formatCurrency(Number(value))
              return value
            }}
          />
          <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
          <Bar
            yAxisId="left"
            dataKey="investimento"
            name="Investimento"
            fill="#1e293b"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="conversao"
            name="Conv. Lead→Opp."
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
