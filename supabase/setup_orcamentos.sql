-- Remove tabela anterior se existir (cuidado: apaga dados)
-- DROP TABLE IF EXISTS orcamentos;

CREATE TABLE IF NOT EXISTS orcamentos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,

  -- Aba 1: Orçamentos
  responsavel         TEXT NOT NULL,
  cliente             TEXT,
  largura             NUMERIC(10, 2) NOT NULL,
  altura              NUMERIC(10, 2) NOT NULL,
  modelo              TEXT NOT NULL CHECK (modelo IN ('Rolo', 'Romeu e Julieta', 'Vertical', 'Horizontal', 'Painel', 'Cortina')),
  tecido              TEXT NOT NULL,
  quantidade          INTEGER NOT NULL DEFAULT 1,
  cor_ferragem_motor  TEXT NOT NULL,
  acabamentos         TEXT,
  valor_venda         NUMERIC(10, 2),
  status              TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'FEITO', 'ERRO')),

  -- Aba 3: Cálculo de Custo (opcionais)
  custo_tecido        NUMERIC(10, 2),
  custo_acabamento    NUMERIC(10, 2),
  custo_m2            NUMERIC(10, 2),
  custo_total         NUMERIC(10, 2),
  margem              NUMERIC(5, 2),

  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_orcamentos_status      ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_responsavel ON orcamentos(responsavel);
CREATE INDEX IF NOT EXISTS idx_orcamentos_modelo      ON orcamentos(modelo);
CREATE INDEX IF NOT EXISTS idx_orcamentos_created_at  ON orcamentos(created_at DESC);

-- RLS
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aprovados podem ver"     ON orcamentos FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND approved = true));
CREATE POLICY "Aprovados podem inserir" ON orcamentos FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND approved = true));
CREATE POLICY "Aprovados podem editar"  ON orcamentos FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND approved = true));
CREATE POLICY "Admin pode deletar"      ON orcamentos FOR DELETE USING (auth.jwt() ->> 'email' = 'luccapavanallo@gmail.com');
