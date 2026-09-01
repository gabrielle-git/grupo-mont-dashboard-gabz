import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CompanyOverview } from '../../domain/overview'
import { formatPercent } from '../../utils/format'

type ExecutiveComparisonChartProps = {
  companies: CompanyOverview[]
}

type ChartPoint = {
  name: string
  achievement: number
  forecast: number
}

export function ExecutiveComparisonChart({
  companies,
}: ExecutiveComparisonChartProps) {
  const chartData: ChartPoint[] = companies.map((company) => ({
    name: company.name,
    achievement: Number(company.achievementPercentage.toFixed(1)),
    forecast: Number(company.forecastVsTargetPercentage.toFixed(1)),
  }))

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-900">
        Comparação executiva
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Comparativo por percentual de atingimento — quem está no ritmo de
        atingir a meta?
      </p>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              domain={[0, 'auto']}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip
              formatter={(value) => formatPercent(Number(value))}
              contentStyle={{
                borderRadius: '0.5rem',
                borderColor: '#e2e8f0',
                fontSize: '0.875rem',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
            <ReferenceLine
              y={100}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{
                value: 'Meta 100%',
                position: 'insideTopRight',
                fill: '#64748b',
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="achievement"
              name="Atingimento atual"
              fill="#1e293b"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="forecast"
              name="Forecast vs meta"
              fill="#64748b"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
