# Validação final — iPhone 17 Pro Max

Data: 2026-07-15

## Git e escopo

- Worktree: `/Users/apple/.codex/worktrees/d845/exportech`
- Branch: `task/iphone17-blender-pipeline`
- Base confirmada após `git fetch origin main`: `7394995736ec5d11233752a4f179fa0b6b833cf7`
- `HEAD`, `origin/main` e `FETCH_HEAD` coincidiam antes das alterações.
- Nenhum arquivo em `src/`, `package.json`, `package-lock.json`, `vite.config.ts` ou `index.html` foi alterado.
- Nenhum merge, push, pull request ou commit foi criado.

## Preservação do fonte

- SHA-256 do arquivo original na worktree de origem: `e36f0054553690b8b8706550a8027f64ef29756f91e28e7baa198db6f2ebb7eb`
- SHA-256 da cópia original desta worktree: igual.
- SHA-256 da cópia de trabalho importada: igual.
- `.tools/` permanece ignorada pelo Git e nenhum arquivo dessa pasta está rastreado.
- O `.blend` de trabalho foi salvo, reaberto para renderização e reaberto para exportação.

## Geometria e materiais

- Original: 1 malha, 21.485 vértices importados, 30.032 triângulos, 16 materiais, 4 imagens incorporadas e 695 ilhas desconectadas.
- Preparado: 20 objetos semânticos, 30.000 triângulos visíveis e remoção de 32 triângulos de área zero.
- GLB final reimportado: 20 objetos, 21.976 vértices importados, 30.000 triângulos, 13 materiais e nenhuma imagem.
- Saúde do GLB final: 0 faces duplicadas, 0 polígonos degenerados e 0 normais inválidas.
- Dimensões antes/depois: 79,1153 × 13,4865 × 163,0815 mm.
- Faces duplicadas detectadas no original: 0.
- A separação usou ilhas completas; nenhuma face foi cortada.

## Animação reimportada

- Objetos animados: 7.
- Plataforma: 1,2 mm.
- Aros: 3 mm.
- Vidros/lentes: 5 mm.
- Frames amostrados: 1, 12, 28, 48, 64 e 80.
- Maior erro entre o estado montado inicial e o retorno no frame 80: 0,000000 mm.

## GLB público

- Arquivo: `public/models/iphone-17-pro-max/iphone-17-pro-max-optimized.glb`
- Tamanho: 1.097.504 bytes.
- SHA-256: `80337c87c58dbfb8956918f4ab61c8f7e93001108b84586e02be79276449a765`
- Formato: GLB padrão, sem Draco, Meshopt ou KTX2.
- Decimação: não aplicada.
- Câmeras/luzes: não exportadas.
- Tela: estado apagado.
- O arquivo público é byte a byte idêntico ao staging validado.

O script legado `validate_glb.py` retornou:

```text
GLB_VALID file=iphone-17-pro-max-optimized.glb meshes=20 materials=13 triangles=30000 bytes=1097504 dimensions=(0.0791,0.0135,0.1631)
```

## Evidência visual inspecionada

- `01-front-off.png`: tela apagada, vidro frontal e bordas controladas.
- `02-front-on.png`: emissão suave e placeholder “E” não espelhado.
- `03-side.png`: perfil inteiro, botões e recorte quente/frio.
- `04-back.png`: aparelho montado, contraste entre unibody e vidro.
- `05-camera-close.png`: três lentes escuras e aros metálicos.
- `06-camera-exploded.png`: separação frontal alinhada.
- `07-camera-exploded-side.png`: distâncias de plataforma, aros e vidro legíveis.
- `poster.webp`: poster inicial inspecionado.
- `reimport-check/01-back.png`: GLB final reimportado com todas as peças montadas e sem deslocamentos visuais.

## Verificações finais

- `git diff --check`: passou.
- Busca por whitespace final nos arquivos novos de texto: passou após correção.
- Status direcionado aos arquivos frontend: vazio.
- `.tools/`: ignorada.
- Ferramentas pesadas e fontes originais no working tree rastreado: nenhum.

## Pendências fora desta branch

- integração com `<model-viewer>` ou outro renderer;
- timeline de scroll;
- comportamento de carregamento progressivo e poster;
- fallback de execução, movimento reduzido e acessibilidade;
- validação em navegadores/dispositivos móveis;
- sequência final da tela;
- revisão comercial de marca/logotipo.
