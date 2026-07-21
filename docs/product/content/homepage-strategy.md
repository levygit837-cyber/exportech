# Estratégia de conteúdo da página inicial

Status: direção Product Runway implementada localmente; hipótese de UX a validar
Última atualização: 2026-07-20

## Função da home

A home deve responder a quatro perguntas:

1. O que a Exportech está me apresentando?
2. Por que isso é relevante para mim?
3. Por que devo confiar no próximo passo?
4. Para onde devo seguir?

Ela não precisa conter todos os produtos, comparações, políticas, informações institucionais e detalhes de suporte. A redução da home é uma hipótese de UX, não uma conclusão comprovada por métricas.

## Sobreposição resolvida nesta versão

| Seção atual | Função atual | Sobreposição |
|---|---|---|
| Hero 3D | Apresentar o iPhone 17 Pro Max e conduzir uma narrativa visual | Mantido com texto à esquerda, aparelho à direita, atalho e ações finais |
| Product Runway | Dar um espaço editorial próprio a três modelos e seus preços iniciais | Substitui o catálogo completo na Home sem duplicar dados |
| Grade de benefícios | Repetia promessas de catálogo e suporte | Removida da Home |
| Guia de escolha | Oferecer atalhos editoriais de navegação | Compactado em quatro controles e uma linha de resultado |
| Footer | Repetir destinos reais | Restrito a início, iPhones, destaques e como escolher |

## Composição escolhida

### 1. Hero 3D do modelo principal

Manter:

- modelo mais recente;
- mensagem curta e expressiva;
- texto do iPhone 17 Pro Max no lado esquerdo;
- aparelho 3D no lado direito no primeiro enquadramento;
- atalho “Pular para os modelos” durante a narrativa;
- ações para o detalhe do produto e o catálogo no capítulo final;
- poster estático equivalente e fallback que nunca bloqueia o restante da Home.

Não adicionar especificações completas ao hero.

### 2. Product Runway

Usar exatamente três entradas editoriais nesta V1:

- `iphone-17-pro-max` — experiência máxima;
- `iphone-17` — escolha equilibrada;
- `iphone-17e` — entrada mais acessível.

As faixas alternam texto e mídia no desktop; no mobile preservam a ordem texto, imagem, preço e CTA. Produto, acabamento padrão, armazenamento padrão, imagem e preço são sempre resolvidos a partir de `src/data/products.ts`.

### 3. Guia compacto

Manter os quatro perfis `maximum`, `light`, `balanced` e `essential` como atalhos definidos pela interface, sem descrevê-los como comportamento comprovado de clientes. O resultado leva diretamente à página detalhada com acabamento e armazenamento na URL.

### 4. Footer

Encerrar com os mesmos destinos reais da navegação. Não preencher o espaço com atendimento, políticas, prova social ou conteúdo institucional inexistente.

## Módulos futuros condicionados

### Módulo opcional de clareza

Não reservar espaço obrigatório para depoimentos, cases, números ou história institucional. Se existir um fato operacional simples e comprovável, ele pode ser publicado.

Possíveis formatos:

- como a disponibilidade é confirmada;
- o que acontece entre consulta e confirmação;
- expectativa real de atendimento;
- processo real de entrega ou retirada;
- processo real de conferência do produto;
- história verdadeira de cliente, com consentimento, caso venha a existir.

Quando nenhum desses fatos estiver pronto, omitir o módulo. Não usar contadores, avaliações inventadas ou selos sem base.

### Prévia opcional de conteúdo útil

Destacar uma pergunta somente quando ela tiver aparecido em atendimento, observação ou conversa com potenciais clientes. Exemplos candidatos:

- “Quanto armazenamento você realmente precisa?”
- “Qual iPhone combina com a sua rotina?”

A prévia deve levar a conteúdo substancial em `/guias/:slug`. Não criar a seção apenas para preencher a home.

### Ação real de atendimento, quando disponível

Encerrar a home com:

- canal de contato verdadeiro;
- horário ou expectativa de resposta;
- explicação curta do que o especialista pode resolver.

Se ainda não houver canal oficial, omitir a ação. Não direcionar um CTA de suporte a um footer sem contato acionável.

## Conteúdo que sai da home

| Conteúdo | Destino |
|---|---|
| Catálogo completo | `/iphones` |
| Informações completas do produto | `/iphones/:slug` |
| Comparação entre vários modelos | `/comparar` |
| Guia de compra completo | `/comparar` ou `/guias` |
| Pagamento, entrega, garantia e devoluções | `/ajuda` e `/politicas/*` |
| História e evidências da empresa | `/sobre` |
| Artigos editoriais | `/guias` |

## Transição segura

### Etapas concluídas localmente

- `/iphones` e `/iphones/:slug` foram implementadas;
- `ProductShowcase` e `BentoBenefits` foram removidos da composição da Home;
- Product Runway e guia compacto usam a fonte de dados existente;
- eventos locais `exportech:interaction` preparam medição futura sem escolher fornecedor.

### Próxima etapa

Validar navegação, interesse nos três caminhos e uso do guia. Só depois decidir se `/comparar` ou conteúdo editorial resolve uma dúvida real.

### Princípios contínuos

Remover benefícios que expressem promessas não comprovadas. Não é necessário substituir a seção imediatamente. É aceitável manter uma home menor; não é aceitável inventar conteúdo de confiança.

Comparar sinais básicos antes e depois da redução, como acesso ao catálogo, abertura de produto, mudança de configuração e contato iniciado. Restaurar a versão anterior se a navegação piorar.

## Limite de conteúdo da home

Composição atual de cinco momentos:

1. navegação;
2. hero;
3. três caminhos selecionados de produto;
4. guia compacto;
5. footer.

O objetivo não é encurtar a página a qualquer custo. É garantir que cada seção cumpra uma função diferente.
