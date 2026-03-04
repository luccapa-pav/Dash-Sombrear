import type { Orcamento } from '@/lib/supabase'
import { Bot, TrendingUp, DollarSign, FileText } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import { useCountUp } from '@/hooks/useCountUp'

const STATUS_STYLES: Record<string, string> = {
  PENDENTE: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  FEITO: 'bg-green-500/10 text-green-600 dark:text-green-400',
  ERRO: 'bg-destructive/10 text-destructive',
}

interface Props { data: Orcamento[] }

export default function TabAgenteIA({ data }: Props) {
  const leads = data.filter((o) => o.fonte === 'agente_ia')
  const convertidos = leads.filter((o) => o.fechado === true)
  const faturamento = convertidos.reduce((s, o) => s + (o.valor_venda ?? 0), 0)

  const animLeads = useCountUp(leads.length, 700)
  const animConv = useCountUp(convertidos.length, 750)
  const animFat = useCountUp(faturamento, 900)

  const kpis = [
    { label: 'Leads recebidos', value: Math.round(animLeads), icon: FileText },
    { label: 'Convertidos', value: Math.round(animConv), icon: TrendingUp },
    { label: 'Faturamento', value: formatCurrency(animFat), icon: DollarSign },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {kpis.map(({ label, value, icon: Icon }, i) => (
          <div
            key={label}
            className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-elevated cursor-default"
            style={{ animationFillMode: 'both', animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
                <p className="font-display mt-1 text-xl font-bold tabular-nums">{value}</p>
              </div>
              <div className="shrink-0 rounded-lg p-1.5 bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <Bot className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold">Leads do Agente IA</h2>
          <span className="ml-auto text-xs text-muted-foreground">{leads.length} lead{leads.length !== 1 ? 's' : ''}</span>
        </div>

        {leads.length === 0 ? (
          <div className="py-12 text-center space-y-1">
            <p className="text-sm font-medium">Nenhum lead do Agente IA ainda</p>
            <p className="text-xs text-muted-foreground">Configure o n8n para enviar <code className="bg-muted px-1 rounded text-xs">fonte: "agente_ia"</code> no INSERT</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {['Cliente', 'Responsável', 'Modelo', 'Tecido', 'Valor', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((o) => (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5 font-medium">{o.cliente ?? '—'}</td>
                      <td className="px-5 py-3.5">{o.responsavel}</td>
                      <td className="px-5 py-3.5">{o.modelo}</td>
                      <td className="px-5 py-3.5">{o.tecido}</td>
                      <td className="px-5 py-3.5 font-medium">{o.valor_venda ? formatCurrency(o.valor_venda) : '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_STYLES[o.status])}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y">
              {leads.map((o) => (
                <div key={o.id} className="px-4 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm">{o.cliente ?? 'Sem cliente'}</p>
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_STYLES[o.status])}>
                      {o.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{o.responsavel} · {o.modelo}</span>
                    {o.valor_venda
                      ? <span className="text-sm font-bold text-primary">{formatCurrency(o.valor_venda)}</span>
                      : <span className="text-xs text-muted-foreground">—</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
