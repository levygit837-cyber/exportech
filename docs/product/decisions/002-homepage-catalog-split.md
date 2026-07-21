# Decisão 002: testar a separação entre home e catálogo completo

Status: experimento reversível implementado localmente
Data: 2026-07-14
Início da transição: 2026-07-15
Última revisão: 2026-07-20

## Contexto

A home anterior apresentava um hero de produto, o catálogo completo, benefícios e um guia de escolha. A sobreposição entre essas seções é uma hipótese de UX baseada na análise interna, ainda sem métricas, entrevistas ou teste comparativo. Antes da separação foram implementados os destinos substitutos `/iphones` e `/iphones/:slug`.

## Opções consideradas

### A. Manter permanentemente o catálogo completo na home

Vantagens:

- acesso imediato a todos os modelos;
- nenhuma mudança de navegação.

Desvantagens:

- mantém a repetição;
- prolonga demais a home;
- mistura apresentação de marca e configuração detalhada.

Decisão: preservada como opção de rollback, mas retirada da composição atual.

### B. Retirar o catálogo antes de criar uma rota substituta

Vantagens:

- home mais curta imediatamente.

Desvantagens:

- remove uma funcionalidade importante;
- aumenta o risco de regressão;
- deixa o visitante sem acesso ao catálogo completo.

Decisão: rejeitada.

### C. Criar `/iphones` e depois substituir o catálogo da home por uma prévia

Vantagens:

- reutiliza componentes e dados existentes;
- permite testar a nova rota sem interromper a experiência atual;
- reduz a home somente quando a alternativa estiver estável;
- mantém rollback simples.

Desvantagens:

- durante a transição, catálogo e home coexistem temporariamente.

Decisão: escolhida.

## Decisão

Manter `/iphones` como catálogo completo e `/iphones/:slug` como detalhe durável. Na Home, substituir o catálogo e `BentoBenefits` por um Product Runway de três entradas: “Experiência máxima”, “Escolha equilibrada” e “Entrada mais acessível”. Esses rótulos são atalhos editoriais da interface, não necessidades comprovadas.

O guia permanece na Home em formato compacto e leva ao slug com acabamento e armazenamento na query string. A medição futura recebe somente eventos locais `exportech:interaction`; esta decisão não escolhe fornecedor de analytics nem autoriza cookies, identificadores ou eventos passivos.

Comparar pelo menos:

- acesso ao catálogo;
- abertura de páginas de produto;
- mudança de configuração;
- contato iniciado, quando existir;
- dificuldades observadas em desktop e mobile.

Se a navegação piorar ou os sinais forem inconclusivos, manter ou restaurar o catálogo completo.

## Consequências

- A home pode passar a apresentar e direcionar, se o experimento sustentar essa escolha.
- O catálogo completo permanece a uma ação de distância.
- A mesma fonte de dados alimenta home e `/iphones`.
- A mudança pode ser revertida sem reconstruir os dados dos produtos.

## Estado da transição

- `/iphones` reutiliza os sete produtos, imagens, configurações e regras de preço de `src/data/products.ts`.
- `/iphones/:slug` já está implementada e recebe configuração por query string.
- O catálogo completo e `BentoBenefits` foram removidos da Home.
- O Product Runway usa exatamente `iphone-17-pro-max`, `iphone-17` e `iphone-17e`, com preço e imagem derivados de `src/data/products.ts`.
- A etapa seguinte é validar a Home em Safari, dispositivos físicos e hospedagem real, além de observar sinais antes de expandir rotas.
