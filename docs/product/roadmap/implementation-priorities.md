# Prioridades de implementação

Status: sequência proposta
Horizonte de decisão: entregas incrementais
Última atualização: 2026-07-15

## Decisão executiva

A primeira grande implementação deve ser uma rota dedicada de catálogo construída com os dados e componentes que já existem. Somente depois de essa rota estar estável a home deve deixar de renderizar o catálogo completo.

A sequência é propositalmente transitória:

1. tornar a navegação verdadeira e preparar os fatos comerciais;
2. adicionar roteamento sem retirar a experiência atual;
3. publicar o catálogo usando os ativos existentes;
4. reduzir a home depois da verificação do catálogo;
5. adicionar conteúdo real de suporte quando os fatos estiverem confirmados;
6. criar páginas reutilizáveis de produto;
7. adicionar comparação e profundidade editorial;
8. experimentar 3D somente depois da estabilização da arquitetura e do desempenho.

## Modelo de priorização

Cada iniciativa é avaliada por sete critérios:

| Critério | Pergunta |
|---|---|
| Valor para o cliente | Ajuda o visitante a entender, confiar ou escolher? |
| Reaproveitamento | Os dados, componentes e imagens atuais resolvem boa parte do trabalho? |
| Impacto na confiança | Remove ambiguidade ou oferece segurança real? |
| Prontidão de conteúdo | Já existem informações verificadas para publicar? |
| Esforço de implementação | Quanto código, conteúdo e QA são necessários? |
| Risco | Pode introduzir problemas de rota, desempenho, operação ou comunicação? |
| Valor de transição | Torna a próxima entrega mais simples e segura? |

Nenhum critério decide sozinho. Uma página tecnicamente simples, mas preenchida com fatos não confirmados, não está pronta. Um hero 3D de alto impacto, mas sem modelo licenciado e fallback, não é prioridade inicial.

## Iniciativas ordenadas

| Ordem | Iniciativa | Valor | Reaproveitamento | Prontidão | Esforço | Risco | Motivo |
|---:|---|---|---|---|---|---|---|
| 0 | Navegação verdadeira e inventário de fatos | Alto | Alto | Alta | Muito baixo | Baixo | Remove controles enganosos e inicia o trabalho de confiança sem bloquear engenharia |
| 1 | Base de rotas e `/iphones` | Alto | Muito alto | Alta | Baixo a médio | Baixo | Reutiliza o catálogo e cria o primeiro destino real fora da home |
| 2 | Simplificação da home | Alto | Alto | Alta após a etapa 1 | Baixo a médio | Baixo | Remove repetição somente depois de existir um acesso seguro ao catálogo completo |
| 3A | `/ajuda` e `/atendimento` | Muito alto | Médio | Depende dos fatos comerciais | Baixo tecnicamente | Médio no conteúdo | Grande ganho de confiança, mas exige políticas e canais validados |
| 3B | Rota reutilizável de produto | Alto | Alto | Alta | Médio | Baixo a médio | Trabalho seguro quando os fatos de suporte ainda não estão prontos; um template atende todos os modelos |
| 4 | `/comparar` | Alto | Médio | Depende de especificações estruturadas | Médio | Médio | Útil depois da normalização dos dados de produto |
| 5 | `/guias` com dois artigos fortes | Médio a alto | Médio | Exige conteúdo editorial | Médio | Baixo | Cria credibilidade e profundidade sem venda direta |
| 6 | `/sobre` | Alto potencial de confiança | Baixo | Depende de evidências reais | Baixo tecnicamente | Alto nas afirmações | Publicar somente com história, imagens, canais e fatos reais |
| 7 | Hero interativo 3D | Alta diferenciação | Baixo | Baixa hoje | Alto | Alto | Depende de modelo licenciado, desempenho, controles e fallbacks |
| Adiado | Conta, sacola e pesquisa | Potencialmente alto depois | Baixo | Baixa | Alto | Alto | Não devem aparecer antes dos fluxos reais existirem |

As etapas 3A e 3B são alternativas paralelas. Se o conteúdo de suporte estiver validado, ajuda vem primeiro. Caso contrário, páginas de produto avançam enquanto o trabalho comercial continua.

## Plano de entregas

### Entrega 0 — verdade antes da expansão

Objetivo: remover falsas possibilidades e estabelecer o que pode ser publicado.

Trabalho:

- listar todas as afirmações comerciais atuais e planejadas;
- classificar cada uma como confirmada, pendente ou proibida;
- definir canal real de contato e expectativa de resposta;
- remover ou ocultar pesquisa, conta e sacola enquanto não funcionarem;
- documentar rotas atuais e URLs desejadas;
- registrar um build-base e checklist de QA manual.

Pré-condições: nenhuma.
Plano de retorno: a página atual permanece intacta.

Critérios de aceite:

- nenhum controle visível promete uma função indisponível;
- nenhuma afirmação pública fica sem fonte ou responsável;
- plano de rotas e conteúdo aprovado.

Desbloqueia: roteamento seguro e conteúdo de suporte confiável.

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

### Entrega 2 — remover a repetição da home

Objetivo: transformar a home em introdução, não em um segundo catálogo.

Trabalho:

- manter o hero do lançamento;
- substituir o catálogo horizontal completo por três caminhos editoriais;
- ligar a prévia a `/iphones` e às futuras páginas de produto;
- manter uma versão curta do guia até `/comparar` existir;
- remover a grade de benefícios se ela não puder ser substituída por benefícios operacionais comprovados;
- adicionar uma prévia de confiança somente com fatos confirmados.

Pré-condição: `/iphones` está estável e fácil de encontrar.
Plano de retorno: restaurar o catálogo completo sem alterar os dados.

Critérios de aceite:

- não existem duas seções adjacentes cumprindo a mesma função;
- catálogo completo permanece a uma ação de distância;
- a home conta uma história de marca, não apenas uma história de preço;
- no mobile, o visitante alcança uma ação relevante sem rolagem excessiva.

Desbloqueia: espaço claro para guias, suporte e futuro 3D.

### Entrega 3 — confiança ou profundidade de produto

Esta entrega possui uma condição de conteúdo.

#### Caminho A: fatos prontos

Publicar `/ajuda` e `/atendimento` com informações confirmadas sobre:

- canal de contato;
- horário ou tempo de resposta;
- processo de pagamento;
- confirmação de disponibilidade;
- entrega ou retirada;
- responsabilidade de garantia;
- trocas, devoluções e resolução de problemas.

#### Caminho B: fatos ainda não prontos

Criar o template reutilizável `/iphones/:slug` com:

- imagens existentes;
- cores e armazenamentos disponíveis;
- lógica de preço atual;
- posicionamento curto por perfil de uso;
- modelos relacionados;
- CTA de suporte somente quando o destino for real.

Não publicar textos legais ou de atendimento apenas como placeholder.

### Entrega 4 — completar confiança e profundidade de produto

O caminho que não foi concluído na Entrega 3 passa a ser a prioridade.

Critérios de aceite:

- todo card pode abrir uma URL durável de produto;
- CTAs de suporte levam a uma experiência real;
- textos de ajuda possuem responsável e data de validação;
- nenhuma página afirma autorização, escala, garantia, entrega ou volume de clientes sem evidência.

Desbloqueia: comparação.

### Entrega 5 — comparação

Objetivo: ajudar o cliente a decidir sem abrir várias páginas.

Trabalho:

- normalizar poucos campos realmente relevantes;
- comparar dois ou três modelos;
- enfatizar diferenças em vez de especificações completas;
- reutilizar os perfis do guia de escolha;
- ligar cada resultado à página do produto.

Pré-condições:

- modelo de dados das páginas de produto disponível;
- dados comparativos com fonte e responsável;
- comportamento mobile definido.

### Entrega 6 — profundidade editorial e institucional

Publicar apenas um conjunto pequeno de páginas fortes:

- `/guias` com dois conteúdos iniciais;
- `/sobre` com evidências reais da empresa;
- políticas no footer depois da validação.

Primeiros guias recomendados:

1. Qual iPhone combina com cada tipo de uso?
2. Quanto armazenamento você realmente precisa?

Evitar lançar uma estrutura grande de blog com categorias vazias.

### Entrega 7 — experiência do hero 3D

Objetivo: introduzir diferenciação depois da estabilização da base.

O trabalho começa somente quando:

- existe um GLB fiel e licenciado;
- existe um poster estático aprovado;
- o desempenho atual da home foi medido;
- comportamentos mobile e de redução de movimento estão definidos;
- a interação possui suporte a teclado, toque e descrição acessível;
- existe fallback para erro e baixo consumo.

O primeiro experimento deve ser isolado e reversível. Ele não pode exigir reescrita do catálogo nem dos dados dos produtos.

Consulte a [Decisão 004](../decisions/004-future-3d-hero.md).

## Trilhos paralelos

### Trilha de engenharia

`roteamento → catálogo → redução da home → detalhes de produto → comparação → 3D`

### Trilha de conteúdo comercial

`inventário de fatos → contato → pagamento → entrega → garantia → devoluções → história da empresa → guias`

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
