import { useState } from 'react'
import { useCrmLeads, useOrcamentosIA } from '@/hooks/useAgenteIA'
import type { CrmLead } from '@/hooks/useAgenteIA'
import { formatCurrency } from '@/lib/utils'
import { useCountUp } from '@/hooks/useCountUp'
import {
  Bot, DollarSign, FileText, Moon, Users, CalendarCheck,
  ChevronDown, ChevronUp, ChevronsUpDown, Phone, ChevronRight,
} from 'lucide-react'

const HORA_INICIO = 8
const HORA_FIM = 18

function isForaDoHorario(dateStr: string | null) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const day = d.getDay()
  const hour = d.getHours()
  return day === 0 || day === 6 || hour < HORA_INICIO || hour >= HORA_FIM
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function formatTime(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function filterByPeriod(data: CrmLead[], periodo: string) {
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

const STATUS_STYLE: Record<string, string> = {
  'qualificado':  'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'cotado':       'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'agendado':     'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  'fechado':      'bg-green-500/10 text-green-600 dark:text-green-400',
  'perdido':      'bg-red-500/10 text-red-500',
  'aguardando':   'bg-muted text-muted-foreground',
  'em_atendimento': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
}

function statusStyle(s: string | null) {
  if (!s) return 'bg-muted text-muted-foreground'
  const key = s.toLowerCase().replace(/\s+/g, '_')
  return STATUS_STYLE[key] ?? 'bg-muted text-muted-foreground'
}

function statusLabel(s: string | null) {
  if (!s) return 'Sem status'
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

const PERIODOS = [
  { value: 'todos', label: 'Tudo' },
  { value: 'hoje',  label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes',   label: 'Mês' },
]

type SortKey = 'created_at' | 'nome' | 'timestamp_ultima_msg'
type SortDir = 'asc' | 'desc'

function KpiCard({ label, value, icon: Icon, highlight, sub, delay }: {
  label: string; value: string | number; icon: React.ElementType
  highlight?: boolean; sub?: string; delay: number
}) {
  return (
    <div
      className={`animate-in fade-in-0 slide-in-from-bottom-4 duration-500 rounded-xl border p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-elevated cursor-default
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

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm animate-pulse">
      <div className="h-3 w-24 rounded bg-muted mb-3" />
      <div className="h-7 w-16 rounded bg-muted mb-2" />
      <div className="h-3 w-20 rounded bg-muted" />
    </div>
  )
}

export default function TabAgenteIA() {
  const { data: leads = [], isLoading: loadingCrm } = useCrmLeads()
  const { data: orcamentosIA = [], isLoading: loadingOrc } = useOrcamentosIA()
  const loading = loadingCrm || loadingOrc

  const [periodo, setPeriodo] = useState('mes')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'created_at', dir: 'desc' })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtrados = filterByPeriod(leads, periodo)

  // KPI calculations
  const comOrcamento = filtrados.filter((l) =>
    orcamentosIA.some((o) => o.identificador_whats === l.whatsapp || o.cliente_id === l.id)
  )
  const comMedicao = filtrados.filter((l) => l.data_medicao_instalacao && l.data_medicao_instalacao.trim() !== '')
  const foraHorario = filtrados.filter((l) => isForaDoHorario(l.created_at))
  const precisamInst = filtrados.filter((l) =>
    l.precisa_instalacao && !['não', 'nao', 'no', 'false'].includes(l.precisa_instalacao.toLowerCase().trim())
  )

  // Valor total cotado — somar todos os orçamentos do período filtrado
  const whatsappsFiltrados = new Set(filtrados.map((l) => l.whatsapp))
  const orcFiltrados = orcamentosIA.filter((o) =>
    !o.identificador_whats || whatsappsFiltrados.has(o.identificador_whats)
  )
  const valorTotalCotado = orcFiltrados.reduce((s, o) =>
    s + (o.valor_venda_total_base ?? 0) + (o.valor_venda_acabamento_total ?? 0) + (o.valor_colocacao ?? 0), 0
  )

  const animLeads = useCountUp(filtrados.length, 700)
  const animOrc   = useCountUp(comOrcamento.length, 750)
  const animValor = useCountUp(valorTotalCotado, 900)
  const animMed   = useCountUp(comMedicao.length, 750)
  const animFora  = useCountUp(foraHorario.length, 700)
  const animInst  = useCountUp(precisamInst.length, 700)

  const kpis = [
    { label: 'Leads atendidos',      value: Math.round(animLeads), icon: Users,         highlight: true,  sub: 'no período' },
    { label: 'Com orçamento gerado', value: Math.round(animOrc),   icon: FileText,      highlight: false, sub: `${filtrados.length > 0 ? Math.round((comOrcamento.length / filtrados.length) * 100) : 0}% dos leads` },
    { label: 'Valor total cotado',   value: valorTotalCotado > 0 ? formatCurrency(animValor) : '—', icon: DollarSign, highlight: false, sub: 'pela IA' },
    { label: 'Medições agendadas',   value: Math.round(animMed),   icon: CalendarCheck, highlight: false, sub: 'com data marcada' },
    { label: 'Fora do horário',      value: Math.round(animFora),  icon: Moon,          highlight: false, sub: `${filtrados.length > 0 ? Math.round((foraHorario.length / filtrados.length) * 100) : 0}% dos leads` },
    { label: 'Precisam instalação',  value: Math.round(animInst),  icon: Bot,           highlight: false, sub: 'solicitaram colocação' },
  ]

  function toggleSort(key: SortKey) {
    setSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' })
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sort.key !== k) return <ChevronsUpDown className="h-3 w-3 opacity-40" />
    return sort.dir === 'asc' ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />
  }

  const sorted = [...filtrados].sort((a, b) => {
    let av: string, bv: string
    if (sort.key === 'nome') { av = a.nome ?? ''; bv = b.nome ?? '' }
    else if (sort.key === 'timestamp_ultima_msg') { av = a.timestamp_ultima_msg ?? ''; bv = b.timestamp_ultima_msg ?? '' }
    else { av = a.created_at; bv = b.created_at }
    if (av < bv) return sort.dir === 'asc' ? -1 : 1
    if (av > bv) return sort.dir === 'asc' ? 1 : -1
    return 0
  })

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="rounded-xl border bg-card shadow-sm animate-pulse">
          <div className="border-b px-5 py-4"><div className="h-5 w-48 rounded bg-muted" /></div>
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded bg-muted" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map(({ label, value, icon, highlight, sub }, i) => (
          <KpiCard key={label} label={label} value={value} icon={icon} highlight={highlight} sub={sub} delay={i * 80} />
        ))}
      </div>

      {/* Tabela de leads */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold">Leads do Agente IA</h2>
            <span className="text-xs text-muted-foreground">{filtrados.length} lead{filtrados.length !== 1 ? 's' : ''}</span>
          </div>
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
            <p className="text-sm font-medium">Nenhum lead neste período</p>
            <p className="text-xs text-muted-foreground">
              {leads.length > 0 ? 'Tente selecionar um período maior' : 'Os dados virão da tabela crm_sombrear_ia'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {([
                      { label: 'Entrada', key: 'created_at' as SortKey },
                      { label: 'Nome',    key: 'nome' as SortKey },
                      { label: 'WhatsApp' },
                      { label: 'Modelo / Ambiente' },
                      { label: 'Último valor cotado' },
                      { label: 'Últ. mensagem', key: 'timestamp_ultima_msg' as SortKey },
                      { label: 'Status' },
                      { label: 'Horário' },
                    ] as { label: string; key?: SortKey }[]).map(({ label, key }) => (
                      <th
                        key={label}
                        className={`px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap ${key ? 'cursor-pointer select-none hover:text-foreground' : ''}`}
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
                  {sorted.map((lead) => {
                    const fora = isForaDoHorario(lead.created_at)
                    const expanded = expandedId === lead.id
                    return (
                      <>
                        <tr
                          key={lead.id}
                          className={`border-b last:border-0 transition-colors cursor-pointer
                            ${fora ? 'bg-blue-500/[0.03]' : ''}
                            ${expanded ? 'bg-muted/30' : 'hover:bg-muted/20'}`}
                          onClick={() => setExpandedId(expanded ? null : lead.id)}
                        >
                          <td className="px-5 py-3.5 text-muted-foreground tabular-nums whitespace-nowrap">
                            <span className="block">{formatDate(lead.created_at)}</span>
                            <span className="text-xs opacity-70">{formatTime(lead.created_at)}</span>
                          </td>
                          <td className="px-5 py-3.5 font-medium">{lead.nome ?? '—'}</td>
                          <td className="px-5 py-3.5">
                            {lead.whatsapp ? (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3 shrink-0" />
                                {lead.whatsapp}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="block font-medium">{lead.modelo_interesse ?? '—'}</span>
                            {lead.ambiente && <span className="text-xs text-muted-foreground">{lead.ambiente}</span>}
                          </td>
                          <td className="px-5 py-3.5 font-medium tabular-nums">
                            {lead.ultimo_valor_cotado ?? '—'}
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground tabular-nums whitespace-nowrap">
                            <span className="block">{formatDate(lead.timestamp_ultima_msg)}</span>
                            <span className="text-xs opacity-70">{formatTime(lead.timestamp_ultima_msg)}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${statusStyle(lead.status_lead)}`}>
                              {statusLabel(lead.status_lead)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="flex items-center gap-1.5">
                              {fora ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-blue-500 dark:text-blue-400">
                                  <Moon className="h-3 w-3" /> Fora do horário
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Comercial</span>
                              )}
                              <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground/50 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                            </span>
                          </td>
                        </tr>

                        {expanded && (
                          <tr key={`${lead.id}-detail`} className="border-b last:border-0 bg-muted/20">
                            <td colSpan={8} className="px-5 py-4">
                              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
                                {lead.resumo_conversa && (
                                  <div className="col-span-2 sm:col-span-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Resumo da conversa</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{lead.resumo_conversa}</p>
                                  </div>
                                )}
                                {lead.medidas_coletadas && (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Medidas</p>
                                    <p>{lead.medidas_coletadas}</p>
                                  </div>
                                )}
                                {lead.tecido_cor && (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Tecido / Cor</p>
                                    <p>{lead.tecido_cor}</p>
                                  </div>
                                )}
                                {lead.acabamento_desejado && (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Acabamento</p>
                                    <p>{lead.acabamento_desejado}</p>
                                  </div>
                                )}
                                {lead.precisa_instalacao && (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Instalação</p>
                                    <p>{lead.precisa_instalacao}</p>
                                  </div>
                                )}
                                {lead.data_medicao_instalacao && (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Data medição/instalação</p>
                                    <p className="text-primary font-medium">{lead.data_medicao_instalacao}</p>
                                  </div>
                                )}
                                {lead.endereco_cep && (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">CEP</p>
                                    <p>{lead.endereco_cep}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y">
              {sorted.map((lead) => {
                const fora = isForaDoHorario(lead.created_at)
                const expanded = expandedId === lead.id
                return (
                  <div key={lead.id} className={fora ? 'bg-blue-500/[0.03]' : ''}>
                    <button
                      className="w-full px-4 py-4 text-left"
                      onClick={() => setExpandedId(expanded ? null : lead.id)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="font-semibold text-sm">{lead.nome ?? 'Sem nome'}</p>
                          {lead.whatsapp && <p className="text-xs text-muted-foreground mt-0.5">{lead.whatsapp}</p>}
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(lead.status_lead)}`}>
                          {statusLabel(lead.status_lead)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatDate(lead.created_at)} {formatTime(lead.created_at)}</span>
                          {fora && <Moon className="h-3 w-3 text-blue-500" />}
                        </div>
                        <div className="flex items-center gap-1">
                          {lead.ultimo_valor_cotado && (
                            <span className="text-sm font-bold text-primary">{lead.ultimo_valor_cotado}</span>
                          )}
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                    </button>

                    {expanded && (
                      <div className="px-4 pb-4 space-y-2 border-t bg-muted/20">
                        {lead.resumo_conversa && (
                          <div className="pt-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Resumo</p>
                            <p className="text-sm text-muted-foreground">{lead.resumo_conversa}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                          {lead.modelo_interesse && (
                            <div><p className="text-xs text-muted-foreground">Modelo</p><p className="font-medium">{lead.modelo_interesse}</p></div>
                          )}
                          {lead.tecido_cor && (
                            <div><p className="text-xs text-muted-foreground">Tecido/Cor</p><p className="font-medium">{lead.tecido_cor}</p></div>
                          )}
                          {lead.medidas_coletadas && (
                            <div><p className="text-xs text-muted-foreground">Medidas</p><p className="font-medium">{lead.medidas_coletadas}</p></div>
                          )}
                          {lead.data_medicao_instalacao && (
                            <div><p className="text-xs text-muted-foreground">Data medição</p><p className="font-medium text-primary">{lead.data_medicao_instalacao}</p></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

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
