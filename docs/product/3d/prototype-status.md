# Hero 3D da Exportech: estado da experiência padrão local

- **Estado:** `experiência padrão no checkout local atual; produção ainda não aprovada`
- **Última atualização local:** 2026-07-20
- **Implementação:** React Three Fiber + Three.js, sem `<model-viewer>`
- **Modelo ativo na prévia:** derivado web otimizado para demonstração
- **Modelo anterior:** preservado apenas como histórico e fallback técnico; não é carregado pela nova experiência

## Limite da evidência

As evidências deste documento são técnicas e locais. Elas demonstram que a prévia pode carregar, renderizar, responder a entradas e falhar com fallback no ambiente testado.

Ainda não existe evidência de que o hero 3D:

- melhora a compreensão do produto;
- aumenta preferência pela marca;
- gera mais exploração do catálogo;
- melhora contato ou conversão;
- supera o hero estático para visitantes reais.

Esses resultados devem ser tratados como hipóteses e exigem comparação antes de qualquer promoção pública.

## Resultado disponível

A rota `/` usa o Hero 3D como experiência padrão independentemente de query string. O ramo estático continua no código como rollback e o poster permanece a primeira camada visível, inclusive em carregamento, erro, ausência de WebGL e movimento reduzido.

A composição é editorial e full-bleed: texto do iPhone 17 Pro Max à esquerda, aparelho em perspectiva frontal de três quartos à direita e fundo contínuo da página. Durante a narrativa há um atalho para `/#destaques`; no capítulo final aparecem ações para `/iphones/iphone-17-pro-max` e `/iphones`. Esses controles são HTML focável fora de qualquer árvore com `aria-hidden`.

O catálogo completo vive em `/iphones`; a Home continua depois do sticky com Product Runway, guia compacto e rodapé. `src/data/products.ts` permanece a fonte de verdade dos produtos e preços.

## Controle do ativo

- Modelo: `Apple iPhone 17 Pro Max`.
- Data da aquisição local: 2026-07-16.
- SHA-256 do GLB original: `6aba520a8b57f168228f67556b67b47bca37f9853d23d8ae53baebd665a7143a`.
- Tamanho do original: 5.320.600 bytes.

O original congelado, suas texturas, o `.blend` master e os arquivos intermediários permanecem em `.tools/`, que é ignorado pelo Git. Toda transformação e toda evidência A/B foram produzidas localmente por operações determinísticas no Blender. Os termos do pacote devem ser revalidados e arquivados internamente antes de qualquer publicação.

A flag não protege o arquivo contra cópia. Qualquer pessoa com acesso à prévia privada pode extrair o GLB entregue ao navegador.

## Auditoria e remasterização

| Métrica | Original congelado | Derivado web reimportado |
| --- | ---: | ---: |
| Tamanho | 5.320.600 bytes | 6.534.224 bytes |
| SHA-256 | `6aba520a…7143a` | `9d401b6b…a2a8b8` |
| Triângulos | 76.426 | 76.426 |
| Malhas | 83 | 32 |
| Materiais | 32 | 32 |
| Imagens | 17 | 13 incorporadas |
| Draw calls estimadas | 83 antes da união | 32 |
| Texturas decodificadas | 18.235.392 bytes | 18.235.392 bytes |
| Dimensões totais | 78,9804 × 13,1798 × 162,9377 mm | preservadas |

A profundidade medida inclui o relevo completo das câmeras e não equivale à espessura oficial do corpo. As dimensões oficiais foram usadas apenas como referência de sanidade; o modelo não foi deformado.

O master contém `SOURCE_REFERENCE`, com a importação intacta, e `WEB_MODEL`, com a cópia editável. O derivado foi unido por material para reduzir draw calls, sem Draco, decimate, corte, bevel ou alteração destrutiva de topologia. As mudanças reversíveis aplicadas ao passe remasterizado foram:

- alumínio laranja-cósmico com cor sólida e resposta metálica mais controlada;
- vidro frontal escuro com reflexão limpa;
- vidro traseiro limpo, sem depender do mapa de cor borrado;
- anéis das câmeras com highlights mais definidos;
- lentes estáveis e elementos ópticos reconstruídos sem depender de mapas de 64–128 px;
- flash, LiDAR e sensores com respostas próprias;
- Controle da Câmera alinhado ao acabamento lateral;
- emissão do flash limitada para evitar estouro;
- preservação da textura de tela de maior resolução.

Não foram inventados detalhes ausentes. Bevels e weighted normals não foram aplicados porque o primeiro passe não demonstrou necessidade suficiente para justificar a alteração de geometria. A decisão final sobre cada material continua condicionada à aprovação humana das comparações A/B.

## Arquivos da prévia

- Master ignorado: `.tools/models/apple-user-working/remaster-master.blend`.
- Original congelado e ignorado: `.tools/models/apple-user-original/iphone17promax.glb`.
- HDRI de trabalho ignorado: `.tools/environments/studio_small_08_1k.hdr`.
- GLB derivado: `public/models/iphone-17-pro-max/apple-user-remastered-web.glb`.
- Poster desktop: `public/models/iphone-17-pro-max/apple-user-poster.webp`.
- Poster mobile: `public/models/iphone-17-pro-max/apple-user-poster-mobile.webp`.
- HDRI web: `public/models/iphone-17-pro-max/studio_small_08_1k.hdr`.
- Manifesto de preparo: `artifacts/3d/apple-user-remaster/reports/preparation-manifest.json`.
- Manifesto web: `artifacts/3d/apple-user-remaster/reports/web-export-manifest.json`.
- Reimportação: `artifacts/3d/apple-user-remaster/reports/web-reimport-inspection.md`.
- Evidência A/B: `artifacts/3d/apple-user-remaster/evidence/comparison/`.
- Capturas do site: `artifacts/3d/apple-user-remaster/site-captures/`.
- Relatório de frontend e desempenho: `artifacts/3d/apple-user-remaster/reports/frontend-qa.md`.

O HDRI Studio Small 08 foi obtido da Poly Haven e é distribuído sob CC0. Ele ilumina e produz reflexos, mas nunca aparece como fundo visível.

## Cena React Three Fiber

As dependências estão fixadas em `three@0.185.1`, `@react-three/fiber@9.6.1`, `@react-three/drei@10.7.7` e `@types/three@0.185.1`. `@google/model-viewer` e o custom element anterior foram removidos.

`Hero3DExperience.tsx` mantém o host leve, estado, poster, acessibilidade, observadores e interação. `Hero3DCanvas.tsx` é um chunk assíncrono e concentra todo código que importa Three.js, R3F e Drei. Em movimento reduzido, esse chunk, o GLB e o HDRI não são solicitados.

A narrativa usa 720svh abaixo de 768 px e 800svh a partir de 768 px, com palco sticky de 100svh. O progresso do Motion é somente uma entrada normalizada. Posição, quaternion, alvo, FOV, escala e deslocamento do modelo são interpolados dentro de `useFrame`, com smootherstep, arco tridimensional, damping e slerp. O scroll reverso percorre o mesmo caminho no sentido oposto.

Os capítulos são: introdução, Controle da Câmera, traseira/Sistema Fusion Pro, macro/LiDAR, lateral esquerda/alumínio e Botão de Ação, frente/tela e saída. Há no máximo duas anotações simultâneas no desktop e uma no mobile. As linhas são ancoradas ao modelo, testam a face visível e oclusão, e usam histerese de 120 ms para reduzir flicker.

Não há OrbitControls ou modo manual. Drag horizontal acrescenta temporariamente até 18° de yaw e 8° de pitch; o retorno é amortecido. Em touch, o gesto só começa depois de 8 px e apenas quando o deslocamento horizontal supera o vertical. `touch-action: pan-y` preserva o scroll. Setas aplicam o mesmo offset temporário e `Escape` restaura a pose base.

## Renderização, carregamento e acessibilidade

- Canvas alpha, antialiasing, `powerPreference: high-performance` e `preserveDrawingBuffer: false`.
- Saída sRGB, ACES Filmic, sombras PCF com penumbra suave e somente uma luz com shadow map. `PCFSoftShadowMap` não é selecionado diretamente porque o Three 0.185 o descontinuou e o converte para PCF com aviso recorrente.
- Environment prefiltrado pelo Drei/PMREM, sem fundo visível.
- Sem bloom, pós-processamento, depth of field, sharpening ou SSAO temporal.
- `frameloop="demand"`; fora da viewport o Canvas muda para `never`.
- DPR adaptativo: desktop 1–2; mobile 1–1,5.
- Shadow map 1024, reduzido para 512; anisotropia 8, reduzida para 4.
- Carregamento automático no primeiro layout do hero, mantendo o poster durante a preparação; o observador controla a atividade fora da viewport.
- Poster imediato e crossfade de 250 ms após o primeiro frame completo.
- Estados explícitos: `poster`, `loading`, `ready` e `error`.
- Timeout de 12 s, Error Boundary, fallback de WebGL e tratamento de perda de contexto.
- Retry invalida as URLs do GLB e do HDRI para não reutilizar uma rejeição em cache.
- Conteúdo visual das anotações marcado como decorativo; uma lista HTML estável fornece o mesmo conteúdo ao leitor de tela.

Com `prefers-reduced-motion: reduce`, a história passa a 100svh, o canvas não é montado, o poster permanece estático, drag e rotação são desativados e os dois CTAs aparecem imediatamente. Uma lista HTML não visual mantém os detalhes disponíveis para tecnologias assistivas.

## Validação executada

### Build e isolamento

- `npm run build` passou com o Hero 3D como experiência padrão.
- `Hero3DExperience` e `Hero3DCanvas` continuam em chunks assíncronos separados do main.
- O chunk do canvas concentra Three.js, R3F e Drei; o teste de movimento reduzido confirma que ele, o GLB e o HDRI não são solicitados nesse caminho.
- O manifesto dos posters registra dimensões, bytes, SHA-256 e a captura por `tools/3d/capture_runtime_posters.mjs`.
- Cada poster permanece abaixo de 1 MB e o orçamento combinado de modelo, HDRI e poster continua protegido pela suíte dedicada.

### Viewports e comportamento

Inspeção Chromium local desta versão concluída em 1440 × 900 e 390 × 844. Foram verificados intro, laterais, traseira, macro, frente, saída, drag, teclado, scroll rápido, reversão, liberação do sticky, poster/canvas sem mudança de dimensões e ausência de overflow horizontal.

Também foram verificados:

- Hero 3D como padrão com poster e rollback estático preservados;
- ações comerciais somente no `outro` e imediatamente no reduced motion;
- máximo de duas anotações no desktop e uma no mobile;
- reduced motion sem GLB, chunk 3D ou HDRI;
- GLB bloqueado/404 com timeout e fallback persistente;
- GLB inválido com fallback imediato;
- rejeição fria do chunk `Hero3DExperience`, com poster, restante da home utilizável e recuperação por reload no botão de retry;
- perda real de contexto com `WEBGL_lose_context`;
- WebGL indisponível antes do retry;
- recuperação por `Tentar novamente` depois que o recurso volta a ficar disponível;
- nenhum scroll trap no gesto vertical.

As capturas da Home atual estão em `artifacts/3d/apple-user-remaster/site-captures/home-runway-*`, incluindo primeiro frame, `outro` e baselines completos em movimento reduzido.

### Referência de desempenho

O teste local usou Chromium no Mac Intel com renderer `ANGLE (Intel Iris Pro OpenGL Engine, OpenGL 4.1)`. Em três passagens de scroll forçado de aproximadamente 2,2 s:

| Viewport | Mediana de frame | FPS estimado | p95 | Long tasks > 50 ms |
| --- | ---: | ---: | ---: | ---: |
| 1024 × 768 | 16,7 ms | 59,9 | 17,5–17,6 ms | 0 |
| 390 × 844 emulado | 16,7 ms | 59,9 | 17,6–17,7 ms | 0 |

Essa medição usa `requestAnimationFrame` e Long Tasks como referência de execução; não substitui um profiler de GPU. O viewport mobile foi emulado no mesmo computador e não vale como aparelho mobile real.

## Pendências antes de qualquer promoção

- Aprovação humana das sete comparações A/B. Em cada prancha, o original está à esquerda e o remaster à direita.
- Revalidação do pacote e dos termos vinculantes da licença Free Standard.
- Safari desktop real.
- Safari iOS em aparelho real, incluindo toque, GPU, memória e FPS.
- Medição de performance em pelo menos um aparelho mobile físico.
- Um ciclo offline completo desde o primeiro carregamento. Os fallbacks equivalentes de recurso e timeout já foram exercitados, mas esse cenário específico não deve ser descrito como concluído.
- Revisão visual humana de highlights, UVs, pretos, lentes, vidro, botões e cor laranja em todos os ângulos críticos.

Enquanto essas pendências existirem, a experiência pode continuar como padrão no checkout local atual, mas não deve ser descrita como aprovada para produção ou publicada em hospedagem aberta.

## Rollback

1. Alterar `heroMode` em `src/App.tsx` de `prototype-3d` para `static`.
2. Executar a build padrão e verificar a Home estática.
3. Se a experiência deixar de ser necessária, remover os ativos 3D e os componentes `Hero3DExperience`/`Hero3DCanvas` em uma mudança separada e revisável.
4. Manter o ramo estático de `Hero.tsx`, `src/data/products.ts`, rotas e seções comerciais intactos.
5. Restaurar a dependência anterior somente se surgir uma necessidade técnica independente; ela não é necessária para o rollback do hero público.
