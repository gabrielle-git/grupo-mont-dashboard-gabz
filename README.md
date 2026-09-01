# Grupo Mont — Executive Dashboard

## Sobre o desafio

Ao analisar o desafio, o ponto que mais me chamou atenção foi que as três empresas do Grupo Mont não poderiam ser tratadas como se fossem o mesmo negócio. A Montseguro acompanha vidas e implantação, a Prop5 trabalha com um ciclo consultivo e comissão, e a TechBrabo precisa separar venda, receita recorrente e capacidade operacional. A partir disso, organizei o dashboard para preservar essas diferenças e, ao mesmo tempo, permitir uma visão executiva do grupo.

As empresas modeladas:

- **Montseguro** — planos de saúde empresariais
- **Prop5** — consultoria e estruturação patrimonial/imobiliária
- **TechBrabo** — tecnologia B2B

**Os dados utilizados nesta versão são demonstrativos/simulados.** Não representam informações reais do Grupo Mont.

---

## Como interpretei os três negócios

### Montseguro

Planos de saúde empresariais. Jornada comercial modelada:

Lead → Qualificação → Cotação → Proposta → Contratação → Implantação

O que precisei separar desde o início:

- **Contrato ≠ vidas** — um contrato pode cobrir múltiplas vidas.
- **Contratação ≠ implantação** — assinar o contrato não significa que as vidas já foram implantadas.
- **Nesta modelagem demonstrativa, vidas implantadas são utilizadas como a métrica principal de resultado no período.**

### Prop5

Consultoria e estruturação patrimonial/imobiliária. Jornada modelada:

Lead → Qualificação → Diagnóstico → Reunião → Oportunidade → Negociação → Estruturação → Fechamento

Distinções que orientaram os KPIs:

- **Valor do ativo ≠ receita** — o volume financeiro do ativo não é o resultado da Prop5.
- **Pipeline ≠ venda** — oportunidades abertas representam potencial, não realizado.
- **Comissão ≠ volume financeiro** — nesta modelagem demonstrativa, a meta e o resultado são representados por comissão realizada.
- **Pipeline ponderado** = Σ(valor da oportunidade × probabilidade), representando potencial ajustado pela chance de conversão.

### TechBrabo

Tecnologia B2B. Jornada comercial modelada:

Lead → Qualificação → Reunião → Diagnóstico → Proposta → Negociação → Contrato

O que não dava para misturar:

- **Contrato assinado ≠ receita imediata** — a receita é reconhecida ao longo do tempo.
- **Receita pontual ≠ receita recorrente** — projetos e MRR têm dinâmicas diferentes.
- **MRR** representa a base recorrente ativa no período.
- Vendas precisam ser lidas junto com **capacidade e risco operacional** dos projetos ativos.

---

## Estratégia da solução

Antes de pensar em gráficos, tentei responder quais decisões cada tela deveria ajudar a tomar. A partir daí, defini os dados necessários, os KPIs e só depois montei a interface.

A linha de raciocínio que guiei foi:

```
NEGÓCIO → PERGUNTA → DADOS → KPI → VISUALIZAÇÃO → DECISÃO
```

Primeiro entendi as jornadas e as diferenças entre os três modelos. Depois modelei os dados em entidades compartilhadas e específicas, implementei os KPIs na camada de domínio e, por fim, construí a interface para consumir esses resultados — sem duplicar regras de negócio nos componentes.

---

## Decisões e trade-offs

Pelo prazo e pela natureza do desafio, algumas escolhas foram deliberadas:

- Priorizei entendimento de negócio e qualidade dos KPIs em vez de ampliar escopo visual.
- Usei dados demonstrativos locais em JSON em vez de criar backend sem necessidade real.
- Mantive regras de negócio separadas da UI (`src/domain`), para que os mesmos cálculos pudessem ser reutilizados ou testados de forma independente.
- Adotei forecasts simples e documentados (ritmo linear ou pipeline ponderado), porque o dataset não oferece histórico suficiente para modelos mais sofisticados.
- Preferi insights determinísticos e explicáveis em vez de adicionar IA apenas por aparência.
- Num cenário de evolução, conectaria as mesmas regras a fontes reais (CRM, ERP, financeiro) sem reescrever a lógica de domínio.

---

## Arquitetura

| Camada | Responsabilidade |
|--------|------------------|
| `src/data` | Dados demonstrativos em JSON e tipos TypeScript |
| `src/domain` | Regras de negócio, cálculos e KPIs |
| `src/components` | Componentes visuais reutilizáveis |
| `src/pages` | Composição das telas do dashboard |

Os componentes React **não calculam** os principais KPIs — consomem resultados da camada de domínio.

```mermaid
flowchart LR
    A[src/data<br/>JSON demonstrativo] --> B[src/domain<br/>Regras e KPIs]
    B --> C[src/components + src/pages<br/>Visualização]
    C --> D[Decisão executiva]
```

---

## Modelagem de dados

### Entidades compartilhadas

| Entidade | Papel |
|----------|-------|
| `Company` | Identifica cada empresa do grupo |
| `Campaign` | Campanha de marketing com investimento e canal |
| `Lead` | Lead gerado por campanha |
| `Salesperson` | Vendedor responsável |
| `Opportunity` | Oportunidade comercial com estágio, valor e probabilidade |
| `Target` | Meta por empresa, período e métrica |

### Entidades específicas

| Empresa | Entidade | Papel |
|---------|----------|-------|
| Montseguro | `HealthContract` | Contrato de saúde com vidas, datas de contratação e implantação |
| Prop5 | `InvestmentDeal` | Deal de investimento com valor do ativo, comissão projetada e realizada |
| TechBrabo | `TechProject` | Projeto com receita pontual, MRR, risco e status operacional |

### Papel do `stageHistory`

Cada oportunidade possui um histórico de estágios (`stageHistory`) com data de entrada em cada etapa. Isso permite:

- Calcular funis comerciais (quantas oportunidades alcançaram cada estágio)
- Medir conversões entre etapas
- Estimar ciclo médio (primeira → última etapa registrada)
- Identificar gargalos no funil

### Diagrama de relacionamentos

```mermaid
erDiagram
    Company ||--o{ Campaign : possui
    Company ||--o{ Lead : possui
    Company ||--o{ Salesperson : possui
    Company ||--o{ Opportunity : possui
    Company ||--o{ Target : possui
    Company ||--o{ RevenueMonthly : possui

    Campaign ||--o{ Lead : gera
    Salesperson ||--o{ Lead : atende
    Salesperson ||--o{ Opportunity : conduz

    Lead ||--o| Opportunity : origina

    Opportunity ||--o| HealthContract : "Montseguro"
    Opportunity ||--o| InvestmentDeal : "Prop5"
    Opportunity ||--o| TechProject : "TechBrabo"
```

Uma camada comum permite consolidação do grupo; entidades específicas preservam as diferenças dos modelos de negócio.

---

## Áreas do dashboard

### CEO Overview (`/`)

Meta, realizado, atingimento, meta esperada até a data, gap de ritmo, forecast, comparação entre empresas e prioridades sugeridas ("Onde agir primeiro").

### Comercial (`/comercial`)

Funis por empresa, conversões entre etapas, principal gargalo, ciclo médio, pipeline nominal/ponderado e performance por vendedor.

### Marketing (`/marketing`)

Investimento, leads, oportunidades, CPL, custo por oportunidade, taxa Lead → Oportunidade, negócios finais e eficiência por canal.

### Empresas (`/empresas`)

Visão aprofundada de cada modelo de negócio, com KPIs específicos e leitura contextual.

### Insights (`/insights`)

Alertas por regras determinísticas, com severidade (positivo, atenção, crítico), categoria, métrica relacionada e recomendação.

---

## Principais decisões técnicas

| Tecnologia | Uso |
|------------|-----|
| React + TypeScript | Interface tipada e componentizada |
| Vite | Build e desenvolvimento |
| React Router | Navegação entre áreas do dashboard |
| Tailwind CSS v4 | Estilização |
| Recharts | Gráficos (comparação executiva, funil, canais) |
| Lucide React | Ícones da navegação |
| JSON local | Fonte de dados demonstrativos |

Não criei backend porque o desafio permite dados simulados e o foco ficou em negócio, KPIs e visualização. Esta não é uma arquitetura de produção — é uma prova de conceito executiva com dados estáticos.

---

## Contexto temporal

| Conceito | Valor |
|----------|-------|
| Período de reporte | Agosto de 2026 (`2026-08`) |
| Data de referência (as-of) | 28/08/2026 |

### Diferença entre os conceitos de meta e ritmo

| Conceito | Significado |
|----------|-------------|
| **Meta final** | Valor-alvo do período completo (ex.: meta de vidas, meta de comissão ou meta de receita, conforme a empresa) |
| **Meta esperada até hoje** | Proporção linear da meta correspondente aos dias já decorridos no mês |
| **Realizado** | Valor efetivamente alcançado até a data de referência |
| **Gap de ritmo** | Realizado − meta esperada até hoje (negativo = abaixo do ritmo) |
| **Forecast** | Projeção de fechamento do período com base no ritmo ou pipeline (varia por empresa) |
| **Forecast vs meta** | Percentual do forecast em relação à meta final — base do status executivo |

---

## Premissas e limitações

- Dataset **completamente demonstrativo** — valores não representam dados reais do Grupo Mont.
- **Sem backend** — dados carregados de arquivos JSON locais.
- **Sem autenticação** — não há controle de acesso ou perfis de usuário.
- **Sem integração** com CRM, ERP ou sistemas financeiros.
- **Forecast Montseguro e TechBrabo** usa ritmo linear: `realizado × (dias do mês / dias decorridos)`.
- **Forecast Prop5** combina comissão realizada no período com comissão projetada das oportunidades abertas cujo `expectedCloseDate` cai no período, ponderada por probabilidade.
- **Receita pontual da TechBrabo** no dataset é a soma de `pointRevenue` dos projetos ativos — não há reconhecimento mensal detalhado por projeto.
- **Funil comercial** considera todas as oportunidades da empresa (não filtradas por período de criação).
- **Marketing** considera campanhas do período de reporte e todos os leads vinculados a cada campanha.
- Não existe histórico temporal suficiente para métricas como LTV real ou cohorts.
- Thresholds executivos (verde/amarelo/vermelho) são regras demonstrativas configuráveis em `src/domain/common.ts`.
- Período de reporte e data de referência são fixos em `src/domain/period.ts` — não há filtro dinâmico na interface.

---

## Melhorias futuras

- Integração com fontes reais de dados (CRM, ERP, financeiro)
- Filtros por período e comparação entre meses
- Histórico temporal maior para tendências e sazonalidade
- Drill-down de KPIs até o registro individual
- Autenticação e perfis de acesso (CEO, comercial, marketing)
- Alertas configuráveis pelo usuário
- Implementação de testes automatizados (unitários e de integração)
- Refinamento da experiência mobile
- Maior governança de dados (validação, versionamento, auditoria)

---

## Como executar

Instalar dependências:

```bash
npm install
```

Iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Build de produção:

```bash
npm run build
```

Visualizar o build localmente (após o build):

```bash
npm run preview
```

---

## Estrutura do projeto

```
grupo-mont-dashboard-gabz/
├── src/
│   ├── data/              # JSONs demonstrativos e tipos
│   │   ├── campaigns.json
│   │   ├── companies.json
│   │   ├── healthContracts.json
│   │   ├── investmentDeals.json
│   │   ├── leads.json
│   │   ├── opportunities.json
│   │   ├── revenueMonthly.json
│   │   ├── salespeople.json
│   │   ├── targets.json
│   │   ├── techProjects.json
│   │   └── types.ts
│   ├── domain/            # Regras de negócio e KPIs
│   │   ├── common.ts
│   │   ├── period.ts
│   │   ├── overview.ts
│   │   ├── montseguro.ts
│   │   ├── prop5.ts
│   │   ├── techbrabo.ts
│   │   ├── commercial.ts
│   │   ├── marketing.ts
│   │   ├── companies.ts
│   │   └── insights.ts
│   ├── components/
│   │   ├── layout/        # AppShell, Sidebar, Header
│   │   ├── dashboard/     # Cards e gráficos do CEO Overview
│   │   ├── commercial/    # Funil, gargalo, vendedores
│   │   ├── marketing/     # Campanhas e canais
│   │   ├── companies/     # Painéis por empresa
│   │   ├── insights/      # Lista de insights
│   │   └── shared/        # Componentes compartilhados
│   ├── pages/             # Uma página por rota
│   ├── utils/             # Formatação de valores
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── README.md
├── KPIS.md
├── package.json
└── vite.config.ts
```

Para o catálogo completo de indicadores, consulte [KPIS.md](./KPIS.md).
