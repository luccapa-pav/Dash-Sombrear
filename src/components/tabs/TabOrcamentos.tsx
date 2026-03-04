import { useState } from 'react'
import type { Orcamento } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import KPIGrid from '@/components/orcamentos/KPIGrid'
import OrcamentosFechadosCard from '@/components/orcamentos/OrcamentosFechadosCard'
import OrcamentosTable from '@/components/orcamentos/OrcamentosTable'
import NovoOrcamentoForm from '@/components/orcamentos/NovoOrcamentoForm'
import FiltersBar from '@/components/orcamentos/FiltersBar'
import ResponsavelChart from '@/components/charts/ResponsavelChart'
import ModelosChart from '@/components/charts/ModelosChart'

interface Props {
  data: Orcamento[]
  loading: boolean
  toast: (type: 'success' | 'error', message: string) => void
}

export default function TabOrcamentos({ data, loading, toast }: Props) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <KPIGrid data={filtered} />

      <div className="flex justify-end">
        <NovoOrcamentoForm toast={toast} />
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ResponsavelChart data={filtered} />
        <ModelosChart data={filtered} />
      </div>

      <OrcamentosFechadosCard data={filtered} />
      <OrcamentosTable data={filtered} toast={toast} />
    </div>
  )
}
