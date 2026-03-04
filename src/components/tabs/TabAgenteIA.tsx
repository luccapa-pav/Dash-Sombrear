import type { Orcamento } from '@/lib/supabase'
import { Bot, Calendar, TrendingUp, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  Quente: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  Morno: 'bg-muted text-muted-foreground',
  Frio: 'bg-muted text-muted-foreground',
  Convertido: 'bg-green-500/10 text-green-600 dark:text-green-400',
  Perdido: 'bg-destructive/10 text-destructive',
}

// Mock data — será substituído por dados reais futuramente
const MOCK_LEADS = [
  { nome: 'Ana Paula', status: 'Convertido', agendamentos: 2, valor: 1800 },
  { nome: 'Carlos Menezes', status: 'Quente', agendamentos: 1, valor: 3200 },
  { nome: 'Fernanda Lima', status: 'Morno', agendamentos: 1, valor: 950 },
  { nome: 'Ricardo Santos', status: 'Frio', agendamentos: 0, valor: 0 },
  { nome: 'Juliana Costa', status: 'Perdido', agendamentos: 1, valor: 0 },
]

interface Props { data: Orcamento[] }

export default function TabAgenteIA({ data: _data }: Props) {
  const totalAgendamentos = MOCK_LEADS.reduce((s, l) => s + l.agendamentos, 0)
  const totalConvertidos = MOCK_LEADS.filter((l) => l.status === 'Convertido').length
  const totalLeads = MOCK_LEADS.length

  const kpis = [
    { label: 'Total de Leads', value: totalLeads, icon: Users },
    { label: 'Agendamentos', value: totalAgendamentos, icon: Calendar },
    { label: 'Convertidos', value: totalConvertidos, icon: TrendingUp },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
                <p className="font-display mt-1 text-xl font-bold">{value}</p>
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
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {['Lead', 'Status', 'Agendamentos', 'Valor'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_LEADS.map((lead) => (
                <tr key={lead.nome} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{lead.nome}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_STYLES[lead.status])}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">{lead.agendamentos}</td>
                  <td className="px-5 py-3.5 font-medium">
                    {lead.valor > 0 ? formatCurrency(lead.valor) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y">
          {MOCK_LEADS.map((lead) => (
            <div key={lead.nome} className="px-4 py-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm">{lead.nome}</p>
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_STYLES[lead.status])}>
                  {lead.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{lead.agendamentos} agendamento(s)</span>
                {lead.valor > 0
                  ? <span className="text-sm font-bold text-primary">{formatCurrency(lead.valor)}</span>
                  : <span className="text-xs text-muted-foreground">—</span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
