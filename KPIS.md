# Catálogo de KPIs — Grupo Mont Dashboard

Este documento descreve os indicadores **realmente implementados** na camada `src/domain`. Os valores exibidos no dashboard derivam destas fórmulas aplicadas ao dataset demonstrativo de agosto/2026.

**Período de reporte:** `2026-08`  
**Data de referência (as-of):** `2026-08-28`

---

## CEO / META

Métricas consolidadas por empresa na visão executiva (`buildGroupOverview`). Cada empresa usa uma métrica principal distinta — a comparação entre elas é feita pelo **percentual de atingimento e forecast**, não pelos valores absolutos.

| Empresa | Métrica principal |
|---------|-------------------|
| Montseguro | Vidas implantadas |
| Prop5 | Comissão realizada |
| TechBrabo | Receita reconhecida |

---

### Realizado

**Empresa/área:** CEO Overview — por empresa  
**Finalidade:** Medir o resultado efetivo alcançado no período até a data de referência.  
**Fórmula:**

- Montseguro: soma de `lives` em `HealthContract` com `implantedAt` no período
- Prop5: soma de `realizedCommission` em `InvestmentDeal` com `closedAt` no período
- TechBrabo: `recognizedRevenue` em `RevenueMonthly` para o período

**Fonte de dados:** `healthContracts.json`, `investmentDeals.json`, `revenueMonthly.json`  
**Interpretação:** Quanto já foi efetivamente realizado. Na Montseguro, usa data de implantação — não o status atual da oportunidade.  
**Limitação/Premissa:** Depende de datas corretas nos registros; não há reconciliação com sistemas externos.

---

### Meta

**Empresa/área:** CEO Overview — por empresa  
**Finalidade:** Valor-alvo do período completo.  
**Fórmula:** `targetValue` em `targets.json` para a métrica correspondente:

- Montseguro: `implanted_lives`
- Prop5: `commission_realized`
- TechBrabo: `recognized_revenue`

**Fonte de dados:** `targets.json`  
**Interpretação:** O que a empresa precisa atingir ao final do mês.

---

### Atingimento atual

**Empresa/área:** CEO Overview — por empresa  
**Finalidade:** Percentual do realizado em relação à meta final do período.  
**Fórmula:** `(realizado / meta) × 100`  
**Fonte de dados:** Derivado de realizado e meta  
**Interpretação:** Quanto da meta já foi conquistado. Complementar ao forecast para leitura de ritmo.

---

### Meta esperada até hoje

**Empresa/área:** CEO Overview — por empresa  
**Finalidade:** Calcular quanto deveria ter sido realizado proporcionalmente aos dias decorridos.  
**Fórmula:** `meta × (dias decorridos / dias do mês)`  
**Fonte de dados:** `targets.json` + data de referência em `period.ts`  
**Interpretação:** Referência de ritmo linear. Em 28/08 (de 31 dias), a meta esperada é ~90,3% da meta final.  
**Limitação/Premissa:** Assume distribuição uniforme ao longo do mês.

---

### Gap de ritmo

**Empresa/área:** CEO Overview — por empresa  
**Finalidade:** Medir se o realizado está acima ou abaixo do esperado para a data.  
**Fórmula:** `realizado − meta esperada até hoje`  
**Fonte de dados:** Derivado  
**Interpretação:** Valor negativo indica atraso de ritmo; positivo indica adiantamento.

---

### Forecast

**Empresa/área:** CEO Overview — por empresa  
**Finalidade:** Projetar o fechamento do período.  
**Fórmula:**

- **Montseguro e TechBrabo (ritmo linear):** `realizado × (dias do mês / dias decorridos)`
- **Prop5 (consultivo):** `comissão realizada no período + Σ(comissão projetada × probabilidade)` das oportunidades abertas com `expectedCloseDate` no período

**Fonte de dados:** `healthContracts.json`, `investmentDeals.json`, `opportunities.json`, `revenueMonthly.json`  
**Interpretação:** Estimativa de onde cada empresa deve fechar o mês.  
**Limitação/Premissa:** Montseguro/TechBrabo assumem ritmo constante; Prop5 depende de previsões de fechamento e probabilidades informadas.

---

### Forecast vs meta

**Empresa/área:** CEO Overview — por empresa  
**Finalidade:** Avaliar se a projeção indica atingimento da meta.  
**Fórmula:** `(forecast / meta) × 100`  
**Fonte de dados:** Derivado  
**Interpretação:** Base do status executivo. Valores ≥ 100% indicam trajetória de atingimento.

---

### Status executivo

**Empresa/área:** CEO Overview — por empresa  
**Finalidade:** Sinalização visual rápida da saúde da meta.  
**Fórmula:** Derivado de `forecast vs meta`:

| Status | Condição |
|--------|----------|
| Verde | forecast vs meta ≥ 100% |
| Amarelo | ≥ 85% e < 100% |
| Vermelho | < 85% |

**Fonte de dados:** `src/domain/common.ts` (`EXECUTIVE_STATUS_THRESHOLDS`)  
**Interpretação:** Indicador de alerta executivo, não substitui análise detalhada.  
**Limitação/Premissa:** Thresholds são configuráveis e demonstrativos.

---

## COMERCIAL

Métricas da área comercial (`buildCommercialGroupSummary` / `buildCommercialCompanyData`). Os funis são **diferentes por empresa**, com etapas e labels específicos.

### Funis por empresa

| Empresa | Etapas |
|---------|--------|
| Montseguro | Lead → Qualificado → Cotação → Proposta → Contratação → Implantação |
| Prop5 | Lead → Qualificado → Diagnóstico → Reunião → Oportunidade → Negociação → Estruturação → Fechamento |
| TechBrabo | Lead → Qualificado → Reunião → Diagnóstico → Proposta → Negociação → Contrato |

---

### Oportunidades por etapa

**Empresa/área:** Comercial — por empresa  
**Finalidade:** Quantificar quantas oportunidades alcançaram cada estágio do funil.  
**Fórmula:** Contagem de oportunidades cujo `stageHistory` contém o estágio  
**Fonte de dados:** `opportunities.json`  
**Interpretação:** Volume em cada etapa da jornada. Uma oportunidade que passou por "Proposta" também conta nas etapas anteriores.  
**Limitação/Premissa:** Considera todas as oportunidades da empresa, sem filtro por período de criação.

---

### Conversão entre etapas

**Empresa/área:** Comercial — por empresa  
**Finalidade:** Medir a eficiência de transição entre etapas consecutivas.  
**Fórmula:** `(contagem da etapa atual / contagem da etapa anterior) × 100`  
**Fonte de dados:** `opportunities.json`  
**Interpretação:** Percentual que avançou da etapa anterior para a atual.

---

### Conversão final (funil completo)

**Empresa/área:** Comercial — por empresa  
**Finalidade:** Medir a conversão da primeira à última etapa do funil.  
**Fórmula:** `(contagem da etapa final / contagem da primeira etapa) × 100`  
**Fonte de dados:** `opportunities.json`  
**Interpretação:** Eficiência global do funil comercial.

---

### Principal gargalo

**Empresa/área:** Comercial — por empresa  
**Finalidade:** Identificar a transição com maior queda percentual no funil.  
**Fórmula:** Par de etapas consecutivas com maior `(anterior − atual) / anterior × 100`  
**Fonte de dados:** Derivado do funil  
**Interpretação:** Onde investir esforço de conversão. Ex.: Contratação → Implantação na Montseguro.

---

### Ciclo médio

**Empresa/área:** Comercial — por empresa  
**Finalidade:** Tempo médio da jornada comercial até a etapa final.  
**Fórmula:** Média de `(última data em stageHistory − primeira data em stageHistory)` em dias, para oportunidades que alcançaram a etapa final  
**Fonte de dados:** `opportunities.json` (`stageHistory`)  
**Interpretação:** Quanto tempo leva para fechar um ciclo completo.  
**Limitação/Premissa:** Depende da completude do `stageHistory`; retorna `null` se não houver ciclos completos.

---

### Oportunidades abertas

**Empresa/área:** Comercial — por empresa  
**Finalidade:** Quantificar pipeline ativo em negociação.  
**Fórmula:** Contagem de oportunidades cujo estágio atual ≠ etapa final da empresa  
**Fonte de dados:** `opportunities.json`  
**Interpretação:** Volume de negócios ainda em andamento.

---

### Pipeline nominal

**Empresa/área:** Comercial — por empresa  
**Finalidade:** Valor total das oportunidades abertas.  
**Fórmula:** `Σ(value)` das oportunidades abertas  
**Fonte de dados:** `opportunities.json`  
**Interpretação:** Potencial comercial bruto. Não representa receita realizada.

---

### Pipeline ponderado

**Empresa/área:** Comercial — por empresa  
**Finalidade:** Potencial comercial ajustado pela probabilidade de fechamento.  
**Fórmula:** `Σ(value × probability)` das oportunidades abertas  
**Fonte de dados:** `opportunities.json`  
**Interpretação:** Estimativa mais realista do que o pipeline nominal pode gerar.

---

### Performance por vendedor

**Empresa/área:** Comercial — por empresa  
**Finalidade:** Comparar produtividade individual no funil e no pipeline.  
**Fórmula:** Por vendedor:

- Oportunidades atribuídas
- Conversão até etapa final do vendedor: `(oportunidades que alcançaram etapa final / total) × 100`
- Pipeline nominal e ponderado das oportunidades abertas

**Fonte de dados:** `opportunities.json`, `salespeople.json`  
**Interpretação:** Quem converte melhor e quem carrega mais pipeline.

**Limitação/Premissa — Montseguro:** a performance do vendedor termina em **Contratação** (`contracted`), enquanto **Implantação** (`implemented`) permanece no funil geral como leitura operacional. Prop5 e TechBrabo usam a etapa final do funil (Fechamento / Contrato).

---

## MARKETING

Métricas da área de marketing (`buildMarketingGroupSummary`). Campanhas filtradas pelo período de reporte (`2026-08`).

---

### Investimento

**Empresa/área:** Marketing — por empresa e campanha  
**Finalidade:** Total investido em campanhas no período.  
**Fórmula:** `Σ(investment)` das campanhas da empresa no período  
**Fonte de dados:** `campaigns.json`  
**Interpretação:** Quanto foi gasto para gerar demanda.

---

### Leads

**Empresa/área:** Marketing — por empresa, campanha e canal  
**Finalidade:** Volume de leads gerados.  
**Fórmula:** Contagem de leads vinculados à campanha (`campaignId`)  
**Fonte de dados:** `leads.json`  
**Interpretação:** Topo do funil de marketing. Inclui leads qualificados e desqualificados.

---

### Oportunidades (marketing)

**Empresa/área:** Marketing — por empresa, campanha e canal  
**Finalidade:** Leads que geraram oportunidade comercial.  
**Fórmula:** Contagem de leads com oportunidade associada (`leadId`)  
**Fonte de dados:** `leads.json`, `opportunities.json`  
**Interpretação:** Efetividade do marketing em alimentar o comercial.

---

### CPL (Custo por Lead)

**Empresa/área:** Marketing  
**Finalidade:** Custo médio para gerar cada lead.  
**Fórmula:** `investimento / leads`  
**Fonte de dados:** `campaigns.json`, `leads.json`  
**Interpretação:** Quanto custa cada lead. Menor CPL não implica melhor qualidade.

---

### Custo por oportunidade

**Empresa/área:** Marketing  
**Finalidade:** Custo médio para gerar cada oportunidade.  
**Fórmula:** `investimento / oportunidades`  
**Fonte de dados:** `campaigns.json`, `leads.json`, `opportunities.json`  
**Interpretação:** Eficiência do investimento em gerar pipeline comercial. Retorna `null` se não houver oportunidades.

---

### Lead → Oportunidade

**Empresa/área:** Marketing  
**Finalidade:** Taxa de conversão de leads em oportunidades.  
**Fórmula:** `(oportunidades / leads) × 100`  
**Fonte de dados:** `leads.json`, `opportunities.json`  
**Interpretação:** Qualidade e fit dos leads gerados.

---

### Negócios finais

**Empresa/área:** Marketing  
**Finalidade:** Leads que resultaram em fechamento na etapa final do funil.  
**Fórmula:** Contagem de leads cuja oportunidade alcançou a etapa final:

- Montseguro: `implemented`
- Prop5: `closed`
- TechBrabo: `contracted`

**Fonte de dados:** `leads.json`, `opportunities.json`  
**Interpretação:** Resultado final atribuível ao marketing.

---

### Eficiência por canal (melhor / pior)

**Empresa/área:** Marketing — por empresa  
**Finalidade:** Identificar canais com melhor e pior custo por oportunidade.  
**Fórmula:** Agregação por `channel`; melhor = menor `custo por oportunidade`; pior = maior  
**Fonte de dados:** Derivado das métricas de campanha  
**Interpretação:** Onde concentrar ou reduzir investimento.  
**Limitação/Premissa:** Considera apenas canais com pelo menos uma oportunidade.

---

## MONTSEGURO

Métricas específicas (`calculateMontseguroKpis` / `buildMontseguroCompanyView`).

---

### Vidas contratadas

**Empresa/área:** Montseguro  
**Finalidade:** Volume de vidas em contratos assinados no período.  
**Fórmula:** `Σ(lives)` em `HealthContract` com `contractedAt` no período  
**Fonte de dados:** `healthContracts.json`  
**Interpretação:** Volume contratado — pode ainda não estar implantado.

---

### Vidas implantadas

**Empresa/área:** Montseguro  
**Finalidade:** Volume de vidas efetivamente implantadas no período.  
**Fórmula:** `Σ(lives)` em `HealthContract` com `implantedAt` no período  
**Fonte de dados:** `healthContracts.json`  
**Interpretação:** Métrica principal de resultado. Base do atingimento e forecast executivo.

---

### Contratos

**Empresa/área:** Montseguro  
**Finalidade:** Quantidade de contratos assinados no período.  
**Fórmula:** Contagem de `HealthContract` com `contractedAt` no período  
**Fonte de dados:** `healthContracts.json`  
**Interpretação:** Volume de negócios fechados, independente do número de vidas.

---

### Média de vidas por contrato

**Empresa/área:** Montseguro  
**Finalidade:** Tamanho médio dos contratos.  
**Fórmula:** `média(lives)` dos contratos do período  
**Fonte de dados:** `healthContracts.json`  
**Interpretação:** Indica se os contratos tendem a ser pequenos ou grandes.

---

### Cotação → Proposta

**Empresa/área:** Montseguro  
**Finalidade:** Conversão entre cotação e proposta no período.  
**Fórmula:** Entre oportunidades que entraram em `quote` no período, percentual que também alcançou `proposal`  
**Fonte de dados:** `opportunities.json` (`stageHistory`)  
**Interpretação:** Eficiência na transição comercial inicial.

---

### Proposta → Contratação

**Empresa/área:** Montseguro  
**Finalidade:** Conversão entre proposta e contratação no período.  
**Fórmula:** Entre oportunidades que entraram em `proposal` no período, percentual que também alcançou `contracted`  
**Fonte de dados:** `opportunities.json` (`stageHistory`)  
**Interpretação:** Capacidade de fechar após proposta enviada.

---

### Contratação → Implantação

**Empresa/área:** Montseguro  
**Finalidade:** Taxa de implantação dos contratos assinados no período.  
**Fórmula:** `(contratos contratados no período com implantedAt no período / contratos contratados no período) × 100`  
**Fonte de dados:** `healthContracts.json`  
**Interpretação:** Eficiência operacional pós-venda. Gargalo comum entre contratação e implantação.

---

### Forecast de vidas

**Empresa/área:** Montseguro — CEO Overview  
**Finalidade:** Projetar vidas implantadas ao final do mês.  
**Fórmula:** `vidas implantadas × (dias do mês / dias decorridos)`  
**Fonte de dados:** Derivado  
**Interpretação:** Projeção linear de ritmo.  
**Limitação/Premissa:** Não considera sazonalidade ou pipeline de contratos pendentes de implantação.

---

## PROP5

Métricas específicas (`calculateProp5Kpis` / `buildProp5CompanyView`).

---

### Pipeline nominal

**Empresa/área:** Prop5  
**Finalidade:** Valor total das oportunidades abertas.  
**Fórmula:** `Σ(value)` das oportunidades com estágio ≠ `closed`  
**Fonte de dados:** `opportunities.json`  
**Interpretação:** Potencial comercial bruto. **Valor do ativo ≠ receita.**

---

### Pipeline ponderado

**Empresa/área:** Prop5  
**Finalidade:** Potencial ajustado pela probabilidade.  
**Fórmula:** `Σ(value × probability)` das oportunidades abertas  
**Fonte de dados:** `opportunities.json`  
**Interpretação:** Estimativa de conversão do pipeline. **Pipeline ≠ receita.**

---

### Comissão projetada

**Empresa/área:** Prop5  
**Finalidade:** Soma da comissão projetada dos deals ativos (não fechados).  
**Fórmula:** `Σ(projectedCommission)` em `InvestmentDeal` com `closedAt = null`  
**Fonte de dados:** `investmentDeals.json`  
**Interpretação:** Potencial de comissão dos negócios em andamento.

---

### Comissão realizada

**Empresa/área:** Prop5  
**Finalidade:** Comissão efetivamente recebida no período.  
**Fórmula:** `Σ(realizedCommission)` em `InvestmentDeal` com `closedAt` no período  
**Fonte de dados:** `investmentDeals.json`  
**Interpretação:** **Indicador utilizado como resultado da meta.** Representa o realizado financeiro da Prop5.

---

### Taxa de fechamento

**Empresa/área:** Prop5  
**Finalidade:** Proporção de oportunidades que chegaram ao fechamento.  
**Fórmula:** `(oportunidades com estágio closed / total de oportunidades) × 100`  
**Fonte de dados:** `opportunities.json`  
**Interpretação:** Eficiência global de conversão.  
**Limitação/Premissa:** Considera todas as oportunidades da empresa, não apenas as criadas no período.

---

### Ciclo médio

**Empresa/área:** Prop5 — via área Comercial  
**Finalidade:** Tempo médio até o fechamento.  
**Fórmula:** Média de dias entre primeira e última entrada em `stageHistory` para oportunidades que alcançaram `closed`  
**Fonte de dados:** `opportunities.json`  
**Interpretação:** Reflete o ciclo consultivo longo do negócio.

---

### Concentração top 3 (pipeline ponderado)

**Empresa/área:** Prop5  
**Finalidade:** Medir dependência de poucas oportunidades grandes.  
**Fórmula:** `(soma dos 3 maiores value × probability / pipeline ponderado total) × 100`  
**Fonte de dados:** `opportunities.json`  
**Interpretação:** Concentração elevada indica risco de dependência. Alerta gerado acima de 40%.

---

### Forecast de comissão

**Empresa/área:** Prop5 — CEO Overview  
**Finalidade:** Projetar comissão ao final do mês.  
**Fórmula:** `comissão realizada + Σ(projectedCommission × probability)` das oportunidades abertas com `expectedCloseDate` no período  
**Fonte de dados:** `investmentDeals.json`, `opportunities.json`  
**Interpretação:** Combina realizado com pipeline ponderado de fechamentos previstos.  
**Limitação/Premissa:** Depende de `expectedCloseDate` e probabilidades informadas manualmente.

---

## TECHBRABO

Métricas específicas (`calculateTechbraboKpis` / `buildTechbraboCompanyView`).

---

### Receita reconhecida

**Empresa/área:** TechBrabo  
**Finalidade:** Receita efetivamente reconhecida no período.  
**Fórmula:** `recognizedRevenue` em `RevenueMonthly` para o período  
**Fonte de dados:** `revenueMonthly.json`  
**Interpretação:** Métrica principal de resultado. Base do atingimento e forecast executivo.

---

### MRR

**Empresa/área:** TechBrabo  
**Finalidade:** Receita recorrente mensal ativa.  
**Fórmula:** `mrr` em `RevenueMonthly` para o período  
**Fonte de dados:** `revenueMonthly.json`  
**Interpretação:** Base recorrente estruturada. Complementa a receita pontual.

---

### Receita pontual

**Empresa/área:** TechBrabo  
**Finalidade:** Volume de receita pontual dos projetos ativos.  
**Fórmula:** `Σ(pointRevenue)` dos projetos com `status = active`  
**Fonte de dados:** `techProjects.json`  
**Interpretação:** Receita de projetos, distinta do MRR.  
**Limitação/Premissa:** Não há reconhecimento mensal detalhado por projeto no dataset — é a soma do campo `pointRevenue` dos projetos ativos, não necessariamente reconhecida no período.

---

### Projetos ativos

**Empresa/área:** TechBrabo  
**Finalidade:** Quantidade de projetos em execução.  
**Fórmula:** Contagem de `TechProject` com `status = active`  
**Fonte de dados:** `techProjects.json`  
**Interpretação:** Carga operacional atual.

---

### Projetos de alto risco

**Empresa/área:** TechBrabo  
**Finalidade:** Projetos ativos classificados como `risk = high`.  
**Fórmula:** Contagem de projetos ativos com `risk = high`  
**Fonte de dados:** `techProjects.json`  
**Interpretação:** Indicador de risco operacional. Saúde de meta e saúde operacional são leituras distintas.

---

### Pipeline nominal / ponderado

**Empresa/área:** TechBrabo  
**Finalidade:** Potencial comercial das oportunidades abertas.  
**Fórmula:**

- Nominal: `Σ(value)` das oportunidades com estágio ≠ `contracted`
- Ponderado: `Σ(value × probability)`

**Fonte de dados:** `opportunities.json`  
**Interpretação:** Pipeline comercial futuro. Não equivale a receita reconhecida.

---

### Forecast de receita

**Empresa/área:** TechBrabo — CEO Overview  
**Finalidade:** Projetar receita reconhecida ao final do mês.  
**Fórmula:** `receita reconhecida × (dias do mês / dias decorridos)`  
**Fonte de dados:** Derivado  
**Interpretação:** Projeção linear de ritmo.  
**Limitação/Premissa:** Não considera pipeline de contratos futuros nem sazonalidade de entregas.

---

## INSIGHTS

Os insights são gerados por **regras determinísticas** em `src/domain/insights.ts`. Não utilizam modelos de IA ou machine learning. Cada insight possui severidade, categoria, título, mensagem, métrica relacionada e recomendação.

### Estrutura de um insight

| Campo | Descrição |
|-------|-----------|
| `severity` | `positive`, `warning` ou `critical` |
| `category` | `meta`, `operacional`, `comercial`, `risco` ou `recorrencia` |
| `relatedMetric` | KPI que motivou o alerta |
| `recommendation` | Ação sugerida |

### Regras implementadas

| Condição | Severidade | Exemplo de título |
|----------|------------|-------------------|
| Forecast Montseguro < 100% da meta | `warning` ou `critical` (< 85%) | Forecast abaixo da meta de vidas |
| Gargalo identificado no funil Montseguro | `warning` | Gargalo entre Contratação e Implantação |
| Forecast Prop5 < 85% da meta | `critical` | Forecast de comissão abaixo de 85% |
| Concentração top 3 Prop5 > 40% | `warning` | Alta concentração no pipeline ponderado |
| Pipeline Prop5 elevado + atingimento < 90% | `warning` | Pipeline elevado com realizado abaixo da meta |
| Forecast TechBrabo ≥ 100% | `positive` | Forecast acima da meta de receita |
| Projetos de alto risco TechBrabo > 0 | `warning` ou `critical` (≥ 2) | Projetos de alto risco ativos |
| MRR TechBrabo > 0 | `positive` | Base recorrente (MRR) ativa |

**Limitação/Premissa:** As regras são fixas e baseadas no snapshot atual dos dados. Não há personalização pelo usuário nem histórico de insights anteriores.
