export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`
}

export function formatAsOfDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function formatGapLabel(value: number, unit: 'currency' | 'lives'): string {
  const formatted =
    unit === 'currency' ? formatCurrency(Math.abs(value)) : formatNumber(Math.abs(value))

  if (value > 0) return `+${formatted} acima do ritmo`
  if (value < 0) return `−${formatted} abaixo do ritmo`
  return 'No ritmo esperado'
}
