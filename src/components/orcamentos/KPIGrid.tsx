import { useState } from 'react'
import type { Orcamento } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle2, DollarSign, FileText, TrendingUp, Pencil, Check } from 'lucide-react'

const META_KEY = 'sombrear-meta-mensal'

interface Props { data: Orcamento[] }

export default function KPIGrid({ data }: Props) {
  const fechados = data.filter((o) => o.status === 'FEITO')
  const faturamento = fechados.reduce((s, o) => s + (o.valor_venda ?? 0), 0)
  const totalOrc = data.length
  const valorTotal = data.reduce((s, o) => s + (o.valor_venda ?? 0), 0)

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

  const kpis = [
    { label: 'Fechamentos', value: String(fechados.length), icon: CheckCircle2, highlight: true, sub: `${totalOrc > 0 ? ((fechados.length / totalOrc) * 100).toFixed(0) : 0}% conversão` },
    { label: 'Orçamentos', value: String(totalOrc), icon: FileText, highlight: false, sub: 'no período' },
    { label: 'Valor Total', value: formatCurrency(valorTotal), icon: TrendingUp, highlight: false, sub: 'todos' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* Faturamento com meta */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">Faturamento</p>
            <p className="font-display mt-1 text-xl font-bold truncate text-primary">{formatCurrency(faturamento)}</p>

            {meta > 0 ? (
              <div className="mt-1.5">
                <div className="h-1.5 w-full rounded-full bg-primary/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-gradient transition-all duration-700"
                    style={{ width: `${metaPct}%` }}
                  />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  {metaPct.toFixed(0)}% de {formatCurrency(meta)}
                </p>
              </div>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">fechados</p>
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
