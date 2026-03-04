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
    {
      label: 'Fechamentos',
      value: fechados.length,
      icon: CheckCircle2,
      highlight: true,
      sub: `${totalOrc > 0 ? ((fechados.length / totalOrc) * 100).toFixed(0) : 0}% de conversão`,
    },
    {
      label: 'Faturamento',
      value: formatCurrency(faturamento),
      icon: DollarSign,
      highlight: true,
      sub: 'orçamentos fechados',
    },
    {
      label: 'Total de Orçamentos',
      value: totalOrc,
      icon: FileText,
      highlight: false,
      sub: 'no período',
    },
    {
      label: 'Valor Total',
      value: formatCurrency(valorTotal),
      icon: TrendingUp,
      highlight: false,
      sub: 'todos os orçamentos',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {kpis.map(({ label, value, icon: Icon, highlight, sub }) => (
        <div
          key={label}
          className={`rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md ${
            highlight
              ? 'border-primary/30 bg-primary/5 dark:bg-primary/10'
              : 'bg-card'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className={`font-display mt-1 text-2xl font-bold ${highlight ? 'text-primary' : ''}`}>
                {value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            </div>
            <div className={`rounded-lg p-2 ${highlight ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
