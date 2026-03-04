import { X } from 'lucide-react'
import { useState } from 'react'
import { useAddOrcamento } from '@/hooks/useOrcamentos'
import { cn } from '@/lib/utils'

const MODELOS = ['Rolo', 'Romeu e Julieta', 'Vertical', 'Horizontal', 'Painel', 'Cortina']
const inputClass = 'w-full rounded-lg border bg-background px-3.5 py-3 text-sm outline-none ring-ring focus:ring-2'
const labelClass = 'mb-1.5 block text-sm font-medium'

interface Props {
  toast: (type: 'success' | 'error', message: string) => void
  open: boolean
  onClose: () => void
}

export default function NovoOrcamentoForm({ toast, open, onClose }: Props) {
  const { mutateAsync, isPending } = useAddOrcamento()
  const [form, setForm] = useState({
    responsavel: '', cliente: '', telefone: '', largura: '', altura: '',
    modelo: MODELOS[0], tecido: '', quantidade: '1',
    cor_ferragem_motor: '', acabamentos: '', valor_venda: '', observacoes: '',
  })

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await mutateAsync({
        responsavel: form.responsavel,
        cliente: form.cliente || null,
        telefone: form.telefone || null,
        largura: form.largura ? Number(form.largura) : null,
        altura: form.altura ? Number(form.altura) : null,
        modelo: form.modelo,
        tecido: form.tecido,
        quantidade: Number(form.quantidade),
        cor_ferragem_motor: form.cor_ferragem_motor || null,
        acabamentos: form.acabamentos || null,
        valor_venda: form.valor_venda ? Number(form.valor_venda) : null,
        fechado: false,
        observacoes: form.observacoes || null,
      })
      toast('success', 'Orçamento salvo com sucesso!')
      onClose()
      setForm({ responsavel: '', cliente: '', telefone: '', largura: '', altura: '', modelo: MODELOS[0], tecido: '', quantidade: '1', cor_ferragem_motor: '', acabamentos: '', valor_venda: '', observacoes: '' })
    } catch {
      toast('error', 'Erro ao salvar orçamento.')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl shadow-elevated max-h-[92dvh] flex flex-col">
        <div className="flex items-center justify-between border-b px-5 py-4 shrink-0">
          <h2 className="font-display font-semibold">Novo Orçamento</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className={labelClass}>Responsável *</label>
              <input required value={form.responsavel} onChange={(e) => set('responsavel', e.target.value)} className={inputClass} placeholder="Nome do responsável" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={labelClass}>Cliente</label>
              <input value={form.cliente} onChange={(e) => set('cliente', e.target.value)} className={inputClass} placeholder="Nome do cliente" />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Telefone</label>
              <input type="tel" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} className={inputClass} placeholder="(00) 00000-0000" />
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
              <input required value={form.tecido} onChange={(e) => set('tecido', e.target.value)} className={inputClass} placeholder="Ex: Blackout, Solar Screen..." />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Cor Ferragem / Motor</label>
              <input value={form.cor_ferragem_motor} onChange={(e) => set('cor_ferragem_motor', e.target.value)} className={inputClass} placeholder="Ex: Branco, Preto, Motorizado..." />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Acabamentos</label>
              <input value={form.acabamentos} onChange={(e) => set('acabamentos', e.target.value)} className={inputClass} placeholder="Opcional" />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Valor de Venda (R$)</label>
              <input type="number" step="0.01" value={form.valor_venda} onChange={(e) => set('valor_venda', e.target.value)} className={inputClass} placeholder="0.00" />
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

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex-1 rounded-lg bg-brand-gradient px-4 py-3 text-sm font-semibold text-white shadow-brand hover:opacity-90 disabled:opacity-60 transition-opacity">
              {isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
