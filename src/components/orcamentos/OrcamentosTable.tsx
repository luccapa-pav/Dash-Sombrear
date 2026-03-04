import { useState } from 'react'
import { Download } from 'lucide-react'
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
  const headers = ['Data', 'Cliente', 'Responsável', 'Modelo', 'Tecido', 'Qtd', 'Valor', 'Status']
  const rows = data.map((o) => [
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

interface Props {
  data: Orcamento[]
  toast: (type: 'success' | 'error', message: string) => void
}

export default function OrcamentosTable({ data, toast }: Props) {
  const [editing, setEditing] = useState<Orcamento | null>(null)

  return (
    <>
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-display font-semibold">Todos os Orçamentos</h2>
          {data.length > 0 && (
            <button
              onClick={() => exportCSV(data)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar CSV
            </button>
          )}
        </div>

        {data.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Nenhum orçamento encontrado.
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {['Data', 'Cliente', 'Responsável', 'Modelo', 'Tecido', 'Qtd', 'Valor', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => setEditing(o)}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(o.created_at)}</td>
                      <td className="px-4 py-3 font-medium">{o.cliente ?? '—'}</td>
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
              {data.map((o) => (
                <div key={o.id} onClick={() => setEditing(o)} className="px-4 py-4 cursor-pointer hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{o.cliente ?? 'Sem cliente'}</p>
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
