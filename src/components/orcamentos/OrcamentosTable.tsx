import type { Orcamento } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  PENDENTE: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  FEITO: 'bg-green-500/10 text-green-600 dark:text-green-400',
  ERRO: 'bg-destructive/10 text-destructive',
}

interface Props { data: Orcamento[] }

export default function OrcamentosTable({ data }: Props) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="font-display font-semibold">Todos os Orçamentos</h2>
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
                  {['Cliente', 'Responsável', 'Modelo', 'Tecido', 'Qtd', 'Valor', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
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
              <div key={o.id} className="px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{o.cliente ?? 'Sem cliente'}</p>
                    <p className="text-xs text-muted-foreground">{o.responsavel}</p>
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
  )
}
