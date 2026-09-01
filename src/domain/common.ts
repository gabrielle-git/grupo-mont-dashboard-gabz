export function safeDivide(
  numerator: number,
  denominator: number,
  fallback = 0,
): number {
  if (denominator === 0) return fallback
  return numerator / denominator
}

export function percentage(part: number, total: number): number {
  return safeDivide(part, total) * 100
}

export function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0)
}

export function average(values: number[]): number {
  if (values.length === 0) return 0
  return safeDivide(sum(values), values.length)
}

export function isInPeriod(date: string | null | undefined, period: string): boolean {
  if (!date) return false
  return date.startsWith(period)
}

export function filterByCompany<T extends { companyId: string }>(
  items: T[],
  companyId: string,
): T[] {
  return items.filter((item) => item.companyId === companyId)
}

export function groupCountBy<T>(
  items: T[],
  keyFn: (item: T) => string,
): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = keyFn(item)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

export function getDaysInMonth(period: string): number {
  const [year, month] = period.split('-').map(Number)
  return new Date(year, month, 0).getDate()
}

export function getElapsedDaysInMonth(asOfDate: string, period: string): number {
  if (!asOfDate.startsWith(period)) {
    return getDaysInMonth(period)
  }

  return Number(asOfDate.split('-')[2])
}

export function calculateExpectedTargetToDate(
  target: number,
  period: string,
  asOfDate: string,
): number {
  const totalDays = getDaysInMonth(period)
  const elapsedDays = getElapsedDaysInMonth(asOfDate, period)
  return target * safeDivide(elapsedDays, totalDays)
}

export function calculateGapToExpected(
  realized: number,
  expectedTargetToDate: number,
): number {
  return realized - expectedTargetToDate
}

export function calculateLinearPaceForecast(
  realized: number,
  period: string,
  asOfDate: string,
): number {
  const totalDays = getDaysInMonth(period)
  const elapsedDays = getElapsedDaysInMonth(asOfDate, period)
  return realized * safeDivide(totalDays, elapsedDays)
}

export const EXECUTIVE_STATUS_THRESHOLDS = {
  green: 100,
  yellow: 85,
} as const

export type ExecutiveStatus = 'green' | 'yellow' | 'red'

export function getExecutiveStatus(
  forecastVsTargetPercentage: number,
): ExecutiveStatus {
  if (forecastVsTargetPercentage >= EXECUTIVE_STATUS_THRESHOLDS.green) {
    return 'green'
  }

  if (forecastVsTargetPercentage >= EXECUTIVE_STATUS_THRESHOLDS.yellow) {
    return 'yellow'
  }

  return 'red'
}

export type ExecutiveMetrics = {
  realized: number
  target: number
  achievementPercentage: number
  expectedTargetToDate: number
  gapToExpected: number
  forecast: number
  forecastVsTargetPercentage: number
  executiveStatus: ExecutiveStatus
}

export function buildExecutiveMetrics(
  realized: number,
  target: number,
  forecast: number,
  period: string,
  asOfDate: string,
): ExecutiveMetrics {
  const expectedTargetToDate = calculateExpectedTargetToDate(
    target,
    period,
    asOfDate,
  )
  const forecastVsTargetPercentage = percentage(forecast, target)

  return {
    realized,
    target,
    achievementPercentage: percentage(realized, target),
    expectedTargetToDate,
    gapToExpected: calculateGapToExpected(realized, expectedTargetToDate),
    forecast,
    forecastVsTargetPercentage,
    executiveStatus: getExecutiveStatus(forecastVsTargetPercentage),
  }
}

