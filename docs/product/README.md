# Documentação de produto da Exportech

Status: base de planejamento
Última atualização: 2026-07-15

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
8. [Decisão 004: destaque 3D futuro](decisions/004-future-3d-hero.md).
9. [Fonte dos preços do catálogo](catalog/pricing-source.md) — valores em USD fornecidos pela empresa, regra fixa de conversão para BRL e responsabilidades de atualização.
10. [Inventário de imagens do catálogo](catalog/asset-manifest.md) — renders transparentes restaurados e seu mapeamento por modelo e acabamento.

## Estado atual do produto

O código atual é uma aplicação Vite e React de página única composta por:

1. navegação;
2. hero do modelo mais recente;
3. catálogo horizontal completo de iPhones;
4. seção de benefícios;
5. guia de escolha interativo;
6. footer.

Os dados de catálogo, imagens, conversão de preço e lógica de recomendação são reutilizáveis. O principal problema não é falta de código: a home ainda concentra várias seções com a mesma intenção comercial.

## Princípios de planejamento

- Preferir entregas pequenas e reversíveis a uma grande reformulação.
- Reaproveitar o catálogo existente antes de criar novos sistemas.
- Nunca criar uma rota vazia apenas para o site parecer maior.
- Separar descoberta, profundidade de produto, confiança e suporte.
- Começar cedo a coleta de fatos comerciais, mas publicá-los somente depois da validação.
- Tratar o hero 3D como diferenciação futura, não como requisito para a arquitetura de múltiplas páginas.
- Preservar o hero estático como alternativa até a experiência 3D estar comprovada.

## Referências externas

- A [loja de iPhones da Apple Brasil](https://www.apple.com/br/shop/buy-iphone) separa catálogo, comparação, orientação de compra, ajuda especializada, configuração e suporte.
- A [ajuda sobre a experiência de compra da Apple](https://www.apple.com/br/shop/help/shopping_experience) organiza pagamento, disponibilidade, entrega, garantia e devoluções em áreas próprias.
- A [instalação declarativa do React Router](https://reactrouter.com/start/declarative/installation) permite adicionar roteamento a uma aplicação Vite e React existente sem migrar de framework.
- A [documentação do `<model-viewer>`](https://modelviewer.dev/docs/index.html) descreve poster, carregamento progressivo, GLB e descrições de acessibilidade para um futuro protótipo 3D.
