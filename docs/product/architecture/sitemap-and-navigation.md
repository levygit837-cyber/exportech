# Mapa do site e navegação

Status: arquitetura-alvo proposta
Última atualização: 2026-07-15

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

Este é um mapa-alvo. Não é necessário publicar todas as rotas ao mesmo tempo.

## Rotas publicadas atualmente

- `/`: home preservada com o catálogo completo durante a transição;
- `/iphones`: catálogo dedicado com todos os produtos existentes;
- `*`: página não encontrada com retorno seguro para home ou catálogo.

As demais rotas deste documento continuam como arquitetura-alvo. `/iphones/:slug` não possui link ou placeholder público. O WhatsApp também permanece fora da interface até existir um número oficial.

## Responsabilidade de cada rota

| Rota | Pergunta principal | Função | Condição de publicação |
|---|---|---|---|
| `/` | Por que devo continuar? | Impacto de marca, lançamento, caminhos selecionados e prévia de confiança | O catálogo deve existir antes da remoção do catálogo completo da home |
| `/iphones` | O que posso comprar? | Catálogo completo e configuração | Comportamento atual dos produtos preservado |
| `/iphones/:slug` | Este é o modelo certo para mim? | Detalhes, opções e modelos relacionados | Template reutilizável e dados válidos |
| `/comparar` | Qual é a diferença que realmente importa? | Apoio à decisão | Campos comparativos estruturados |
| `/guias` | O que preciso entender antes? | Educação e profundidade editorial | Pelo menos dois artigos substanciais |
| `/guias/:slug` | Este conteúdo responde à minha dúvida? | Um tema editorial específico | Revisor identificado e data de atualização |
| `/sobre` | Por que confiar na Exportech? | Identidade empresarial verificável | História, canais, imagens e fatos reais |
| `/ajuda` | Como funcionam compra e pós-venda? | Processos e navegação das políticas | Informações operacionais validadas |
| `/atendimento` | Como falar com alguém? | Contato real e definição de expectativas | Canal ativo e política de resposta |
| `/politicas/*` | Quais são os termos exatos? | Referência durável de políticas | Revisão comercial, operacional e legal |

## Cabeçalho recomendado

No desktop:

1. Logo → `/`
2. iPhones → `/iphones`
3. Comparar → `/comparar`, somente depois de existir
4. Guias → `/guias`, somente com conteúdo útil
5. Sobre → `/sobre`, somente com evidências reais
6. Ajuda → `/ajuda`, somente com políticas validadas
7. Ação principal → `/atendimento` ou destino real do WhatsApp

Não exibir uma opção inativa como se estivesse pronta. Enquanto a rota não existir, é melhor omiti-la do que levar a uma página vazia.

## Rodapé recomendado

O rodapé concentra destinos secundários e legais:

- Catálogo;
- Como escolher;
- Atendimento;
- Pagamento;
- Entrega;
- Garantia;
- Trocas e devoluções;
- Privacidade;
- identificação real da empresa, quando aprovada para publicação.

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
4. substituir o catálogo completo da home por uma prévia selecionada;
5. manter a mesma fonte de dados para que o rollback não duplique conteúdo.
