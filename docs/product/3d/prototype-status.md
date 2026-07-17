# Hero 3D da Exportech: estado da prévia privada

- **Estado:** `prévia frontend privada, ainda não publicada`
- **Última validação local:** 2026-07-16
- **Implementação:** React Three Fiber + Three.js, sem `<model-viewer>`
- **Modelo ativo na prévia:** derivado web otimizado para demonstração
- **Modelo anterior:** preservado apenas como histórico e fallback técnico; não é carregado pela nova experiência

## Resultado disponível

A home pública continua usando o hero estático. A narrativa 3D só é selecionada quando as duas condições abaixo são verdadeiras:

```bash
VITE_ENABLE_HERO3D_PROTOTYPE=true npm run dev
```

Depois, abrir `/?hero3d=1`. Sem a variável de ambiente, sem a query string ou com qualquer outro valor, a aplicação renderiza o hero estático existente.

A variante privada é uma composição editorial full-bleed: não há card, moldura, raio, preço, parcelamento, CTA ou seletor de modo dentro do hero. O canvas é transparente e utiliza o mesmo fundo contínuo da página. Navegação, catálogo, produtos, preços, seletores, Buying Guide e rodapé permanecem no fluxo normal. `src/data/products.ts` não foi alterado.

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

`Hero3DExperience.tsx` mantém o host leve, estado, poster, acessibilidade, observadores e interação. `Hero3DCanvas.tsx` é um chunk assíncrono e concentra todo código que importa Three.js, R3F e Drei. O chunk e os ativos não são solicitados na home estática.

A narrativa usa 320dvh abaixo de 768 px e 420dvh a partir de 768 px, com palco sticky de 100svh. O progresso do Motion é somente uma entrada normalizada. Posição, quaternion, alvo, FOV, escala e deslocamento do modelo são interpolados dentro de `useFrame`, com smootherstep, arco tridimensional, damping e slerp. O scroll reverso percorre o mesmo caminho no sentido oposto.

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
- Carregamento automático via `IntersectionObserver` com `rootMargin` de 600 px.
- Poster imediato e crossfade de 250 ms após o primeiro frame completo.
- Estados explícitos: `poster`, `loading`, `ready` e `error`.
- Timeout de 12 s, Error Boundary, fallback de WebGL e tratamento de perda de contexto.
- Retry invalida as URLs do GLB e do HDRI para não reutilizar uma rejeição em cache.
- Conteúdo visual das anotações marcado como decorativo; uma lista HTML estável fornece o mesmo conteúdo ao leitor de tela.

Com `prefers-reduced-motion: reduce`, a história passa a 100svh, o canvas não é montado, o poster permanece estático, drag e rotação são desativados e todos os detalhes aparecem em lista HTML estável.

## Validação executada

### Build e isolamento

- `npm run build` passou com a flag ausente/desabilitada.
- A build padrão remove `dist/models/iphone-17-pro-max` e não distribui GLB, HDRI ou posters privados.
- A rota `/` não solicitou Three.js, R3F, Drei, HDRI ou GLB durante a inspeção de Network.
- Uma build privada com a flag habilitada passou e incluiu os ativos necessários.
- O host `Hero3DExperience` também é assíncrono: aproximadamente 7,42 kB bruto / 3,17 kB gzip.
- O chunk assíncrono `Hero3DCanvas` ficou em aproximadamente 1.036,55 kB bruto / 286,77 kB gzip. Nenhum dos dois chunks pertence ao caminho de rede da home estática.
- Contra o commit-base estático, o main atual passou de 381,16 para 387,65 kB bruto e de 118,49 para 121,05 kB gzip. O delta do caminho inicial ficou em aproximadamente 6,49 kB bruto / 2,56 kB gzip; Three.js, R3F e Drei permanecem integralmente nos chunks assíncronos.
- O CSS passou de 56,26 para 61,19 kB bruto e de 9,76 para 11,11 kB gzip, delta referente ao palco, callouts, fallback e reduced motion.
- `git diff --check` e a inspeção final de dependências fazem parte do fechamento desta worktree.

### Viewports e comportamento

Inspeção Chromium local concluída em 1440 × 900, 1024 × 768, 768 × 1024 e 390 × 844. Foram verificados intro, laterais, traseira, macro, frente, saída, drag, teclado, scroll rápido, reversão, liberação do sticky, poster/canvas sem mudança de dimensões e ausência de overflow horizontal.

Também foram verificados:

- `/` estático sem alteração do hero comercial;
- variante sem preço, parcelamento, CTA ou card de mídia;
- máximo de duas anotações no desktop e uma no mobile;
- reduced motion sem GLB, chunk 3D ou HDRI;
- GLB bloqueado/404 com timeout e fallback persistente;
- GLB inválido com fallback imediato;
- rejeição fria do chunk `Hero3DExperience`, com poster, restante da home utilizável e recuperação por reload no botão de retry;
- perda real de contexto com `WEBGL_lose_context`;
- WebGL indisponível antes do retry;
- recuperação por `Tentar novamente` depois que o recurso volta a ficar disponível;
- nenhum scroll trap no gesto vertical.

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

Enquanto essas pendências existirem, o protótipo não deve ser promovido para `/`, publicado em hospedagem aberta nem descrito como funcionalidade lançada.

## Rollback

1. Remover ou definir `VITE_ENABLE_HERO3D_PROTOTYPE=false`.
2. Executar a build padrão e confirmar que `dist/models/iphone-17-pro-max` não existe.
3. Se a prévia deixar de ser necessária, remover apenas os ativos 3D da branch/worktree privada e os componentes `Hero3DExperience`/`Hero3DCanvas`.
4. Manter o ramo estático de `Hero.tsx`, `src/data/products.ts`, rotas e seções comerciais intactos.
5. Restaurar a dependência anterior somente se surgir uma necessidade técnica independente; ela não é necessária para o rollback do hero público.
