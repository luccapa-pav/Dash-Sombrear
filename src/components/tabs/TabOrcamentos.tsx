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
}

export default function TabOrcamentos({ data, loading }: Props) {
  const [search, setSearch] = useState('')
  const [responsavel, setResponsavel] = useState('todos')
  const [modelo, setModelo] = useState('todos')
  const [status, setStatus] = useState('todos')

  const filtered = data.filter((o) => {
    const matchSearch = !search || [o.cliente, o.responsavel, o.modelo, o.tecido]
      .some((v) => v?.toLowerCase().includes(search.toLowerCase()))
    const matchResp = responsavel === 'todos' || o.responsavel === responsavel
    const matchModelo = modelo === 'todos' || o.modelo === modelo
    const matchStatus = status === 'todos' || o.status === status
    return matchSearch && matchResp && matchModelo && matchStatus
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
    <div className="space-y-6">
      <KPIGrid data={filtered} />

      <div className="flex justify-end">
        <NovoOrcamentoForm />
      </div>

      <FiltersBar
        search={search} onSearchChange={setSearch}
        responsavel={responsavel} onResponsavelChange={setResponsavel}
        modelo={modelo} onModeloChange={setModelo}
        status={status} onStatusChange={setStatus}
        responsaveis={responsaveis}
        modelos={modelos}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ResponsavelChart data={filtered} />
        <ModelosChart data={filtered} />
      </div>

      <OrcamentosFechadosCard data={filtered} />

      <OrcamentosTable data={filtered} />
    </div>
  )
}
