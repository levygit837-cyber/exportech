# Documentação de produto da Exportech

Status: base de planejamento
Última atualização: 2026-07-20

Este diretório registra como a Exportech deve evoluir de uma vitrine de página única para uma experiência de compra pequena, confiável e composta por múltiplas páginas.

Os documentos diferenciam claramente:

- o que existe hoje;
- o que deve ser implementado em seguida;
- o que depende de informações comerciais validadas;
- o que é apenas uma experiência futura;
- o que não pode ser apresentado como disponível antes da implementação e da verificação.

## Ordem recomendada de leitura

1. [Prioridades de implementação](roadmap/implementation-priorities.md) — sequência proposta, transições, critérios de aceite, esforço e dependências.
2. [Mapa do site e navegação](architecture/sitemap-and-navigation.md) — rotas desejadas, cabeçalho, rodapé e estratégia de roteamento.
3. [Estratégia da página inicial](content/homepage-strategy.md) — o que permanece na página inicial, o que muda de lugar e como eliminar a repetição com segurança.
4. [Briefings de página e requisitos de evidência](content/page-briefs-and-evidence.md) — conteúdo mínimo de cada página e fatos que precisam ser confirmados antes da publicação.
5. [Decisão 001: roteamento progressivo](decisions/001-progressive-routing.md).
6. [Decisão 002: separação entre home e catálogo](decisions/002-homepage-catalog-split.md).
7. [Decisão 003: conteúdo de confiança verificável](decisions/003-verifiable-trust-content.md).
8. [Decisão 004: destaque 3D em prévia privada](decisions/004-future-3d-hero.md).
9. [Fonte dos preços do catálogo](catalog/pricing-source.md) — lista em USD recebida durante a tarefa, regra fixa de conversão para BRL e confirmações comerciais ainda necessárias.
10. [Inventário de imagens do catálogo](catalog/asset-manifest.md) — renders transparentes restaurados e seu mapeamento por modelo e acabamento.

## Estado atual do produto

O código atual é uma aplicação Vite e React de página única composta por:

1. navegação;
2. hero do modelo mais recente;
3. catálogo horizontal completo de iPhones;
4. seção de benefícios;
5. guia de escolha interativo;
6. footer.

Os dados de catálogo, imagens, conversão de preço e lógica de recomendação são reutilizáveis. A hipótese atual é que a home concentra seções com intenções comerciais próximas, mas isso ainda não foi confirmado por métricas de uso, entrevistas ou testes com clientes.

O projeto também possui uma prévia privada de hero 3D protegida por flag. Ela comprova viabilidade técnica local, não valor comercial, licença pronta para publicação ou desempenho em dispositivos reais.

## Estágio atual de evidências

A empresa ainda não possui volume suficiente de cases, avaliações, métricas ou fatos institucionais aprovados para sustentar uma estratégia baseada em prova social.

Isso altera a sequência de trabalho:

- a ausência de depoimentos, números de clientes ou imagens de operação não deve bloquear catálogo, páginas de produto e aprendizado;
- confiança inicial deve vir de precisão, transparência e funcionamento da interface;
- afirmações institucionais e operacionais permanecem fora do site até serem confirmadas;
- decisões de produto devem ser tratadas como hipóteses até existirem sinais de uso;
- evidência leve, como cliques, configurações consultadas, dúvidas recebidas e conversas com potenciais clientes, passa a orientar as próximas entregas.

## Princípios de planejamento

- Preferir entregas pequenas e reversíveis a uma grande reformulação.
- Reaproveitar o catálogo existente antes de criar novos sistemas.
- Nunca criar uma rota vazia apenas para o site parecer maior.
- Separar descoberta, profundidade de produto, confiança e suporte.
- Coletar primeiro um conjunto mínimo de fatos comerciais, sem exigir grande volume de prova social.
- Publicar apenas o que estiver confirmado, deixando explícito quando um valor for estimativa ou depender de consulta.
- Tratar rankings de prioridade e diagnósticos de UX como hipóteses enquanto não houver dados.
- Tratar o hero 3D como diferenciação futura, não como requisito para a arquitetura de múltiplas páginas.
- Preservar o hero estático como alternativa até a experiência 3D estar comprovada.

## Referências externas

- A [loja de iPhones da Apple Brasil](https://www.apple.com/br/shop/buy-iphone) separa catálogo, comparação, orientação de compra, ajuda especializada, configuração e suporte.
- A [ajuda sobre a experiência de compra da Apple](https://www.apple.com/br/shop/help/shopping_experience) organiza pagamento, disponibilidade, entrega, garantia e devoluções em áreas próprias.
- A [instalação declarativa do React Router](https://reactrouter.com/start/declarative/installation) permite adicionar roteamento a uma aplicação Vite e React existente sem migrar de framework.
- A [documentação do React Three Fiber](https://r3f.docs.pmnd.rs/) e a [documentação do Three.js](https://threejs.org/docs/) apoiam a prévia privada 3D atual.
