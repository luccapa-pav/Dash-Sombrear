import type { Orcamento } from '@/lib/supabase'
import { Bot, Calendar, TrendingUp, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  Quente: 'bg-red-500/10 text-red-600 dark:text-red-400',
  Morno: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  Frio: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Convertido: 'bg-green-500/10 text-green-600 dark:text-green-400',
  Perdido: 'bg-muted text-muted-foreground',
}

// Mock data para a aba IA — será substituído por dados reais futuramente
const MOCK_LEADS = [
  { nome: 'Ana Paula', status: 'Convertido', agendamentos: 2, valor: 1800 },
  { nome: 'Carlos Menezes', status: 'Quente', agendamentos: 1, valor: 3200 },
  { nome: 'Fernanda Lima', status: 'Morno', agendamentos: 1, valor: 950 },
  { nome: 'Ricardo Santos', status: 'Frio', agendamentos: 0, valor: 0 },
  { nome: 'Juliana Costa', status: 'Perdido', agendamentos: 1, valor: 0 },
]

interface Props {
  data: Orcamento[]
}

export default function TabAgenteIA({ data: _data }: Props) {
  const totalAgendamentos = MOCK_LEADS.reduce((s, l) => s + l.agendamentos, 0)
  const totalConvertidos = MOCK_LEADS.filter((l) => l.status === 'Convertido').length
  const totalLeads = MOCK_LEADS.length

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total de Leads', value: totalLeads, icon: Users, color: 'text-blue-500' },
          { label: 'Agendamentos Fechados', value: totalAgendamentos, icon: Calendar, color: 'text-brand' },
          { label: 'Leads Convertidos', value: totalConvertidos, icon: TrendingUp, color: 'text-green-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={cn('rounded-lg bg-muted p-2', color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-display text-2xl font-bold">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de leads */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-display font-semibold">Leads do Agente IA</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Lead</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-center font-medium text-muted-foreground">Agendamentos</th>
                <th className="px-5 py-3 text-right font-medium text-muted-foreground">Valor</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LEADS.map((lead) => (
                <tr key={lead.nome} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{lead.nome}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_COLORS[lead.status])}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">{lead.agendamentos}</td>
                  <td className="px-5 py-3.5 text-right font-medium">
                    {lead.valor > 0 ? formatCurrency(lead.valor) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
