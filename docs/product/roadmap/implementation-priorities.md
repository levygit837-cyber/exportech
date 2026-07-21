# Prioridades de implementação

Status: sequência proposta
Horizonte de decisão: entregas incrementais
Última atualização: 2026-07-20

## Decisão executiva

Roteamento, catálogo dedicado, páginas reutilizáveis de produto e a Home de curadoria já foram implementados localmente. A próxima fase não deve pressupor que a empresa possua cases, avaliações, histórico institucional ou políticas completas.

A sequência revisada prioriza superfícies que podem ser construídas com evidências disponíveis e cria aprendizado antes de ampliar o site:

1. confirmar o conjunto mínimo de verdade comercial;
2. concluir a publicação técnica do catálogo e medir ações essenciais;
3. manter as páginas reutilizáveis de produto com dados verificáveis;
4. validar a Home de curadoria como experimento reversível;
5. registrar dúvidas e sinais de interesse para decidir entre comparação, guias e suporte;
6. publicar atendimento, ajuda, políticas e conteúdo institucional somente na proporção dos fatos reais disponíveis;
7. manter o rollback estático do hero 3D e não considerar a experiência pronta para produção até concluir validação legal, visual, técnica em dispositivos reais e de valor para o cliente.

## Modelo de priorização

Cada iniciativa é avaliada por critérios observáveis:

| Critério | Pergunta |
|---|---|
| Problema ou hipótese | Qual necessidade acreditamos atender e por que ainda é uma hipótese? |
| Reaproveitamento | Os dados, componentes e imagens atuais resolvem boa parte do trabalho? |
| Prontidão de conteúdo | Já existem informações verificadas para publicar? |
| Esforço de implementação | Quanto código, conteúdo e QA são necessários? |
| Risco | Pode introduzir problemas de rota, desempenho, operação ou comunicação? |
| Sinal de validação | Que comportamento, dúvida ou resultado indicará se devemos continuar? |

Os rótulos de valor usados anteriormente eram julgamentos internos, não conclusões baseadas em tráfego, entrevistas ou conversão. Nenhum critério decide sozinho. Uma página tecnicamente simples, mas preenchida com fatos não confirmados, não está pronta. Uma experiência visual tecnicamente forte não é prioridade pública sem licença, validação em hardware real e hipótese mensurável.

## Iniciativas ordenadas

| Ordem | Iniciativa | Estado | Evidência necessária | Sinal de validação |
|---:|---|---|---|---|
| 0 | Verdade comercial mínima | Em aberto | canal oficial, responsável pelo catálogo, vigência dos preços e limites da oferta | informações aprovadas e com responsável |
| 1 | Publicação e medição de `/iphones` | Implementada localmente, publicação pendente | fallback de SPA e hospedagem real | URLs diretas funcionando e ações essenciais registradas |
| 2 | `/iphones/:slug` reutilizável | Implementada localmente | dados atuais e especificações de fonte primária | acesso aos detalhes, configurações consultadas e contato iniciado |
| 3 | Home de curadoria com Product Runway | Implementada localmente, validação externa pendente | catálogo estável e comparação antes/depois | navegação para catálogo e produto não piora |
| 4 | Coleta de aprendizado | Próxima atividade contínua | eventos básicos, dúvidas e conversas | padrões recorrentes suficientes para ordenar o backlog |
| 5 | `/comparar` ou `/guias` | Condicionada aos sinais | critérios de decisão ou dúvidas recorrentes | uso da ferramenta ou leitura útil |
| 6 | Atendimento e ajuda mínimos | Condicionada à operação real | canal ativo e processo executado | contatos chegam ao destino e expectativas são cumpridas |
| 7 | `/sobre` e políticas completas | Adiada | fatos empresariais e revisão adequada | conteúdo aprovado, específico e revisável |
| 8 | Hero interativo 3D | Experiência padrão local, produção não aprovada | licença, Safari, hardware real, hospedagem e teste de hipótese | benefício observado sem regressão técnica |
| Adiado | Conta, sacola e pesquisa | Não planejada | fluxos completos e necessidade demonstrada | definição futura |

## Plano de entregas

### Entrega 0 — verdade antes da expansão

Objetivo: remover falsas possibilidades e estabelecer o mínimo que pode ser publicado, sem exigir grande volume de prova social.

Trabalho:

- listar as afirmações comerciais atuais e planejadas;
- classificar cada uma como confirmada, pendente ou proibida;
- identificar o responsável pelo catálogo e a validade da lista de preços;
- definir um canal real de contato, caso já exista, sem prometer tempo de resposta não medido;
- remover ou ocultar pesquisa, conta e sacola enquanto não funcionarem;
- documentar rotas atuais e URLs desejadas;
- registrar um build-base e checklist de QA manual.

Pré-condições: nenhuma.
Plano de retorno: a página atual permanece intacta.

Critérios de aceite:

- nenhum controle visível promete uma função indisponível;
- nenhuma afirmação pública fica sem fonte, responsável ou indicação de que se trata de estimativa;
- plano de rotas e conteúdo aprovado.

Desbloqueia: catálogo publicável, páginas de produto e aprendizado com usuários.

### Entrega 1 — roteamento e catálogo dedicado

Status em 2026-07-15: implementada no aplicativo e em validação. O fallback da hospedagem de produção permanece pendente porque o provedor ainda não foi definido.

Objetivo: criar a primeira página útil reaproveitando o trabalho existente.

Trabalho:

- adicionar um roteador leve ao Vite e React atuais;
- criar shell compartilhado com navegação e footer;
- publicar `/iphones` usando `ProductShowcase`, dados e imagens atuais;
- manter o catálogo completo também na home durante a primeira validação;
- trocar âncoras por URLs reais sem perder fallbacks seguros em desenvolvimento;
- configurar a hospedagem para atualizações diretas de rota.

Implementado nesta entrega:

- React Router em modo declarativo com `/`, `/iphones` e página não encontrada;
- shell compartilhado, navegação ativa, histórico e links com hash;
- card único reutilizado pelo rail da home e pela grade dedicada;
- catálogo dedicado com todos os sete produtos e valores existentes;
- remoção de CTAs sem destino e de parcelamento não validado;
- Playwright em desktop e mobile Chromium; WebKit permanece pendente porque a versão atual do Playwright não oferece esse engine no macOS 12 desta máquina.

Pendente antes de concluir a entrega em produção:

- definir o provedor de hospedagem;
- configurar e verificar o fallback de SPA no domínio real;
- fornecer um número oficial antes de ativar WhatsApp;
- criar conteúdo substancial antes de publicar `/iphones/:slug`.

Pré-condições:

- escolha de roteamento aprovada;
- hospedagem compatível com fallback de SPA;
- build atual do catálogo aprovado.

Plano de retorno: a home original continua contendo o catálogo completo.

Critérios de aceite:

- `/iphones` funciona pela navegação e por URL direta;
- voltar e avançar do navegador funcionam;
- item ativo da navegação é claro;
- todos os modelos, cores, armazenamentos e preços continuam funcionando;
- nenhuma função do catálogo foi perdida.

Desbloqueia: simplificação da home e páginas individuais de produto.

### Entrega 2 — páginas reutilizáveis de produto

Status em 2026-07-20: implementada localmente para todos os slugs válidos, com configuração por query string e retorno ao catálogo.

Objetivo: oferecer profundidade usando dados verificáveis antes de depender de conteúdo institucional.

Trabalho:

- criar o template `/iphones/:slug`;
- reutilizar imagens, acabamentos, armazenamentos e preços atuais;
- documentar especificações com fonte primária;
- apresentar benefícios concretos do produto sem inventar perfis de cliente;
- ligar modelos relacionados;
- oferecer contato somente quando existir destino real.

Pré-condição: `/iphones` está estável e fácil de encontrar.
Plano de retorno: remover os links de detalhes sem alterar o catálogo.

Critérios de aceite:

- todo card pode abrir uma URL durável;
- dados técnicos possuem fonte;
- preço informa seu caráter de referência ou condição de confirmação;
- nenhuma recomendação é apresentada como comportamento comprovado de clientes;
- estados mobile, URL direta e navegação de retorno funcionam.

Desbloqueia: comparação e observação de interesse por modelo.

### Entrega 3 — simplificação mensurável da home

Status em 2026-07-20: implementada localmente na direção Product Runway. O catálogo completo e `BentoBenefits` saíram da Home; três faixas editoriais, o guia compacto e seus preços continuam derivados de `src/data/products.ts`.

Objetivo: testar se uma home mais focada melhora a descoberta sem tratar a hipótese como fato.

Trabalho:

- manter o hero e um caminho claro para `/iphones`;
- substituir o catálogo completo por uma seleção pequena usando a mesma fonte de dados;
- manter exatamente os caminhos editoriais `iphone-17-pro-max`, `iphone-17` e `iphone-17e` nesta V1;
- emitir somente eventos locais `exportech:interaction`, sem fornecedor, cookies ou requisições;
- não exigir um “momento de confiança” quando não houver fatos suficientes;
- manter módulos de guia, atendimento e prova social fora da página até possuírem conteúdo real;
- comparar cliques e navegação antes e depois da mudança.

Plano de retorno: restaurar o catálogo completo da home.

Critérios de aceite:

- catálogo completo permanece a uma ação de distância;
- nenhum CTA perde destino;
- a mudança possui sinais mínimos de comparação;
- o resultado pode ser revertido sem duplicar dados.

### Entrega 4 — aprendizado e próxima decisão

Objetivo: usar evidência leve para ordenar o backlog.

Registrar:

- produtos e configurações mais acessados;
- cliques de contato;
- dúvidas recebidas;
- objeções recorrentes;
- dificuldades observadas em desktop e mobile;
- cinco a dez conversas com potenciais clientes, quando possível.

Resultado esperado: decidir qual problema aparece primeiro entre comparação, educação, atendimento e clareza comercial.

### Entrega 5 — comparação ou conteúdo editorial

Não construir as duas frentes por padrão.

Escolher `/comparar` quando houver dúvida recorrente entre modelos e critérios estruturáveis. Escolher um ou dois guias quando as dúvidas forem melhor resolvidas por explicação.

Todo conteúdo deve:

- responder a uma dúvida observada;
- usar fontes primárias para afirmações técnicas;
- possuir data de revisão;
- evitar recomendações categóricas sem base.

### Entrega 6 — profundidade editorial e institucional

Publicar somente superfícies proporcionais aos fatos disponíveis:

- contato mínimo com canal ativo;
- ajuda curta descrevendo somente o processo que já acontece;
- políticas após definição operacional e revisão adequada;
- `/sobre` somente quando houver identidade e fatos empresariais aprovados.

Depoimentos, cases, contadores e imagens de operação não são requisitos para começar. Também não podem ser substituídos por conteúdo inventado.

### Entrega 7 — validação externa do Hero 3D padrão

Objetivo: decidir se a prévia privada merece promoção, sem assumir que complexidade visual gera valor.

Antes de qualquer publicação aberta:

- revalidar a licença do modelo;
- concluir aprovação visual humana;
- testar Safari desktop e iOS real;
- medir pelo menos um aparelho mobile físico;
- definir uma hipótese, por exemplo aumento de exploração do produto sem piora da ação principal;
- comparar a variante estática e a variante 3D.

O Hero 3D é agora a experiência padrão do checkout local atual, com poster e fallback estático. Isso não elimina os gates de produção: métricas locais de renderização comprovam viabilidade técnica no ambiente testado, não impacto em preferência, compreensão ou conversão.

Consulte a [Decisão 004](../decisions/004-future-3d-hero.md).

## Trilhos paralelos

### Trilha de engenharia

`roteamento → catálogo → detalhes de produto → Home de curadoria → medição → comparação ou guias → validação externa 3D`

### Trilha de conteúdo comercial

`verdade comercial mínima → vigência de preço → contato real → processo executado → políticas → história da empresa`

A trilha de engenharia nunca deve preencher lacunas da trilha comercial com texto inventado.

## Ainda não planejado

- contas de usuário;
- checkout e processamento de pagamento;
- persistência de sacola;
- rastreamento de pedido;
- automação de estoque;
- cotação cambial em tempo real;
- importação de avaliações;
- catálogo de acessórios;
- programa de troca.

Essas funcionalidades podem se tornar válidas mais tarde, mas nenhuma deve ser sugerida pela interface atual antes de existir.
