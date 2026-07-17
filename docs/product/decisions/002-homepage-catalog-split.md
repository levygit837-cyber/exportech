# Decisão 002: separar a home do catálogo completo

Status: em transição; catálogo dedicado implementado e home ainda preservada
Data: 2026-07-14
Início da transição: 2026-07-15

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

## Estado da transição

- `/iphones` reutiliza os sete produtos, imagens, configurações e regras de preço de `src/data/products.ts`.
- O catálogo completo continua na home durante a validação funcional e visual.
- A redução da home para três caminhos editoriais ainda não foi executada.
- A etapa seguinte só começa depois da validação da rota dedicada e da configuração de fallback na hospedagem real.
