import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Orcamento } from '@/lib/supabase'
import KPIGrid from '@/components/orcamentos/KPIGrid'
import OrcamentosFechadosCard from '@/components/orcamentos/OrcamentosFechadosCard'
import OrcamentosTable from '@/components/orcamentos/OrcamentosTable'
import NovoOrcamentoForm from '@/components/orcamentos/NovoOrcamentoForm'
import FiltersBar from '@/components/orcamentos/FiltersBar'
import ResponsavelChart from '@/components/charts/ResponsavelChart'
import ModelosChart from '@/components/charts/ModelosChart'
import RankingResponsavel from '@/components/orcamentos/RankingResponsavel'

interface Props {
  data: Orcamento[]
  loading: boolean
  toast: (type: 'success' | 'error', message: string) => void
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm animate-pulse">
      <div className="h-3 w-20 rounded bg-muted mb-3" />
      <div className="h-7 w-28 rounded bg-muted mb-2" />
      <div className="h-3 w-16 rounded bg-muted" />
    </div>
  )
}

export default function TabOrcamentos({ data, loading, toast }: Props) {
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [responsavel, setResponsavel] = useState('todos')
  const [modelo, setModelo] = useState('todos')
  const [status, setStatus] = useState('todos')
  const [periodo, setPeriodo] = useState('todos')

  const filtered = data.filter((o) => {
    const matchSearch = !search || [o.cliente, o.responsavel, o.modelo, o.tecido]
      .some((v) => v?.toLowerCase().includes(search.toLowerCase()))
    const matchResp = responsavel === 'todos' || o.responsavel === responsavel
    const matchModelo = modelo === 'todos' || o.modelo === modelo
    const matchStatus = status === 'todos' || o.status === status

    let matchPeriodo = true
    if (periodo !== 'todos' && o.created_at) {
      const created = new Date(o.created_at)
      const now = new Date()
      if (periodo === 'hoje') {
        matchPeriodo = created.toDateString() === now.toDateString()
      } else if (periodo === 'semana') {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
        matchPeriodo = created >= weekAgo
      } else if (periodo === 'mes') {
        matchPeriodo = created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      }
    }

    return matchSearch && matchResp && matchModelo && matchStatus && matchPeriodo
  })

  const responsaveis = [...new Set(data.map((o) => o.responsavel))].filter(Boolean)
  const modelos = [...new Set(data.map((o) => o.modelo))].filter(Boolean)
  const isFiltered = filtered.length !== data.length

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <div className="rounded-xl border bg-card shadow-sm animate-pulse">
          <div className="border-b px-5 py-4"><div className="h-5 w-48 rounded bg-muted" /></div>
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded bg-muted" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-5">
        <KPIGrid data={filtered} />

        {/* Desktop button */}
        <div className="hidden md:flex justify-end">
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-150"
          >
            <Plus className="h-4 w-4" />
            Novo Orçamento
          </button>
        </div>

        <FiltersBar
          search={search} onSearchChange={setSearch}
          responsavel={responsavel} onResponsavelChange={setResponsavel}
          modelo={modelo} onModeloChange={setModelo}
          status={status} onStatusChange={setStatus}
          periodo={periodo} onPeriodoChange={setPeriodo}
          responsaveis={responsaveis}
          modelos={modelos}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <RankingResponsavel data={filtered} />
          <ResponsavelChart data={filtered} />
          <ModelosChart data={filtered} />
        </div>

        <OrcamentosFechadosCard data={filtered} />
        <OrcamentosTable data={filtered} toast={toast} isFiltered={isFiltered} />
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-20 right-4 z-40 md:hidden flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white hover:scale-110 active:scale-90 transition-all duration-200 fab-pulse"
        aria-label="Novo Orçamento"
      >
        <Plus className="h-6 w-6" />
      </button>

      <NovoOrcamentoForm toast={toast} open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  )
}
