import { useState } from 'react'
import { Download, ChevronUp, ChevronDown, ChevronsUpDown, StickyNote } from 'lucide-react'
import type { Orcamento } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import EditOrcamentoForm from './EditOrcamentoForm'

const STATUS_STYLES: Record<string, string> = {
  PENDENTE: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  FEITO: 'bg-green-500/10 text-green-600 dark:text-green-400',
  ERRO: 'bg-destructive/10 text-destructive',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function exportCSV(data: Orcamento[]) {
  const headers = ['#', 'Data', 'Cliente', 'Responsável', 'Modelo', 'Tecido', 'Qtd', 'Valor', 'Status']
  const rows = data.map((o, i) => [
    i + 1,
    formatDate(o.created_at),
    o.cliente ?? '',
    o.responsavel,
    o.modelo,
    o.tecido,
    o.quantidade,
    o.valor_venda ?? '',
    o.status,
  ])
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orcamentos-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

type SortKey = 'created_at' | 'cliente' | 'responsavel' | 'valor_venda' | 'status'

interface Props {
  data: Orcamento[]
  toast: (type: 'success' | 'error', message: string) => void
  isFiltered?: boolean
}

export default function OrcamentosTable({ data, toast, isFiltered }: Props) {
  const [editing, setEditing] = useState<Orcamento | null>(null)
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'created_at', dir: 'desc' })

  function toggleSort(key: SortKey) {
    setSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
  }

  const sorted = [...data].sort((a, b) => {
    let av: string | number, bv: string | number
    if (sort.key === 'created_at') { av = a.created_at; bv = b.created_at }
    else if (sort.key === 'cliente') { av = a.cliente ?? ''; bv = b.cliente ?? '' }
    else if (sort.key === 'responsavel') { av = a.responsavel; bv = b.responsavel }
    else if (sort.key === 'valor_venda') { av = a.valor_venda ?? -1; bv = b.valor_venda ?? -1 }
    else { av = a.status; bv = b.status }
    if (av < bv) return sort.dir === 'asc' ? -1 : 1
    if (av > bv) return sort.dir === 'asc' ? 1 : -1
    return 0
  })

  function SortIcon({ k }: { k: SortKey }) {
    if (sort.key !== k) return <ChevronsUpDown className="h-3 w-3 opacity-40" />
    return sort.dir === 'asc' ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />
  }

  const COLS: { label: string; key?: SortKey }[] = [
    { label: '#' },
    { label: 'Data', key: 'created_at' },
    { label: 'Cliente', key: 'cliente' },
    { label: 'Responsável', key: 'responsavel' },
    { label: 'Modelo' },
    { label: 'Tecido' },
    { label: 'Qtd' },
    { label: 'Valor', key: 'valor_venda' },
    { label: 'Status', key: 'status' },
  ]

  return (
    <>
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-display font-semibold">Todos os Orçamentos</h2>
          {data.length > 0 && (
            <button
              onClick={() => exportCSV(sorted)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar CSV
            </button>
          )}
        </div>

        {data.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-foreground">
              {isFiltered ? 'Nenhum resultado para os filtros aplicados' : 'Nenhum orçamento ainda'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isFiltered ? 'Tente ajustar ou limpar os filtros' : 'Clique em "+ Novo Orçamento" para começar'}
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
                        onClick={() => key && toggleSort(key)}
                        className={cn(
                          'px-4 py-3 text-left font-medium text-muted-foreground select-none',
                          key && 'cursor-pointer hover:text-foreground transition-colors'
                        )}
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
                  {sorted.map((o, i) => (
                    <tr
                      key={o.id}
                      onClick={() => setEditing(o)}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">#{i + 1}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(o.created_at)}</td>
                      <td className="px-4 py-3 font-medium">
                        <span className="flex items-center gap-1.5">
                          {o.cliente ?? '—'}
                          {o.observacoes && <span title={o.observacoes}><StickyNote className="h-3 w-3 shrink-0 text-muted-foreground" /></span>}
                        </span>
                      </td>
                      <td className="px-4 py-3">{o.responsavel}</td>
                      <td className="px-4 py-3">{o.modelo}</td>
                      <td className="px-4 py-3">{o.tecido}</td>
                      <td className="px-4 py-3 text-center">{o.quantidade}</td>
                      <td className="px-4 py-3">{o.valor_venda ? formatCurrency(o.valor_venda) : '—'}</td>
                      <td className="px-4 py-3">
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
              {sorted.map((o, i) => (
                <div key={o.id} onClick={() => setEditing(o)} className="px-4 py-4 cursor-pointer hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-muted-foreground">#{i + 1}</span>
                        <p className="font-semibold text-sm truncate">{o.cliente ?? 'Sem cliente'}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{o.responsavel} · {formatDate(o.created_at)}</p>
                    </div>
                    <span className={cn('ml-2 shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_STYLES[o.status])}>
                      {o.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{o.modelo} · {o.tecido}</span>
                    {o.valor_venda
                      ? <span className="text-sm font-bold text-primary">{formatCurrency(o.valor_venda)}</span>
                      : <span className="text-xs text-muted-foreground">Sem valor</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {editing && (
        <EditOrcamentoForm
          orcamento={editing}
          onClose={() => setEditing(null)}
          toast={toast}
        />
      )}
    </>
  )
}
