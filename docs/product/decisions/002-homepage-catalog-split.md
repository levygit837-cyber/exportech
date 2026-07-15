# Decisão 002: separar a home do catálogo completo

Status: aceita para implementação futura
Data: 2026-07-14

## Contexto

A home atual apresenta um hero de produto, o catálogo completo, benefícios e um guia de escolha. Várias dessas seções cumprem a mesma função: vender ou recomendar um iPhone. A home precisa ganhar um papel editorial e de marca, mas o catálogo não pode desaparecer antes de existir um destino substituto.

## Opções consideradas

### A. Manter permanentemente o catálogo completo na home

Vantagens:

- acesso imediato a todos os modelos;
- nenhuma mudança de navegação.

Desvantagens:

- mantém a repetição;
- prolonga demais a home;
- mistura apresentação de marca e configuração detalhada.

Decisão: rejeitada como estado final.

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

Publicar e validar `/iphones` primeiro. Depois, substituir o catálogo completo da home por três caminhos editoriais: experiência máxima, escolha equilibrada e entrada acessível.

## Consequências

- A home passa a apresentar e direcionar, em vez de repetir o catálogo.
- O catálogo completo permanece a uma ação de distância.
- A mesma fonte de dados alimenta home e `/iphones`.
- A mudança pode ser revertida sem reconstruir os dados dos produtos.
