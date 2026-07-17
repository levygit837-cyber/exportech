# Relatório de QA — hero 3D privado R3F

- Data: 2026-07-16
- Estado: `prévia frontend privada, ainda não publicada`
- Ambiente: Chromium no navegador integrado, macOS Monterey 12.7.6, MacBookPro11,4, Intel Iris Pro
- URL de teste: `http://127.0.0.1:4175/?hero3d=1`
- Flag de teste: `VITE_ENABLE_HERO3D_PROTOTYPE=true`

## Resultado executivo

O protótipo R3F está funcional e isolado do hero estático. A narrativa, anotações, drag limitado, teclado, reduced motion, fallback e recuperação foram exercitados no Chromium. A build padrão permanece segura e omite os ativos privados.

Não há aprovação de publicação. Safari desktop, Safari iOS real, desempenho em aparelho mobile, revisão humana das pranchas A/B e revalidação da licença continuam pendentes.

## Ativo validado

| Métrica | Resultado | Orçamento | Estado |
| --- | ---: | ---: | --- |
| GLB | 6.534.224 bytes | até 8.000.000 | passou |
| SHA-256 | `9d401b6b32bc57a86cafa266245b107e6e597b86fc441e2287d4facd3aa2a8b8` | manifesto | passou |
| Triângulos | 76.426 | até 85.000 | passou |
| Draw calls estimadas | 32 | até 45 | passou |
| Materiais | 32 | informativo | passou |
| Imagens incorporadas | 13 | informativo | passou |
| Texturas decodificadas | 18.235.392 bytes | até aproximadamente 48 MB | passou |
| Anchors exportados | 7/7 | 7 | passou |
| Draco/decimate | não | não nesta etapa | passou |

A reimportação automática encontrou 32 meshes, 72.454 vértices importados, 76.426 triângulos, 32 materiais, 13 imagens, 9.188 componentes desconectados e nenhuma referência externa exigida pelo GLB. A contagem maior de vértices após exportação vem das divisões de primitivas e atributos do glTF; a contagem de triângulos e as dimensões permaneceram estáveis.

## Build e rede

### Build padrão

- Comando: `npm run build` sem habilitar a variável.
- Resultado: passou.
- `dist/models/iphone-17-pro-max`: ausente após o plugin de isolamento.
- `/`: nenhum request para `Hero3DCanvas`, Three.js, R3F, Drei, HDRI ou GLB durante a inspeção de Network.
- Hero comercial: preço, parcelamento, `Ver catálogo`, `Configurar` e card estático preservados.

### Build privada

- Comando: `VITE_ENABLE_HERO3D_PROTOTYPE=true npm run build`.
- Resultado: passou.
- GLB, HDRI e posters presentes somente nessa build.
- Chunk assíncrono `Hero3DExperience`: aproximadamente 7,42 kB bruto / 3,17 kB gzip.
- Chunk assíncrono `Hero3DCanvas`: aproximadamente 1.036,55 kB bruto / 286,77 kB gzip.
- Main chunk da build privada: aproximadamente 387,73 kB bruto / 121,09 kB gzip.
- Não houve request duplicado do GLB no carregamento normal. Uma URL `?retry=N` só aparece depois de uma recuperação solicitada pelo usuário.

Os chunks assíncronos existem no grafo de build, mas não são solicitados na home estática. A comparação de rede, e não apenas a existência dos arquivos no diretório de chunks, é o critério de isolamento adotado.

### Comparação com o commit-base estático

| Arquivo inicial | Commit-base | Implementação atual padrão | Delta |
| --- | ---: | ---: | ---: |
| JavaScript bruto | 381,16 kB | 387,65 kB | +6,49 kB |
| JavaScript gzip | 118,49 kB | 121,05 kB | +2,56 kB |
| CSS bruto | 56,26 kB | 61,19 kB | +4,93 kB |
| CSS gzip | 9,76 kB | 11,11 kB | +1,35 kB |

O commit-base usado foi `7394995736ec5d11233752a4f179fa0b6b833cf7`. O host inteiro do protótipo foi movido para `React.lazy()`, reduzindo o main em relação ao primeiro passe e mantendo o poster como fallback HTML imediato.

O renderer usa `PCFShadowMap` com penumbra controlada. Em `three@0.185.1`, `PCFSoftShadowMap` está descontinuado e é convertido para PCF pelo próprio Three; selecionar o modo antigo produziria um aviso recorrente sem alterar o algoritmo efetivamente usado.

## Matriz responsiva

| Viewport | Altura da história | Poster/canvas | Anotações simultâneas | Resultado |
| --- | ---: | --- | ---: | --- |
| 1440 × 900 | 3.780 px | 1.425 × 900 | até 2 | passou |
| 1024 × 768 | 3.226 px | 1.009 × 768 | até 2 | passou |
| 768 × 1024 | 4.301 px | 753 × 1.024 | até 2 | passou |
| 390 × 844 | 2.701 px | 390 × 844 | 1 | passou |

O valor visual útil desconta a largura ocupada pela barra do navegador quando aplicável. Poster e canvas compartilharam a mesma caixa em cada viewport. Não foi observado overflow horizontal ou salto na liberação do sticky.

## Narrativa e interação

Testes executados:

- scroll lento por todos os capítulos;
- scroll rápido em ambas as direções;
- reversão no meio das transições;
- recarga e reposicionamento em diferentes pontos da história;
- resize entre desktop, tablet e mobile;
- drag horizontal com yaw/pitch limitado;
- tentativa de gesto vertical sobre o palco;
- setas e `Escape` com o wrapper focado;
- saída do sticky para o catálogo e retorno;
- intro, lateral direita, traseira, macro, lateral esquerda, frente e outro.

Resultados:

- câmera e modelo alcançaram os alvos com damping, sem teletransporte discreto;
- o arco do macro não se comportou como zoom linear;
- scroll reverso utilizou a mesma trajetória;
- offset de drag voltou suavemente a zero;
- gesto vertical não foi cancelado e não gerou scroll trap;
- no mobile apareceu somente uma anotação por vez;
- histerese de 120 ms evitou flicker recorrente nas bordas exercitadas;
- nenhuma linha cruzou a navegação nas capturas produzidas;
- preço e CTAs não existem na variante 3D.

Em uma aba nova após o último ajuste, o console registrou zero erros e zero rejeições de Promise. Permaneceu um único aviso de depreciação de `THREE.Clock`, emitido internamente pela combinação fixada de R3F/Three uma vez na montagem; não é originado pelo código do hero e não se repete durante scroll ou drag.

## Acessibilidade e movimento reduzido

- Wrapper focável com foco visível.
- Setas aplicam desvio temporário; `Escape` restaura a pose do scroll.
- Estado de carregamento, pronto e erro disponível em região viva estável.
- Callouts visuais são decorativos para tecnologia assistiva.
- Lista HTML visualmente oculta contém os sete detalhes sem anúncios a cada capítulo.
- Alvo `Tentar novamente` tem altura mínima de 44 px.
- Descrição específica do modelo presente no host.
- Em `prefers-reduced-motion: reduce`, a seção ficou com 844 px no viewport de 390 × 844, não montou canvas e não solicitou GLB, HDRI ou chunk R3F.
- Reduced motion manteve poster, título e sete detalhes em HTML estável, sem drag ou narrativa automática.

Leitor de tela real não foi executado nesta máquina; a verificação concluída foi estrutural e por teclado.

## Falhas e recuperação

| Cenário | Evidência observada | Resultado |
| --- | --- | --- |
| GLB bloqueado/404 | timeout de 12 s, canvas desmontado, poster e retry | passou |
| GLB inválido | erro capturado, poster restaurado, sem falha fatal | passou |
| Chunk do host rejeitado | boundary externa, poster e home preservados | passou |
| Perda de contexto | `WEBGL_lose_context`, poster e retry | passou |
| WebGL ausente | preflight impede remount; poster permanece | passou |
| Recurso volta | retry com `?retry=1`, canvas volta a `ready` | passou |
| Erro persistente | observer não reinicia automaticamente | passou |
| Timeout | mensagem e conteúdo restante utilizável | passou |

O retry invalida tanto o GLB quanto o HDRI com `?retry=N`, evitando que um erro já memorizado por `useLoader` seja reutilizado. Para uma rejeição do próprio módulo JavaScript, o botão recarrega a página depois que a rede volta, porque browsers podem preservar a Promise rejeitada do `import()` durante a vida do documento. Esse caminho também foi exercitado e recuperou até `ready`.

Não foi isolada em um ciclo independente:

- sessão totalmente offline desde o primeiro carregamento.

Os caminhos comuns desse caso passam pelo mesmo fallback de recurso e timeout, mas o cenário offline completo permanece marcado como pendente.

## Referência de desempenho

Renderer WebGL informado pelo Chromium:

```text
ANGLE (Intel Inc., Intel Iris Pro OpenGL Engine, OpenGL 4.1)
```

Três passagens de scroll forçado de aproximadamente 2,2 s foram medidas por `requestAnimationFrame`, com observação de Long Tasks:

| Ambiente | Mediana | FPS estimado | p95 | Long tasks > 50 ms |
| --- | ---: | ---: | ---: | ---: |
| 1024 × 768 | 16,7 ms | 59,9 | 17,5–17,6 ms | 0 |
| 390 × 844 emulado, DPR 2 | 16,7 ms | 59,9 | 17,6–17,7 ms | 0 |

Limitações da medição:

- FPS é estimado por intervalo de `requestAnimationFrame`, não por contador de GPU;
- mobile foi um viewport emulado na mesma GPU Intel;
- os números não comprovam Safari, iOS ou memória em aparelho físico;
- a qualidade adaptativa pode selecionar DPR, shadow map e anisotropia menores conforme o dispositivo.

## Evidências entregues

### A/B Blender

`artifacts/3d/apple-user-remaster/evidence/comparison/` contém:

- `01-front-three-quarter-ab.png`;
- `02-front-ab.png`;
- `03-right-side-ab.png`;
- `04-rear-ab.png`;
- `05-camera-macro-ab.png`;
- `06-left-side-ab.png`;
- `07-button-macro-ab.png`.

Original à esquerda, remaster à direita. As pranchas não foram avaliadas por visão generativa; a aprovação é do usuário.

### Capturas do site

`artifacts/3d/apple-user-remaster/site-captures/` contém:

- oito estados desktop, incluindo base e offset de drag;
- cinco estados mobile, incluindo base e offset de drag;
- `hero3d-narrative.webp`, gravação curta determinística com 39 frames em 768 × 576.

## Pendências de aceite

1. Revisar humanamente as sete pranchas A/B.
2. Revalidar e arquivar os termos vinculantes do pacote Sketchfab.
3. Executar Safari desktop.
4. Executar Safari iOS em aparelho real.
5. Medir FPS, memória e touch em um aparelho mobile físico.
6. Executar leitor de tela real.
7. Exercitar uma sessão offline completa.

Até concluir esses itens, o protótipo permanece privado, condicionado por flag e não promovido para `/`.
