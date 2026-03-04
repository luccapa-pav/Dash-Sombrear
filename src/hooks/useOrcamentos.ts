import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Orcamento } from '@/lib/supabase'

export function useOrcamentos() {
  return useQuery({
    queryKey: ['orcamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Orcamento[]
    },
  })
}

export function useAddOrcamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<Orcamento, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('orcamentos').insert(payload).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orcamentos'] }),
  })
}

export function useUpdateOrcamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Orcamento> & { id: string }) => {
      const { data, error } = await supabase.from('orcamentos').update(payload).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orcamentos'] }),
  })
}

export function useDeleteOrcamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('orcamentos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orcamentos'] }),
  })
}
