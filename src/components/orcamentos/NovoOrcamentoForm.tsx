import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useAddOrcamento } from '@/hooks/useOrcamentos'
import { cn } from '@/lib/utils'

const MODELOS = ['Rolo', 'Romeu e Julieta', 'Vertical', 'Horizontal', 'Painel', 'Cortina']

const inputClass = 'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none ring-ring focus:ring-2'
const labelClass = 'mb-1.5 block text-sm font-medium'

export default function NovoOrcamentoForm() {
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = useAddOrcamento()
  const [form, setForm] = useState({
    responsavel: '', cliente: '', largura: '', altura: '',
    modelo: MODELOS[0], tecido: '', quantidade: '1',
    cor_ferragem_motor: '', acabamentos: '', valor_venda: '',
    status: 'PENDENTE' as const,
  })

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await mutateAsync({
      responsavel: form.responsavel,
      cliente: form.cliente || null,
      largura: Number(form.largura),
      altura: Number(form.altura),
      modelo: form.modelo,
      tecido: form.tecido,
      quantidade: Number(form.quantidade),
      cor_ferragem_motor: form.cor_ferragem_motor,
      acabamentos: form.acabamentos || null,
      valor_venda: form.valor_venda ? Number(form.valor_venda) : null,
      status: form.status,
    })
    setOpen(false)
    setForm({ responsavel: '', cliente: '', largura: '', altura: '', modelo: MODELOS[0], tecido: '', quantidade: '1', cor_ferragem_motor: '', acabamentos: '', valor_venda: '', status: 'PENDENTE' })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:opacity-90 transition-opacity"
      >
        <Plus className="h-4 w-4" />
        Novo Orçamento
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-card shadow-elevated">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-display font-semibold">Novo Orçamento</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelClass}>Responsável *</label>
                  <input required value={form.responsavel} onChange={(e) => set('responsavel', e.target.value)} className={inputClass} placeholder="Nome do responsável" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelClass}>Cliente</label>
                  <input value={form.cliente} onChange={(e) => set('cliente', e.target.value)} className={inputClass} placeholder="Nome do cliente" />
                </div>
                <div>
                  <label className={labelClass}>Largura (m) *</label>
                  <input required type="number" step="0.01" value={form.largura} onChange={(e) => set('largura', e.target.value)} className={inputClass} placeholder="0.00" />
                </div>
                <div>
                  <label className={labelClass}>Altura (m) *</label>
                  <input required type="number" step="0.01" value={form.altura} onChange={(e) => set('altura', e.target.value)} className={inputClass} placeholder="0.00" />
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
                  <label className={labelClass}>Cor Ferragem / Motor *</label>
                  <input required value={form.cor_ferragem_motor} onChange={(e) => set('cor_ferragem_motor', e.target.value)} className={inputClass} placeholder="Ex: Branco, Preto, Motorizado..." />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Acabamentos</label>
                  <input value={form.acabamentos} onChange={(e) => set('acabamentos', e.target.value)} className={inputClass} placeholder="Opcional" />
                </div>
                <div>
                  <label className={labelClass}>Valor de Venda (R$)</label>
                  <input type="number" step="0.01" value={form.valor_venda} onChange={(e) => set('valor_venda', e.target.value)} className={inputClass} placeholder="0.00" />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={form.status} onChange={(e) => set('status', e.target.value as 'PENDENTE')} className={cn(inputClass, 'cursor-pointer')}>
                    <option value="PENDENTE">Pendente</option>
                    <option value="FEITO">Feito</option>
                    <option value="ERRO">Erro</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:opacity-90 disabled:opacity-60 transition-opacity">
                  {isPending ? 'Salvando...' : 'Salvar Orçamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
