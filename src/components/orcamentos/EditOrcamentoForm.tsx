import { useState } from 'react'
import { X, Trash2, Copy, Check as CheckIcon } from 'lucide-react'
import { useUpdateOrcamento, useDeleteOrcamento } from '@/hooks/useOrcamentos'
import type { Orcamento } from '@/lib/supabase'
import { cn, formatCurrency } from '@/lib/utils'

const MODELOS = ['Rolo', 'Romeu e Julieta', 'Vertical', 'Horizontal', 'Painel', 'Cortina']
const inputClass = 'w-full rounded-lg border bg-background px-3.5 py-3 text-sm outline-none ring-ring focus:ring-2'
const labelClass = 'mb-1.5 block text-sm font-medium'

interface Props {
  orcamento: Orcamento
  onClose: () => void
  toast: (type: 'success' | 'error', message: string) => void
}

export default function EditOrcamentoForm({ orcamento, onClose, toast }: Props) {
  const { mutateAsync: update, isPending: isUpdating } = useUpdateOrcamento()
  const { mutateAsync: remove, isPending: isDeleting } = useDeleteOrcamento()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [copied, setCopied] = useState(false)

  const [form, setForm] = useState({
    responsavel: orcamento.responsavel ?? '',
    cliente: orcamento.cliente ?? '',
    largura: orcamento.largura?.toString() ?? '',
    altura: orcamento.altura?.toString() ?? '',
    modelo: orcamento.modelo ?? MODELOS[0],
    tecido: orcamento.tecido ?? '',
    quantidade: orcamento.quantidade?.toString() ?? '1',
    cor_ferragem_motor: orcamento.cor_ferragem_motor ?? '',
    acabamentos: orcamento.acabamentos ?? '',
    valor_venda: orcamento.valor_venda?.toString() ?? '',
    status: orcamento.status ?? 'PENDENTE',
    observacoes: orcamento.observacoes ?? '',
  })

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleCopy() {
    const lines = [
      `*Orçamento Sombrear*`,
      orcamento.cliente ? `Cliente: ${orcamento.cliente}` : null,
      `Responsável: ${orcamento.responsavel}`,
      `Modelo: ${orcamento.modelo}`,
      `Tecido: ${orcamento.tecido}`,
      orcamento.largura && orcamento.altura ? `Medidas: ${orcamento.largura}m x ${orcamento.altura}m` : null,
      `Qtd: ${orcamento.quantidade}`,
      orcamento.cor_ferragem_motor ? `Ferragem/Motor: ${orcamento.cor_ferragem_motor}` : null,
      orcamento.acabamentos ? `Acabamentos: ${orcamento.acabamentos}` : null,
      orcamento.valor_venda ? `Valor: ${formatCurrency(orcamento.valor_venda)}` : null,
      orcamento.observacoes ? `Obs: ${orcamento.observacoes}` : null,
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await update({
        id: orcamento.id,
        responsavel: form.responsavel,
        cliente: form.cliente || null,
        largura: form.largura ? Number(form.largura) : null,
        altura: form.altura ? Number(form.altura) : null,
        modelo: form.modelo,
        tecido: form.tecido,
        quantidade: Number(form.quantidade),
        cor_ferragem_motor: form.cor_ferragem_motor || null,
        acabamentos: form.acabamentos || null,
        valor_venda: form.valor_venda ? Number(form.valor_venda) : null,
        status: form.status as Orcamento['status'],
        observacoes: form.observacoes || null,
      })
      toast('success', 'Orçamento atualizado!')
      onClose()
    } catch {
      toast('error', 'Erro ao atualizar orçamento.')
    }
  }

  async function handleDelete() {
    try {
      await remove(orcamento.id)
      toast('success', 'Orçamento excluído.')
      onClose()
    } catch {
      toast('error', 'Erro ao excluir orçamento.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl shadow-elevated max-h-[92dvh] flex flex-col">
        <div className="flex items-center justify-between border-b px-5 py-4 shrink-0">
          <div>
            <h2 className="font-display font-semibold">Editar Orçamento</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Criado em {new Date(orcamento.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Copiar para WhatsApp"
            >
              {copied ? <CheckIcon className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className={labelClass}>Responsável *</label>
              <input required value={form.responsavel} onChange={(e) => set('responsavel', e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={labelClass}>Cliente</label>
              <input value={form.cliente} onChange={(e) => set('cliente', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Largura (m)</label>
              <input type="number" step="0.01" value={form.largura} onChange={(e) => set('largura', e.target.value)} className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={labelClass}>Altura (m)</label>
              <input type="number" step="0.01" value={form.altura} onChange={(e) => set('altura', e.target.value)} className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={labelClass}>Modelo *</label>
              <select required value={form.modelo} onChange={(e) => set('modelo', e.target.value)} className={cn(inputClass, 'cursor-pointer')}>
                {MODELOS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Quantidade *</label>
              <input required type="number" min="1" value={form.quantidade} onChange={(e) => set('quantidade', e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Tecido *</label>
              <input required value={form.tecido} onChange={(e) => set('tecido', e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Cor Ferragem / Motor</label>
              <input value={form.cor_ferragem_motor} onChange={(e) => set('cor_ferragem_motor', e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Acabamentos</label>
              <input value={form.acabamentos} onChange={(e) => set('acabamentos', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Valor de Venda (R$)</label>
              <input type="number" step="0.01" value={form.valor_venda} onChange={(e) => set('valor_venda', e.target.value)} className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={cn(inputClass, 'cursor-pointer')}>
                <option value="PENDENTE">Pendente</option>
                <option value="FEITO">Feito</option>
                <option value="ERRO">Erro</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Observações</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => set('observacoes', e.target.value)}
                className={cn(inputClass, 'resize-none')}
                rows={3}
                placeholder="Endereço de instalação, detalhes extras..."
              />
            </div>
          </div>

          {confirmDelete ? (
            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="mb-3 text-sm font-medium text-destructive">Tem certeza que deseja excluir este orçamento?</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirmDelete(false)} className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
                  Cancelar
                </button>
                <button type="button" onClick={handleDelete} disabled={isDeleting} className="flex-1 rounded-lg bg-destructive px-3 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-60 transition-opacity">
                  {isDeleting ? 'Excluindo...' : 'Confirmar exclusão'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-lg border border-destructive/40 px-3 py-3 text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={onClose} className="flex-1 rounded-lg border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isUpdating} className="flex-1 rounded-lg bg-brand-gradient px-4 py-3 text-sm font-semibold text-white shadow-brand hover:opacity-90 disabled:opacity-60 transition-opacity">
                {isUpdating ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
