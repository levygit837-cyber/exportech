# Estratégia de conteúdo da página inicial

Status: limite de conteúdo desejado
Última atualização: 2026-07-15

## Função da home

A home deve responder a quatro perguntas:

1. O que a Exportech está me apresentando?
2. Por que isso é relevante para mim?
3. Por que devo confiar no próximo passo?
4. Para onde devo seguir?

Ela não deve conter todos os produtos, comparações, políticas, informações institucionais e detalhes de suporte.

## Sobreposição atual

| Seção atual | Função atual | Sobreposição |
|---|---|---|
| Hero do lançamento | Apresentar o modelo principal | Papel visual único; deve permanecer |
| Catálogo completo | Apresentar todos os iPhones | Deve pertencer principalmente a `/iphones` |
| Grade de benefícios | Explicar preço, escolha e atendimento | Repete promessas de catálogo e suporte |
| Guia de escolha interativo | Recomendar um modelo | É útil, mas se sobrepõe ao catálogo e ao futuro comparador |
| Footer | Servir como destino de suporte | Ainda é superficial para concluir a tarefa |

## Home desejada depois da criação de `/iphones`

### 1. Hero do modelo mais recente

Manter:

- modelo mais recente;
- mensagem curta e expressiva;
- ação principal para o catálogo;
- imagem estática atual.

No futuro:

- experiência 3D progressiva com poster estático e fallback.

Não adicionar especificações completas ao hero.

### 2. Três caminhos editoriais de produto

Reutilizar catálogo e guia de escolha para apresentar somente:

- experiência máxima;
- escolha equilibrada;
- entrada mais acessível.

Cada caminho deve levar a uma URL durável de catálogo ou produto. Essa seção é uma prévia, não outro catálogo completo.

### 3. Um momento de confiança verificável

Publicar apenas fatos que a empresa consiga comprovar.

Possíveis formatos após validação:

- como a disponibilidade é confirmada;
- o que acontece entre consulta e confirmação;
- expectativa real de atendimento;
- processo real de entrega ou retirada;
- processo real de conferência do produto;
- história verdadeira de cliente, com consentimento.

Não usar contadores, avaliações inventadas ou selos sem base.

### 4. Prévia de um guia útil

Destacar uma pergunta editorial, por exemplo:

- “Quanto armazenamento você realmente precisa?”
- “Qual iPhone combina com a sua rotina?”

A prévia deve levar a `/guias/:slug`.

### 5. Ação real de atendimento

Encerrar a home com:

- canal de contato verdadeiro;
- horário ou expectativa de resposta;
- explicação curta do que o especialista pode resolver.

Não direcionar um CTA de suporte a um footer sem contato acionável.

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

### Etapa A

Manter a home atual enquanto `/iphones` é construída.

### Etapa B

Quando `/iphones` estiver estável, substituir o `ProductShowcase` completo da home por três produtos selecionados usando a mesma fonte de dados.

### Etapa C

Manter o guia de escolha atual na home até `/comparar` existir.

### Etapa D

Depois da estabilização de `/comparar`, reduzir o guia da home a uma única pergunta e encaminhar a interação aprofundada ao comparador.

### Etapa E

Substituir a grade de benefícios somente quando existir uma história de confiança ou processo operacional verificável. É aceitável remover a seção antes da substituição; não é aceitável inventar conteúdo de confiança.

## Limite de conteúdo da home

Objetivo de no máximo seis momentos significativos:

1. navegação;
2. hero;
3. caminhos selecionados de produto;
4. momento de confiança verificável;
5. prévia de guia;
6. atendimento e footer.

O objetivo não é encurtar a página a qualquer custo. É garantir que cada seção cumpra uma função diferente.
