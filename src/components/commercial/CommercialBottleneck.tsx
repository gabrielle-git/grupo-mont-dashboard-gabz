import type { FunnelBottleneck } from '../../domain/commercial'
import { formatPercent } from '../../utils/format'

type CommercialBottleneckProps = {
  bottleneck: FunnelBottleneck
}

export function CommercialBottleneck({ bottleneck }: CommercialBottleneckProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-900">Principal gargalo</h3>

      {bottleneck ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-slate-900">
            {bottleneck.fromLabel} → {bottleneck.toLabel}
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Queda de {formatPercent(bottleneck.dropPercentage)} entre etapas
            consecutivas — maior perda identificada no funil.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            A transição de {bottleneck.fromLabel} para {bottleneck.toLabel}{' '}
            concentra a principal perda do processo comercial nesta empresa.
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          Não há dados suficientes para identificar um gargalo.
        </p>
      )}
    </section>
  )
}
