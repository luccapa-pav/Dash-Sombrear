import { Search } from 'lucide-react'

interface Props {
  search: string; onSearchChange: (v: string) => void
  responsavel: string; onResponsavelChange: (v: string) => void
  modelo: string; onModeloChange: (v: string) => void
  status: string; onStatusChange: (v: string) => void
  periodo: string; onPeriodoChange: (v: string) => void
  responsaveis: string[]
  modelos: string[]
}

const selectClass = 'flex-1 min-w-[140px] rounded-lg border bg-card px-3 py-2.5 text-sm outline-none ring-ring focus:ring-2 cursor-pointer'

const PERIODOS = [
  { value: 'todos', label: 'Tudo' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
]

export default function FiltersBar({ search, onSearchChange, responsavel, onResponsavelChange, modelo, onModeloChange, status, onStatusChange, periodo, onPeriodoChange, responsaveis, modelos }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar cliente, responsável..."
          className="w-full rounded-lg border bg-card py-2.5 pl-9 pr-3 text-sm outline-none ring-ring focus:ring-2"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 rounded-lg bg-muted/60 p-1">
          {PERIODOS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onPeriodoChange(value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                periodo === value
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <select value={responsavel} onChange={(e) => onResponsavelChange(e.target.value)} className={selectClass}>
          <option value="todos">Todos responsáveis</option>
          {responsaveis.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={modelo} onChange={(e) => onModeloChange(e.target.value)} className={selectClass}>
          <option value="todos">Todos modelos</option>
          {modelos.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={status} onChange={(e) => onStatusChange(e.target.value)} className={selectClass}>
          <option value="todos">Todos status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="FEITO">Feito</option>
          <option value="ERRO">Erro</option>
        </select>
      </div>
    </div>
  )
}
