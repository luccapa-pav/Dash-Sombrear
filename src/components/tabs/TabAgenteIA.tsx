import { useState } from 'react'
import { useCrmLeads, useOrcamentosIA } from '@/hooks/useAgenteIA'
import type { CrmLead, OrcamentoIA } from '@/hooks/useAgenteIA'
import { formatCurrency } from '@/lib/utils'
import { useCountUp } from '@/hooks/useCountUp'
import {
  Bot, DollarSign, FileText, Moon, Users, CalendarCheck,
  ChevronDown, ChevronUp, ChevronsUpDown, Phone, ChevronRight, MessageSquare,
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

function filterLeadsByPeriod(data: CrmLead[], periodo: string) {
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

function filterOrcsByPeriod(data: OrcamentoIA[], periodo: string) {
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
  'qualificado':      'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'cotado':           'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'agendado':         'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  'fechado':          'bg-green-500/10 text-green-600 dark:text-green-400',
  'perdido':          'bg-red-500/10 text-red-500',
  'aguardando':       'bg-muted text-muted-foreground',
  'em_atendimento':   'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
}

function statusStyle(s: string | null) {
  if (!s) return 'bg-muted text-muted-foreground'
  return STATUS_STYLE[s.toLowerCase().replace(/\s+/g, '_')] ?? 'bg-muted text-muted-foreground'
}

function statusLabel(s: string | null) {
  if (!s) return 'Sem status'
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

const PERIODOS = [
  { value: 'todos',  label: 'Tudo' },
  { value: 'hoje',   label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes',    label: 'Mês' },
]

type LeadSortKey = 'created_at' | 'nome' | 'timestamp_ultima_msg'
type OrcSortKey  = 'created_at' | 'modelo' | 'valor'
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

function PeriodTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted/60 p-1">
      {PERIODOS.map(({ value: v, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150
            ${value === v ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function TabAgenteIA() {
  const { data: leads = [], isLoading: loadingCrm } = useCrmLeads()
  const { data: orcamentosIA = [], isLoading: loadingOrc } = useOrcamentosIA()
  const loading = loadingCrm || loadingOrc

  const [periodo, setPeriodo] = useState('mes')
  const [leadSort, setLeadSort] = useState<{ key: LeadSortKey; dir: SortDir }>({ key: 'created_at', dir: 'desc' })
  const [orcSort,  setOrcSort]  = useState<{ key: OrcSortKey;  dir: SortDir }>({ key: 'created_at', dir: 'desc' })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtrados  = filterLeadsByPeriod(leads, periodo)
  const orcFiltrados = filterOrcsByPeriod(orcamentosIA, periodo)

  // KPIs
  const comMedicao   = filtrados.filter((l) => l.data_medicao_instalacao?.trim())
  const foraLeads    = filtrados.filter((l) => isForaDoHorario(l.created_at))
  const foraMsgs     = filtrados.filter((l) => isForaDoHorario(l.timestamp_ultima_msg))
  const valorTotal   = orcFiltrados.reduce((s, o) =>
    s + (o.valor_venda_total_base ?? 0) + (o.valor_venda_acabamento_total ?? 0) + (o.valor_colocacao ?? 0), 0
  )

  const animLeads  = useCountUp(filtrados.length, 700)
  const animOrcs   = useCountUp(orcFiltrados.length, 750)
  const animValor  = useCountUp(valorTotal, 900)
  const animMed    = useCountUp(comMedicao.length, 750)
  const animFLead  = useCountUp(foraLeads.length, 700)
  const animFMsg   = useCountUp(foraMsgs.length, 700)

  const kpis = [
    { label: 'Leads atendidos',       value: Math.round(animLeads),  icon: Users,          highlight: true,  sub: 'no período' },
    { label: 'Orçamentos gerados',    value: Math.round(animOrcs),   icon: FileText,       highlight: false, sub: valorTotal > 0 ? formatCurrency(animValor) : 'nenhum valor ainda' },
    { label: 'Valor total cotado',    value: valorTotal > 0 ? formatCurrency(animValor) : '—', icon: DollarSign, highlight: false, sub: `em ${orcFiltrados.length} orçamento${orcFiltrados.length !== 1 ? 's' : ''}` },
    { label: 'Medições agendadas',    value: Math.round(animMed),    icon: CalendarCheck,  highlight: false, sub: 'com data marcada' },
    { label: 'Pessoas fora horário',  value: Math.round(animFLead),  icon: Moon,           highlight: false, sub: 'leads recebidos fora do comercial' },
    { label: 'Mensagens fora horário',value: Math.round(animFMsg),   icon: MessageSquare,  highlight: false, sub: 'última msg fora do comercial' },
  ]

  // Sort leads
  const sortedLeads = [...filtrados].sort((a, b) => {
    let av: string, bv: string
    if (leadSort.key === 'nome') { av = a.nome ?? ''; bv = b.nome ?? '' }
    else if (leadSort.key === 'timestamp_ultima_msg') { av = a.timestamp_ultima_msg ?? ''; bv = b.timestamp_ultima_msg ?? '' }
    else { av = a.created_at; bv = b.created_at }
    if (av < bv) return leadSort.dir === 'asc' ? -1 : 1
    if (av > bv) return leadSort.dir === 'asc' ? 1 : -1
    return 0
  })

  // Sort orçamentos
  const sortedOrcs = [...orcFiltrados].sort((a, b) => {
    let av: string | number, bv: string | number
    if (orcSort.key === 'modelo') { av = a.modelo ?? ''; bv = b.modelo ?? '' }
    else if (orcSort.key === 'valor') {
      av = (a.valor_venda_total_base ?? 0) + (a.valor_venda_acabamento_total ?? 0) + (a.valor_colocacao ?? 0)
      bv = (b.valor_venda_total_base ?? 0) + (b.valor_venda_acabamento_total ?? 0) + (b.valor_colocacao ?? 0)
    } else { av = a.created_at; bv = b.created_at }
    if (av < bv) return orcSort.dir === 'asc' ? -1 : 1
    if (av > bv) return orcSort.dir === 'asc' ? 1 : -1
    return 0
  })

  function toggleLeadSort(key: LeadSortKey) {
    setLeadSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' })
  }
  function toggleOrcSort(key: OrcSortKey) {
    setOrcSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' })
  }

  function LeadSortIcon({ k }: { k: LeadSortKey }) {
    if (leadSort.key !== k) return <ChevronsUpDown className="h-3 w-3 opacity-40" />
    return leadSort.dir === 'asc' ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />
  }
  function OrcSortIcon({ k }: { k: OrcSortKey }) {
    if (orcSort.key !== k) return <ChevronsUpDown className="h-3 w-3 opacity-40" />
    return orcSort.dir === 'asc' ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="rounded-xl border bg-card shadow-sm animate-pulse">
          <div className="border-b px-5 py-4"><div className="h-5 w-48 rounded bg-muted" /></div>
          <div className="p-5 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded bg-muted" />)}</div>
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

      {/* ─── Tabela de Leads (CRM) ─── */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold">Leads do Agente IA</h2>
            <span className="text-xs text-muted-foreground">{filtrados.length} lead{filtrados.length !== 1 ? 's' : ''}</span>
          </div>
          <PeriodTabs value={periodo} onChange={setPeriodo} />
        </div>

        {filtrados.length === 0 ? (
          <div className="py-12 text-center space-y-1">
            <Bot className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium">Nenhum lead neste período</p>
            <p className="text-xs text-muted-foreground">{leads.length > 0 ? 'Tente um período maior' : 'Dados vêm da tabela crm_sombrear_ia'}</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {([
                      { label: 'Entrada',       key: 'created_at' as LeadSortKey },
                      { label: 'Nome',           key: 'nome' as LeadSortKey },
                      { label: 'WhatsApp' },
                      { label: 'Modelo / Ambiente' },
                      { label: 'Último valor' },
                      { label: 'Últ. mensagem', key: 'timestamp_ultima_msg' as LeadSortKey },
                      { label: 'Status' },
                      { label: 'Horário' },
                    ] as { label: string; key?: LeadSortKey }[]).map(({ label, key }) => (
                      <th
                        key={label}
                        className={`px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap ${key ? 'cursor-pointer select-none hover:text-foreground' : ''}`}
                        onClick={() => key && toggleLeadSort(key)}
                      >
                        <span className="flex items-center gap-1">{label}{key && <LeadSortIcon k={key} />}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedLeads.map((lead) => {
                    const foraEntrada = isForaDoHorario(lead.created_at)
                    const foraMsg     = isForaDoHorario(lead.timestamp_ultima_msg)
                    const expanded    = expandedId === lead.id
                    return (
                      <>
                        <tr
                          key={lead.id}
                          className={`border-b last:border-0 transition-colors cursor-pointer
                            ${foraEntrada ? 'bg-blue-500/[0.03]' : ''}
                            ${expanded ? 'bg-muted/30' : 'hover:bg-muted/20'}`}
                          onClick={() => setExpandedId(expanded ? null : lead.id)}
                        >
                          <td className="px-5 py-3.5 text-muted-foreground tabular-nums whitespace-nowrap">
                            <span className="block">{formatDate(lead.created_at)}</span>
                            <span className="text-xs opacity-70">{formatTime(lead.created_at)}</span>
                          </td>
                          <td className="px-5 py-3.5 font-medium">{lead.nome ?? '—'}</td>
                          <td className="px-5 py-3.5">
                            {lead.whatsapp
                              ? <span className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3 shrink-0" />{lead.whatsapp}</span>
                              : '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="block font-medium">{lead.modelo_interesse ?? '—'}</span>
                            {lead.ambiente && <span className="text-xs text-muted-foreground">{lead.ambiente}</span>}
                          </td>
                          <td className="px-5 py-3.5 font-medium">{lead.ultimo_valor_cotado ?? '—'}</td>
                          <td className="px-5 py-3.5 tabular-nums whitespace-nowrap">
                            <span className={`block text-sm ${foraMsg ? 'text-blue-500 dark:text-blue-400 font-medium' : 'text-muted-foreground'}`}>
                              {formatDate(lead.timestamp_ultima_msg)}
                            </span>
                            <span className="text-xs opacity-70">{formatTime(lead.timestamp_ultima_msg)}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${statusStyle(lead.status_lead)}`}>
                              {statusLabel(lead.status_lead)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="flex items-center gap-1.5">
                              {foraEntrada
                                ? <span className="flex items-center gap-1 text-xs font-medium text-blue-500 dark:text-blue-400"><Moon className="h-3 w-3" />Fora</span>
                                : <span className="text-xs text-muted-foreground">Comercial</span>
                              }
                              <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground/50 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                            </span>
                          </td>
                        </tr>

                        {expanded && (
                          <tr key={`${lead.id}-detail`} className="border-b bg-muted/10">
                            <td colSpan={8} className="px-5 py-4">
                              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
                                {lead.resumo_conversa && (
                                  <div className="col-span-2 sm:col-span-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Resumo da conversa</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{lead.resumo_conversa}</p>
                                  </div>
                                )}
                                {lead.medidas_coletadas && <div><p className="text-xs text-muted-foreground mb-0.5">Medidas</p><p className="font-medium">{lead.medidas_coletadas}</p></div>}
                                {lead.tecido_cor && <div><p className="text-xs text-muted-foreground mb-0.5">Tecido / Cor</p><p className="font-medium">{lead.tecido_cor}</p></div>}
                                {lead.acabamento_desejado && <div><p className="text-xs text-muted-foreground mb-0.5">Acabamento</p><p className="font-medium">{lead.acabamento_desejado}</p></div>}
                                {lead.precisa_instalacao && <div><p className="text-xs text-muted-foreground mb-0.5">Instalação</p><p className="font-medium">{lead.precisa_instalacao}</p></div>}
                                {lead.data_medicao_instalacao && <div><p className="text-xs text-muted-foreground mb-0.5">Data medição</p><p className="font-medium text-primary">{lead.data_medicao_instalacao}</p></div>}
                                {lead.endereco_cep && <div><p className="text-xs text-muted-foreground mb-0.5">CEP</p><p className="font-medium">{lead.endereco_cep}</p></div>}
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
              {sortedLeads.map((lead) => {
                const foraEntrada = isForaDoHorario(lead.created_at)
                const expanded = expandedId === lead.id
                return (
                  <div key={lead.id} className={foraEntrada ? 'bg-blue-500/[0.03]' : ''}>
                    <button className="w-full px-4 py-4 text-left" onClick={() => setExpandedId(expanded ? null : lead.id)}>
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
                          {foraEntrada && <Moon className="h-3 w-3 text-blue-500" />}
                        </div>
                        <div className="flex items-center gap-1">
                          {lead.ultimo_valor_cotado && <span className="text-sm font-bold text-primary">{lead.ultimo_valor_cotado}</span>}
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                    </button>
                    {expanded && (
                      <div className="px-4 pb-4 border-t bg-muted/20 space-y-2">
                        {lead.resumo_conversa && (
                          <div className="pt-3">
                            <p className="text-xs text-muted-foreground mb-1">Resumo</p>
                            <p className="text-sm text-muted-foreground">{lead.resumo_conversa}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                          {lead.modelo_interesse && <div><p className="text-xs text-muted-foreground">Modelo</p><p className="font-medium">{lead.modelo_interesse}</p></div>}
                          {lead.tecido_cor && <div><p className="text-xs text-muted-foreground">Tecido/Cor</p><p className="font-medium">{lead.tecido_cor}</p></div>}
                          {lead.medidas_coletadas && <div><p className="text-xs text-muted-foreground">Medidas</p><p className="font-medium">{lead.medidas_coletadas}</p></div>}
                          {lead.data_medicao_instalacao && <div><p className="text-xs text-muted-foreground">Data medição</p><p className="font-medium text-primary">{lead.data_medicao_instalacao}</p></div>}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {(foraLeads.length > 0 || foraMsgs.length > 0) && (
              <div className="border-t px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                {foraLeads.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Moon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span><span className="font-semibold text-foreground">{foraLeads.length}</span> pessoa{foraLeads.length !== 1 ? 's' : ''} atendida{foraLeads.length !== 1 ? 's' : ''} fora do horário</span>
                  </span>
                )}
                {foraMsgs.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span><span className="font-semibold text-foreground">{foraMsgs.length}</span> conversa{foraMsgs.length !== 1 ? 's' : ''} com última mensagem fora do horário</span>
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Tabela de Orçamentos IA ─── */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold">Orçamentos gerados pela IA</h2>
            <span className="text-xs text-muted-foreground">{orcFiltrados.length} orçamento{orcFiltrados.length !== 1 ? 's' : ''}</span>
          </div>
          <PeriodTabs value={periodo} onChange={setPeriodo} />
        </div>

        {orcFiltrados.length === 0 ? (
          <div className="py-12 text-center space-y-1">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium">Nenhum orçamento neste período</p>
            <p className="text-xs text-muted-foreground">{orcamentosIA.length > 0 ? 'Tente um período maior' : 'Dados vêm da tabela orcamentos_sombrear_ia'}</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {([
                      { label: 'Data',    key: 'created_at' as OrcSortKey },
                      { label: 'Modelo',  key: 'modelo' as OrcSortKey },
                      { label: 'Ambiente' },
                      { label: 'Medidas' },
                      { label: 'Tecido / Acabamento' },
                      { label: 'Qtd' },
                      { label: 'Custo base' },
                      { label: 'Valor venda' },
                      { label: 'Colocação' },
                      { label: 'Total',   key: 'valor' as OrcSortKey },
                    ] as { label: string; key?: OrcSortKey }[]).map(({ label, key }) => (
                      <th
                        key={label}
                        className={`px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap ${key ? 'cursor-pointer select-none hover:text-foreground' : ''}`}
                        onClick={() => key && toggleOrcSort(key)}
                      >
                        <span className="flex items-center gap-1">{label}{key && <OrcSortIcon k={key} />}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedOrcs.map((o) => {
                    const total = (o.valor_venda_total_base ?? 0) + (o.valor_venda_acabamento_total ?? 0) + (o.valor_colocacao ?? 0)
                    return (
                      <tr key={o.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3.5 text-muted-foreground tabular-nums whitespace-nowrap">
                          <span className="block">{formatDate(o.created_at)}</span>
                          <span className="text-xs opacity-70">{formatTime(o.created_at)}</span>
                        </td>
                        <td className="px-5 py-3.5 font-medium">{o.modelo ?? '—'}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">{o.ambiente ?? '—'}</td>
                        <td className="px-5 py-3.5 text-muted-foreground tabular-nums">
                          {o.largura && o.altura ? `${o.largura}m × ${o.altura}m` : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="block">{o.tecido ?? '—'}</span>
                          {o.acabamento && <span className="text-xs text-muted-foreground">{o.acabamento}</span>}
                        </td>
                        <td className="px-5 py-3.5 text-center">{o.quantidade ?? '—'}</td>
                        <td className="px-5 py-3.5 tabular-nums text-muted-foreground">
                          {o.custo_total_base != null ? formatCurrency(o.custo_total_base) : '—'}
                        </td>
                        <td className="px-5 py-3.5 tabular-nums">
                          {o.valor_venda_total_base != null ? formatCurrency((o.valor_venda_total_base ?? 0) + (o.valor_venda_acabamento_total ?? 0)) : '—'}
                        </td>
                        <td className="px-5 py-3.5 tabular-nums text-muted-foreground">
                          {o.valor_colocacao != null ? formatCurrency(o.valor_colocacao) : '—'}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-primary tabular-nums">
                          {total > 0 ? formatCurrency(total) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y">
              {sortedOrcs.map((o) => {
                const total = (o.valor_venda_total_base ?? 0) + (o.valor_venda_acabamento_total ?? 0) + (o.valor_colocacao ?? 0)
                return (
                  <div key={o.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="font-semibold text-sm">{o.modelo ?? '—'}</p>
                        {o.ambiente && <p className="text-xs text-muted-foreground mt-0.5">{o.ambiente}</p>}
                      </div>
                      {total > 0 && <span className="shrink-0 text-sm font-bold text-primary tabular-nums">{formatCurrency(total)}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {o.largura && o.altura ? `${o.largura}×${o.altura}m · ` : ''}{o.tecido ?? ''}
                        {o.quantidade ? ` · ${o.quantidade}un` : ''}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">{formatDate(o.created_at)}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Rodapé totais */}
            <div className="border-t px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
              <span>
                Total cotado no período:{' '}
                <span className="font-semibold text-foreground">{formatCurrency(valorTotal)}</span>
              </span>
              {orcFiltrados.some((o) => o.valor_colocacao) && (
                <span>
                  Inclui colocação:{' '}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(orcFiltrados.reduce((s, o) => s + (o.valor_colocacao ?? 0), 0))}
                  </span>
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
