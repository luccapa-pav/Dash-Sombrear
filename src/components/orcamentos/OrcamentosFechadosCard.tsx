import type { Orcamento } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { Trophy } from 'lucide-react'

interface Props { data: Orcamento[] }

export default function OrcamentosFechadosCard({ data }: Props) {
  const fechados = data.filter((o) => o.fechado === true)

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="font-display font-semibold">Orçamentos Fechados</h2>
        <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {fechados.length}
        </span>
      </div>

      {fechados.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-muted-foreground">
          Nenhum orçamento fechado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
          {fechados.map((o) => {
            const receita = (o.valor_venda ?? 0) + (o.instacao ?? 0)
            const margem = o.margem ?? (receita > 0 && o.custo
              ? ((receita - o.custo) / receita) * 100
              : null)
            return (
              <div
                key={o.id}
                className="rounded-xl border bg-background p-4 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{o.cliente ?? 'Cliente não informado'}</p>
                    <p className="text-xs text-muted-foreground">{o.responsavel}</p>
                  </div>
                  {margem != null && (
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400">
                      {margem.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modelo</span>
                    <span className="font-medium">{o.modelo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tecido</span>
                    <span className="font-medium">{o.tecido}</span>
                  </div>
                  {o.custo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custo</span>
                      <span className="font-medium">{formatCurrency(o.custo)}</span>
                    </div>
                  )}
                  {o.instacao && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Instalação</span>
                      <span className="font-medium">{formatCurrency(o.instacao)}</span>
                    </div>
                  )}
                  {(o.valor_venda || o.instacao) && (
                    <div className="flex justify-between border-t pt-1 mt-1">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-primary">
                        {formatCurrency((o.valor_venda ?? 0) + (o.instacao ?? 0))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
