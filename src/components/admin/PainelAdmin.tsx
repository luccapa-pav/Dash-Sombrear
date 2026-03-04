import { useAllProfiles } from '@/hooks/useProfile'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, XCircle, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  toast: (type: 'success' | 'error', message: string) => void
}

export default function PainelAdmin({ toast }: Props) {
  const { data: profiles = [], isLoading } = useAllProfiles()
  const qc = useQueryClient()

  const approve = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase.from('profiles').update({ approved }).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['profiles'] })
      toast('success', vars.approved ? 'Usuário aprovado!' : 'Acesso revogado.')
    },
    onError: () => toast('error', 'Erro ao atualizar usuário.'),
  })

  const pendentes = profiles.filter((p) => !p.approved)
  const aprovados = profiles.filter((p) => p.approved)

  return (
    <div className="space-y-6">
      {/* Pendentes */}
      {pendentes.length > 0 && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-yellow-500/20 px-5 py-4">
            <Users className="h-5 w-5 text-yellow-600" />
            <h2 className="font-display font-semibold">Aguardando aprovação</h2>
            <span className="ml-auto rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-xs font-semibold text-yellow-700 dark:text-yellow-400">
              {pendentes.length}
            </span>
          </div>
          <div className="divide-y">
            {pendentes.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="font-medium">{p.full_name || 'Sem nome'}</p>
                  <p className="text-sm text-muted-foreground">{p.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approve.mutate({ id: p.id, approved: true })}
                    disabled={approve.isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aprovar
                  </button>
                  <button
                    onClick={() => approve.mutate({ id: p.id, approved: false })}
                    disabled={approve.isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aprovados */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <h2 className="font-display font-semibold">Usuários aprovados</h2>
          <span className="ml-auto rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-600">
            {aprovados.length}
          </span>
        </div>
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : (
          <div className="divide-y">
            {aprovados.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="font-medium">{p.full_name || 'Sem nome'}</p>
                  <p className="text-sm text-muted-foreground">{p.email}</p>
                </div>
                {p.email !== 'luccapavanallo@gmail.com' && (
                  <button
                    onClick={() => approve.mutate({ id: p.id, approved: false })}
                    disabled={approve.isPending}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                      'bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
                    )}
                  >
                    Revogar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
