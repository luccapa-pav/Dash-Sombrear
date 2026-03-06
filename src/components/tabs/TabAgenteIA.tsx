import { useState } from 'react'
import type { Orcamento } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { useCountUp } from '@/hooks/useCountUp'
import { Bot, TrendingUp, DollarSign, FileText, ReceiptText, Moon, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

interface Props { data: Orcamento[] }

const PERIODOS = [
  { value: 'todos', label: 'Tudo' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
]

const HORA_INICIO = 8
const HORA_FIM = 18

function isForaDoHorario(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDay() // 0=Dom, 6=Sáb
  const hour = d.getHours()
  return day === 0 || day === 6 || hour < HORA_INICIO || hour >= HORA_FIM
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function filterByPeriod(data: Orcamento[], periodo: string) {
  if (periodo === 'todos') return data
  const now = new Date()
  return data.filter((o) => {
    const d = new Date(o.created_at)
    if (periodo === 'hoje') return d.toDateString() === now.toDateString()
    if (periodo === 'semana') {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
      return d >= weekAgo
    }
    if (periodo === 'mes') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return true
  })
}

type SortKey = 'created_at' | 'cliente' | 'valor_venda'
type SortDir = 'asc' | 'desc'

function KpiCard({ label, value, icon: Icon, highlight, sub, delay }: {
  label: string; value: string | number; icon: React.ElementType
  highlight?: boolean; sub?: string; delay: number
}) {
  return (
    <div
      className={`group relative animate-in fade-in-0 slide-in-from-bottom-4 duration-500 rounded-xl border p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-elevated cursor-default outline-none
        ${highlight ? 'border-primary/30 bg-primary/5 dark:bg-primary/10' : 'bg-card'}`}
      style={{ animationFillMode: 'both', animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
          <p className={`font-display mt-1 text-xl font-bold truncate tabular-nums ${highlight ? 'text-primary' : ''}`}>
            {value}
          </p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground truncate">{sub}</p>}
        </div>
        <div className={`shrink-0 rounded-lg p-1.5 ${highlight ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

export default function TabAgenteIA({ data }: Props) {
  const [periodo, setPeriodo] = useState('mes')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'created_at', dir: 'desc' })

  const todos = data.filter((o) => o.fonte === 'agente_ia')
  const filtrados = filterByPeriod(todos, periodo)

  const convertidos = filtrados.filter((o) => o.fechado === true)
  const faturamento = convertidos.reduce((s, o) => s + (o.valor_venda ?? 0) + (o.instacao ?? 0), 0)
  const ticketMedio = convertidos.length > 0 ? faturamento / convertidos.length : 0
  const taxaConv = filtrados.length > 0 ? (convertidos.length / filtrados.length) * 100 : 0
  const foraHorario = filtrados.filter((o) => isForaDoHorario(o.created_at))

  const animLeads = useCountUp(filtrados.length, 700)
  const animConv = useCountUp(convertidos.length, 750)
  const animFat = useCountUp(faturamento, 900)
  const animTicket = useCountUp(ticketMedio, 850)
  const animTaxa = useCountUp(taxaConv, 800)
  const animFora = useCountUp(foraHorario.length, 700)

  const kpis = [
    { label: 'Leads recebidos', value: Math.round(animLeads), icon: FileText, highlight: true, sub: 'no período' },
    { label: 'Convertidos', value: Math.round(animConv), icon: TrendingUp, highlight: false, sub: `${Math.round(animTaxa)}% de conversão` },
    { label: 'Faturamento gerado', value: faturamento > 0 ? formatCurrency(animFat) : '—', icon: DollarSign, highlight: false, sub: 'pelos leads convertidos' },
    { label: 'Ticket Médio', value: ticketMedio > 0 ? formatCurrency(animTicket) : '—', icon: ReceiptText, highlight: false, sub: 'por conversão' },
    { label: 'Fora do horário', value: Math.round(animFora), icon: Moon, highlight: false, sub: `${filtrados.length > 0 ? Math.round((foraHorario.length / filtrados.length) * 100) : 0}% dos leads` },
    { label: 'Agente ativo (total)', value: todos.length, icon: Bot, highlight: false, sub: 'desde o início' },
  ]

  function toggleSort(key: SortKey) {
    setSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' })
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sort.key !== k) return <ChevronsUpDown className="h-3 w-3 opacity-40" />
    return sort.dir === 'asc' ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />
  }

  const sorted = [...filtrados].sort((a, b) => {
    let av: string | number, bv: string | number
    if (sort.key === 'created_at') { av = a.created_at; bv = b.created_at }
    else if (sort.key === 'cliente') { av = a.cliente ?? ''; bv = b.cliente ?? '' }
    else { av = a.valor_venda ?? -1; bv = b.valor_venda ?? -1 }
    if (av < bv) return sort.dir === 'asc' ? -1 : 1
    if (av > bv) return sort.dir === 'asc' ? 1 : -1
    return 0
  })

  const COLS: { label: string; key?: SortKey }[] = [
    { label: 'Data/Hora', key: 'created_at' },
    { label: 'Cliente', key: 'cliente' },
    { label: 'Modelo' },
    { label: 'Tecido' },
    { label: 'Valor', key: 'valor_venda' },
    { label: 'Status' },
    { label: 'Horário' },
  ]

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map(({ label, value, icon, highlight, sub }, i) => (
          <KpiCard key={label} label={label} value={value} icon={icon} highlight={highlight} sub={sub} delay={i * 80} />
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold">Leads do Agente IA</h2>
            <span className="text-xs text-muted-foreground">{filtrados.length} lead{filtrados.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Filtro de período */}
          <div className="flex gap-1 rounded-lg bg-muted/60 p-1">
            {PERIODOS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriodo(value)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150
                  ${periodo === value ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtrados.length === 0 ? (
          <div className="py-16 text-center space-y-1">
            <Bot className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium">Nenhum lead do Agente IA neste período</p>
            <p className="text-xs text-muted-foreground">
              {todos.length > 0
                ? 'Tente selecionar um período maior'
                : <>Configure o n8n para enviar <code className="bg-muted px-1 rounded">fonte: "agente_ia"</code> no INSERT</>
              }
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {COLS.map(({ label, key }) => (
                      <th
                        key={label}
                        className={`px-5 py-3 text-left font-medium text-muted-foreground ${key ? 'cursor-pointer select-none hover:text-foreground' : ''}`}
                        onClick={() => key && toggleSort(key)}
                      >
                        <span className="flex items-center gap-1">
                          {label}
                          {key && <SortIcon k={key} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((o) => {
                    const fora = isForaDoHorario(o.created_at)
                    return (
                      <tr key={o.id} className={`border-b last:border-0 transition-colors hover:bg-muted/20 ${fora ? 'bg-blue-500/[0.03]' : ''}`}>
                        <td className="px-5 py-3.5 text-muted-foreground tabular-nums whitespace-nowrap">
                          <span className="block">{formatDate(o.created_at)}</span>
                          <span className="text-xs opacity-70">{formatTime(o.created_at)}</span>
                        </td>
                        <td className="px-5 py-3.5 font-medium">{o.cliente ?? '—'}</td>
                        <td className="px-5 py-3.5">{o.modelo}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">{o.tecido}</td>
                        <td className="px-5 py-3.5 font-medium tabular-nums">
                          {o.valor_venda ? formatCurrency(o.valor_venda) : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold
                            ${o.fechado
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                              : 'bg-muted text-muted-foreground'
                            }`}>
                            {o.fechado ? 'Fechado' : 'Em aberto'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {fora ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-blue-500 dark:text-blue-400">
                              <Moon className="h-3 w-3" />
                              Fora do horário
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Comercial</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y">
              {sorted.map((o) => {
                const fora = isForaDoHorario(o.created_at)
                return (
                  <div key={o.id} className={`px-4 py-4 ${fora ? 'bg-blue-500/[0.03]' : ''}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="font-semibold text-sm">{o.cliente ?? 'Sem cliente'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{o.modelo} · {o.tecido}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold
                        ${o.fechado
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                        }`}>
                        {o.fechado ? 'Fechado' : 'Em aberto'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {formatDate(o.created_at)} {formatTime(o.created_at)}
                        </span>
                        {fora && <Moon className="h-3 w-3 text-blue-500" />}
                      </div>
                      {o.valor_venda
                        ? <span className="text-sm font-bold text-primary tabular-nums">{formatCurrency(o.valor_venda)}</span>
                        : <span className="text-xs text-muted-foreground">—</span>
                      }
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Aviso fora do horário */}
            {foraHorario.length > 0 && (
              <div className="border-t px-5 py-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Moon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>
                  <span className="font-semibold text-foreground">{foraHorario.length}</span> lead{foraHorario.length !== 1 ? 's' : ''} recebido{foraHorario.length !== 1 ? 's' : ''} fora do horário comercial (seg–sex 08h–18h)
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
