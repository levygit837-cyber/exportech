# Mapa do site e navegação

Status: arquitetura atual documentada e expansão proposta
Última atualização: 2026-07-20

## Mapa do site desejado

```text
/
├── /iphones
│   └── /iphones/:slug
├── /comparar
├── /guias
│   └── /guias/:slug
├── /sobre
├── /ajuda
├── /atendimento
└── /politicas
    ├── /pagamento
    ├── /entrega
    ├── /garantia
    ├── /trocas-e-devolucoes
    └── /privacidade
```

Este é um mapa-alvo. Ele não representa uma sequência obrigatória nem pressupõe que já exista conteúdo para todas as rotas.

## Camadas de expansão

### Mapa mínimo atual

- `/`;
- `/iphones`;
- `/iphones/:slug`;
- `*`.

### Próxima expansão recomendada

- nenhuma nova rota antes de validar a Home de curadoria e observar dúvidas reais.

### Backlog condicionado a sinais de uso

- `/comparar`;
- `/guias`;
- `/guias/:slug`.

### Backlog condicionado a fatos comerciais

- `/sobre`;
- `/ajuda`;
- `/atendimento`;
- `/politicas/*`.

Rotas condicionadas devem permanecer ausentes enquanto não houver conteúdo real. A quantidade de páginas não é uma medida de maturidade do produto.

## Rotas publicadas atualmente

- `/`: Home de curadoria com Hero 3D, três destaques e guia compacto;
- `/iphones`: catálogo dedicado com todos os produtos existentes;
- `/iphones/:slug`: página detalhada reutilizável, com acabamento e armazenamento preservados na query string;
- `*`: página não encontrada com retorno seguro para home ou catálogo.

As demais rotas deste documento continuam como arquitetura-alvo. O CTA genérico de WhatsApp das páginas detalhadas permanece uma pendência comercial separada e não deve ser alterado até existir um número oficial aprovado.

## Responsabilidade de cada rota

| Rota | Pergunta principal | Função | Condição de publicação |
|---|---|---|---|
| `/` | Por que devo continuar? | Curadoria, exploração 3D e caminhos claros para três modelos | Catálogo e detalhes permanecem acessíveis em rotas próprias |
| `/iphones` | O que posso comprar? | Catálogo completo e configuração | Comportamento atual dos produtos preservado |
| `/iphones/:slug` | Este é o modelo certo para mim? | Detalhes, opções e modelos relacionados | Template reutilizável e dados válidos |
| `/comparar` | Qual é a diferença que realmente importa? | Apoio à decisão | Dúvidas recorrentes e campos comparativos estruturados |
| `/guias` | O que preciso entender antes? | Educação e profundidade editorial | Pelo menos um conteúdo substancial baseado em dúvida observada |
| `/guias/:slug` | Este conteúdo responde à minha dúvida? | Um tema editorial específico | Revisor identificado e data de atualização |
| `/sobre` | Por que confiar na Exportech? | Identidade empresarial verificável | História, canais, imagens e fatos reais |
| `/ajuda` | Como funcionam compra e pós-venda? | Processos e navegação das políticas | Informações operacionais validadas |
| `/atendimento` | Como falar com alguém? | Contato real e definição de expectativas | Canal ativo e política de resposta |
| `/politicas/*` | Quais são os termos exatos? | Referência durável de políticas | Revisão comercial, operacional e legal |

## Cabeçalho atual

No desktop:

1. Logo → `/`;
2. iPhones → `/iphones`;
3. Destaques → `/#destaques`;
4. Como escolher → `/#escolha`.

Não exibir uma opção inativa como se estivesse pronta. Enquanto a rota não existir, é melhor omiti-la do que levar a uma página vazia.

## Rodapé atual

O rodapé repete somente destinos reais: início, iPhones, destaques e como escolher. Atendimento, políticas, redes sociais e conteúdo institucional continuam ausentes até existirem de fato.

## Pesquisa, conta e sacola

Esses controles devem permanecer ocultos até possuírem destino, comportamento e estados completos.

| Controle | Condição mínima |
|---|---|
| Pesquisa | Catálogo e guias indexados, campos pesquisáveis definidos e estado sem resultado projetado |
| Conta | Autenticação, recuperação, informações úteis e tratamento de privacidade |
| Sacola | Adicionar, remover, quantidade, reconciliação de preço, persistência, encaminhamento e estados de erro |

Controles apenas decorativos reduzem a confiança porque prometem um fluxo inexistente.

## Opções de roteamento

### Opção A — React Router em modo declarativo

Recomendada para a próxima etapa.

Motivos:

- encaixa-se na aplicação Vite e React existente;
- exige uma mudança arquitetural pequena;
- oferece URLs reais, links, estado ativo e histórico do navegador;
- evita migração de framework;
- pode ser introduzido enquanto a home atual permanece intacta.

A instalação oficial atual usa `react-router` com `BrowserRouter`: [instalação declarativa](https://reactrouter.com/start/declarative/installation) e [modos de roteamento](https://reactrouter.com/start/modes).

### Opção B — React Router em modo de dados

Não é necessário para a primeira transição.

Pode ser considerado quando loaders por rota, mutações, estados pendentes ou limites de erro simplificarem fluxos reais de estoque e formulários.

### Opção C — migrar para Next.js ou outro framework

Rejeitada nesta fase.

Motivos:

- amplia o escopo antes da validação da arquitetura de conteúdo;
- o catálogo atual já funciona em Vite;
- o risco de migração não resolve o problema imediato do cliente;
- SSR ou geração estática podem ser úteis depois, mas não são necessários agora.

### Opção D — controlar rotas manualmente com `window.location`

Rejeitada.

Essa abordagem recria o roteamento sem oferecer de forma confiável estados ativos, rotas aninhadas, convenções de acessibilidade e tratamento futuro de erros.

## Requisito de hospedagem

Rotas no cliente exigem que o host de produção devolva a entrada da aplicação para endereços válidos como `/iphones/iphone-17`, inclusive quando o visitante abre ou atualiza essa URL diretamente.

Isso deve ser verificado na hospedagem real antes de considerar a navegação pronta.

## Regra de transição

Criar e verificar a rota antes de remover da home o conteúdo que ela substitui.

Exemplo:

1. publicar e validar `/iphones`;
2. apontar um CTA seguro para a nova rota;
3. verificar navegação, URL direta e retorno do navegador;
4. substituir o catálogo completo da home pelo Product Runway selecionado;
5. manter a mesma fonte de dados para que o rollback não duplique conteúdo.
