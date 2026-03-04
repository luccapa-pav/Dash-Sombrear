import { useState } from 'react'
import type { Orcamento } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle2, DollarSign, FileText, ReceiptText, Pencil, Check } from 'lucide-react'
import { useMonthlyComparison } from '@/hooks/useOrcamentos'
import { useCountUp } from '@/hooks/useCountUp'

const META_KEY = 'sombrear-meta-mensal'

interface Props { data: Orcamento[] }

export default function KPIGrid({ data }: Props) {
  const fechados = data.filter((o) => o.fechado === true)
  const faturamento = fechados.reduce((s, o) => s + (o.valor_venda ?? 0), 0)
  const totalOrc = data.length
  const ticketMedio = fechados.length > 0 ? faturamento / fechados.length : 0
  const convRate = totalOrc > 0 ? (fechados.length / totalOrc) * 100 : 0

  // Animações dos valores
  const animFaturamento = useCountUp(faturamento, 950)
  const animFechados = useCountUp(fechados.length, 750)
  const animTotalOrc = useCountUp(totalOrc, 700)
  const animTicket = useCountUp(ticketMedio, 900)
  const animConv = useCountUp(convRate, 800)

  const [meta, setMeta] = useState(() => {
    const saved = localStorage.getItem(META_KEY)
    return saved ? Number(saved) : 0
  })
  const [editingMeta, setEditingMeta] = useState(false)
  const [metaInput, setMetaInput] = useState('')

  function saveMeta() {
    const val = Number(metaInput.replace(/\D/g, ''))
    setMeta(val)
    localStorage.setItem(META_KEY, String(val))
    setEditingMeta(false)
  }

  const metaPct = meta > 0 ? Math.min((faturamento / meta) * 100, 100) : 0
  const animMetaPct = useCountUp(metaPct, 1100)

  const { data: monthly } = useMonthlyComparison()
  const pctChange = monthly && monthly.previousMonth > 0
    ? ((monthly.currentMonth - monthly.previousMonth) / monthly.previousMonth) * 100
    : null

  const kpis = [
    {
      label: 'Fechamentos',
      value: String(Math.round(animFechados)),
      icon: CheckCircle2,
      highlight: true,
      sub: `${Math.round(animConv)}% conversão`,
    },
    {
      label: 'Orçamentos',
      value: String(Math.round(animTotalOrc)),
      icon: FileText,
      highlight: false,
      sub: 'no período',
    },
    {
      label: 'Ticket Médio',
      value: ticketMedio > 0 ? formatCurrency(animTicket) : '—',
      icon: ReceiptText,
      highlight: false,
      sub: 'por fechamento',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* Faturamento — animado + meta + comparativo */}
      <div
        className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-elevated cursor-default"
        style={{ animationFillMode: 'both', animationDelay: '0ms' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">Faturamento</p>
            <p className="font-display mt-1 text-xl font-bold truncate text-primary tabular-nums">
              {formatCurrency(animFaturamento)}
            </p>

            {meta > 0 ? (
              <div className="mt-1.5">
                <div className="h-1.5 w-full rounded-full bg-primary/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-gradient"
                    style={{ width: `${animMetaPct}%` }}
                  />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground truncate tabular-nums">
                  {Math.round(animMetaPct)}% de {formatCurrency(meta)}
                </p>
              </div>
            ) : pctChange !== null ? (
              <p className={`mt-0.5 text-xs font-medium truncate ${pctChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                {pctChange >= 0 ? '↑' : '↓'} {Math.abs(pctChange).toFixed(0)}% vs mês ant.
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">fechados</p>
            )}

            {meta > 0 && pctChange !== null && (
              <p className={`mt-0.5 text-xs font-medium truncate ${pctChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                {pctChange >= 0 ? '↑' : '↓'} {Math.abs(pctChange).toFixed(0)}% vs mês ant.
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="rounded-lg p-1.5 bg-primary/15 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
            <button
              onClick={() => { setMetaInput(meta > 0 ? String(meta) : ''); setEditingMeta(true) }}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              title="Definir meta"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        </div>

        {editingMeta && (
          <div className="mt-2 flex gap-1">
            <input
              autoFocus
              type="number"
              value={metaInput}
              onChange={(e) => setMetaInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveMeta(); if (e.key === 'Escape') setEditingMeta(false) }}
              placeholder="Meta R$"
              className="flex-1 min-w-0 rounded border bg-background px-2 py-1 text-xs outline-none ring-ring focus:ring-1"
            />
            <button onClick={saveMeta} className="rounded bg-primary px-2 py-1 text-white">
              <Check className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {kpis.map(({ label, value, icon: Icon, highlight, sub }, i) => (
        <div
          key={label}
          className={`animate-in fade-in-0 slide-in-from-bottom-4 duration-500 rounded-xl border p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-elevated cursor-default ${highlight ? 'border-primary/30 bg-primary/5 dark:bg-primary/10' : 'bg-card'}`}
          style={{ animationFillMode: 'both', animationDelay: `${(i + 1) * 80}ms` }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
              <p className={`font-display mt-1 text-xl font-bold truncate tabular-nums ${highlight ? 'text-primary' : ''}`}>
                {value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground truncate tabular-nums">{sub}</p>
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
