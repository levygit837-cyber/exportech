# Decisão 001: roteamento progressivo para múltiplas páginas

Status: aceita para implementação futura
Data: 2026-07-14

## Contexto

A Exportech é atualmente uma aplicação Vite e React de página única. Os links do header levam a âncoras da mesma página. Para diversificar o conteúdo sem uma migração grande, precisamos introduzir URLs reais de forma progressiva e reversível.

## Opções consideradas

### A. Manter uma única página e adicionar mais seções

Vantagens:

- nenhuma dependência nova;
- pouco trabalho técnico imediato.

Desvantagens:

- aumenta a repetição;
- dificulta compartilhar produtos e conteúdos específicos;
- mistura descoberta, catálogo, suporte e conteúdo institucional;
- torna a navegação cada vez menos clara.

Decisão: rejeitada.

### B. Adicionar React Router em modo declarativo

Vantagens:

- adapta-se ao Vite e React atuais;
- fornece URLs reais, navegação ativa e histórico do navegador;
- pode ser introduzido sem retirar imediatamente o conteúdo existente;
- evita uma migração de framework.

Desvantagens:

- exige configuração de fallback no servidor para atualizações diretas de URL;
- passa a exigir testes por rota.

Decisão: escolhida.

### C. Migrar agora para Next.js ou outro metaframework

Vantagens:

- pode oferecer SSR, geração estática e recursos adicionais no futuro.

Desvantagens:

- aumenta o escopo antes de validar a arquitetura de conteúdo;
- adiciona risco de migração ao catálogo já funcional;
- não é necessário para resolver o problema atual.

Decisão: adiada.

### D. Controlar URLs manualmente com `window.location`

Vantagens:

- evita instalar um roteador.

Desvantagens:

- recria de forma incompleta comportamentos já resolvidos por bibliotecas;
- aumenta o risco em estados ativos, rotas aninhadas e erros;
- oferece uma base pior para crescimento.

Decisão: rejeitada.

## Decisão

Usar React Router em modo declarativo quando a implementação de múltiplas páginas começar.

Sequência inicial:

1. manter a home atual;
2. adicionar um shell compartilhado;
3. criar `/iphones` usando os dados existentes;
4. validar navegação, URL direta e histórico;
5. somente depois reduzir o catálogo da home.

A orientação oficial atual sustenta o uso declarativo em uma aplicação Vite existente: [instalação](https://reactrouter.com/start/declarative/installation) e [comparação de modos](https://reactrouter.com/start/modes).

## Consequências

- O host de produção precisa servir a entrada da aplicação para rotas válidas abertas diretamente.
- `products.ts` permanece como fonte única de dados.
- Rotas devem ser publicadas apenas quando tiverem conteúdo real.
- A implementação continua reversível enquanto a home preservar um caminho seguro para o catálogo.
