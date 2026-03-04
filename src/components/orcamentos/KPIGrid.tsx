import type { Orcamento } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle2, DollarSign, FileText, TrendingUp } from 'lucide-react'

interface Props { data: Orcamento[] }

export default function KPIGrid({ data }: Props) {
  const fechados = data.filter((o) => o.status === 'FEITO')
  const faturamento = fechados.reduce((s, o) => s + (o.valor_venda ?? 0), 0)
  const totalOrc = data.length
  const valorTotal = data.reduce((s, o) => s + (o.valor_venda ?? 0), 0)

  const kpis = [
    { label: 'Fechamentos', value: String(fechados.length), icon: CheckCircle2, highlight: true, sub: `${totalOrc > 0 ? ((fechados.length / totalOrc) * 100).toFixed(0) : 0}% conversão` },
    { label: 'Faturamento', value: formatCurrency(faturamento), icon: DollarSign, highlight: true, sub: 'fechados' },
    { label: 'Orçamentos', value: String(totalOrc), icon: FileText, highlight: false, sub: 'no período' },
    { label: 'Valor Total', value: formatCurrency(valorTotal), icon: TrendingUp, highlight: false, sub: 'todos' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map(({ label, value, icon: Icon, highlight, sub }) => (
        <div
          key={label}
          className={`rounded-xl border p-4 shadow-sm ${highlight ? 'border-primary/30 bg-primary/5 dark:bg-primary/10' : 'bg-card'}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
              <p className={`font-display mt-1 text-xl font-bold truncate ${highlight ? 'text-primary' : ''}`}>
                {value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground truncate">{sub}</p>
            </div>
            <div className={`shrink-0 rounded-lg p-1.5 ${highlight ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
