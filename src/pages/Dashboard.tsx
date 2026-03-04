import { useState } from 'react'
import { FileText, Bot, Calculator, Sun, Moon, LogOut, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/hooks/useTheme'
import { useOrcamentos } from '@/hooks/useOrcamentos'
import { useProfile } from '@/hooks/useProfile'
import TabOrcamentos from '@/components/tabs/TabOrcamentos'
import TabAgenteIA from '@/components/tabs/TabAgenteIA'
import TabCalculoCusto from '@/components/tabs/TabCalculoCusto'
import PainelAdmin from '@/components/admin/PainelAdmin'
import { cn } from '@/lib/utils'

const ADMIN_EMAIL = 'luccapavanallo@gmail.com'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('orcamentos')
  const { isDark, toggle } = useTheme()
  const { data: orcamentos = [], isLoading } = useOrcamentos()
  const { data: profile } = useProfile()

  const isAdmin = profile?.email === ADMIN_EMAIL

  const TABS = [
    { id: 'orcamentos', label: 'Orçamentos', icon: FileText },
    { id: 'agente-ia', label: 'Agente IA', icon: Bot },
    { id: 'calculo-custo', label: 'Cálculo de Custo', icon: Calculator },
    ...(isAdmin ? [{ id: 'admin', label: 'Usuários', icon: ShieldCheck }] : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-brand">
              <span className="font-display text-base font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="font-display text-lg font-bold leading-none text-foreground">Sombrear</h1>
              <p className="text-xs text-muted-foreground">
                {profile?.full_name ? profile.full_name.split(' ')[0] : 'Dashboard'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-muted/60 p-1 w-full md:w-auto md:inline-flex">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex flex-1 md:flex-none items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                activeTab === id
                  ? 'bg-card text-primary shadow-elevated'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'orcamentos' && <TabOrcamentos data={orcamentos} loading={isLoading} />}
        {activeTab === 'agente-ia' && <TabAgenteIA data={orcamentos} />}
        {activeTab === 'calculo-custo' && <TabCalculoCusto data={orcamentos} />}
        {activeTab === 'admin' && isAdmin && <PainelAdmin />}
      </main>
    </div>
  )
}
