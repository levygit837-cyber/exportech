# Ferramentas 3D da Exportech

Este diretório contém pipelines locais e reproduzíveis. O fluxo de remasterização é o pipeline ativo da prévia R3F; os estudos anteriores e blockouts permanecem como histórico técnico e não devem ser misturados destrutivamente com o novo master.

## Regras do ativo

- Original, texturas, `.blend`, HDRI de trabalho e intermediários ficam em `.tools/`, ignorado pelo Git.
- As pranchas A/B produzidas por estes scripts exigem avaliação humana.
- O pacote e a licença devem ser revalidados antes de qualquer publicação.

## Ambiente local

O pipeline foi validado com Blender 3.6.23 Intel em:

```text
.tools/blender-3.6.23/Blender.app/Contents/MacOS/Blender
```

Neste Mac, o Blender precisa de acesso normal à GPU para Eevee. A inicialização dentro de sandbox restrito pode falhar durante a detecção do Metal.

Entradas esperadas:

```text
.tools/models/apple-user-original/iphone17promax.glb
.tools/environments/studio_small_08_1k.hdr
```

O HDRI é Studio Small 08, da Poly Haven, licenciado sob CC0: <https://polyhaven.com/a/studio_small_08>.

## Pipeline de remasterização

### 1. Inspecionar o original congelado

```bash
.tools/blender-3.6.23/Blender.app/Contents/MacOS/Blender \
  --background \
  --python tools/3d/inspect_iphone17_model.py \
  -- \
  --file .tools/models/apple-user-original/iphone17promax.glb \
  --json artifacts/3d/apple-user-remaster/reports/original-inspection.json \
  --report artifacts/3d/apple-user-remaster/reports/original-inspection.md \
  --label "Modelo original" \
  --author "Fonte registrada internamente" \
  --page "Registro interno" \
  --license "Termos arquivados internamente"
```

### 2. Criar o master não destrutivo

```bash
.tools/blender-3.6.23/Blender.app/Contents/MacOS/Blender \
  --background \
  --python tools/3d/prepare_apple_user_model.py \
  -- \
  --source .tools/models/apple-user-original/iphone17promax.glb \
  --blend .tools/models/apple-user-working/remaster-master.blend \
  --manifest artifacts/3d/apple-user-remaster/reports/preparation-manifest.json \
  --report artifacts/3d/apple-user-remaster/reports/preparation-report.md
```

O master preserva a fonte em `SOURCE_REFERENCE`, cria uma cópia editável em `WEB_MODEL`, registra as câmeras e cria os sete anchors exportáveis. O primeiro passe não aplica decimate, bevel ou alteração destrutiva de topologia.

### 3. Renderizar pranchas A/B e posters

```bash
.tools/blender-3.6.23/Blender.app/Contents/MacOS/Blender \
  --background \
  .tools/models/apple-user-working/remaster-master.blend \
  --python tools/3d/render_apple_user_evidence.py \
  -- \
  --output-dir artifacts/3d/apple-user-remaster/evidence \
  --poster public/models/iphone-17-pro-max/apple-user-poster.webp \
  --mobile-poster public/models/iphone-17-pro-max/apple-user-poster-mobile.webp \
  --hdri .tools/environments/studio_small_08_1k.hdr
```

Use `--posters-only` quando apenas o enquadramento inicial mudar. Cada prancha em `evidence/comparison/` coloca o original à esquerda e o remaster à direita.

### 4. Exportar o derivado web

```bash
.tools/blender-3.6.23/Blender.app/Contents/MacOS/Blender \
  --background \
  .tools/models/apple-user-working/remaster-master.blend \
  --python tools/3d/export_apple_user_web.py \
  -- \
  --output public/models/iphone-17-pro-max/apple-user-remastered-web.glb \
  --manifest artifacts/3d/apple-user-remaster/reports/web-export-manifest.json \
  --source-manifest artifacts/3d/apple-user-remaster/reports/preparation-manifest.json
```

O exportador duplica somente `WEB_MODEL`, agrupa malhas estáticas por material, preserva anchors e extras e exporta sem Draco, animações, câmeras ou luzes.

### 5. Reimportar e validar

```bash
.tools/blender-3.6.23/Blender.app/Contents/MacOS/Blender \
  --background \
  --python tools/3d/inspect_iphone17_model.py \
  -- \
  --file public/models/iphone-17-pro-max/apple-user-remastered-web.glb \
  --json artifacts/3d/apple-user-remaster/reports/web-reimport-inspection.json \
  --report artifacts/3d/apple-user-remaster/reports/web-reimport-inspection.md \
  --label "Modelo remasterizado web" \
  --author "Fonte registrada internamente" \
  --page "Registro interno" \
  --license "Termos arquivados internamente"
```

Além do relatório do Blender, confirme que o JSON do chunk GLB contém os sete nodes `anchor_*`, que o SHA-256 corresponde ao manifesto e que não existem referências externas quebradas.

## Derivados conservadores para carregamento

Estes derivados são candidatos locais de performance. Eles não substituem automaticamente os arquivos ativos da aplicação e devem passar pela validação visual, pelo teste de navegação completo e pela revalidação da licença antes de uma publicação.

O modelo atual registra termos Sketchfab Free Standard e a marcação NoAI nos metadados. Por isso, todo o processamento abaixo é local e determinístico: não envie o GLB, suas texturas ou renders a serviços externos de geração, melhoria ou visão por IA.

### LOD0 conservador com Meshopt e WebP lossless

```bash
python3 tools/3d/build_apple_user_lod0.py \
  --source public/models/iphone-17-pro-max/apple-user-remastered-web.glb \
  --output public/models/iphone-17-pro-max/apple-user-remastered-lod0.glb \
  --manifest public/models/iphone-17-pro-max/apple-user-remastered-lod0.manifest.json
```

O script verifica o SHA-256 da fonte, a procedência, os sete anchors e a marcação NoAI antes de produzir o candidato. Ele remove apenas atributos comprovadamente redundantes ou não referenciados, converte PNGs embutidos para WebP lossless e aplica quantização e compressão Meshopt. Não simplifica a topologia, não altera materiais e não redimensiona texturas.

O resultado validado preserva 76.426 triângulos, 32 meshes, 32 materiais, 39 nodes e os sete anchors. O tamanho cai de 6.534.224 para 1.955.400 bytes. O runtime que consumir este arquivo precisa suportar `EXT_meshopt_compression`, `EXT_texture_webp` e `KHR_mesh_quantization`.

Use `--force` somente quando quiser substituir conscientemente um candidato já existente. O GLB original permanece imutável. Uma versão agressiva de 20–30 mil triângulos deve ser gerada a partir do master `.blend`; fazer isso somente a partir do GLB público pode comprometer a silhueta, os encaixes e os materiais.

### Variante runtime com materiais core PBR

```bash
python3 tools/3d/build_apple_user_runtime.py \
  --source public/models/iphone-17-pro-max/apple-user-remastered-lod0.glb \
  --output public/models/iphone-17-pro-max/apple-user-remastered-runtime.glb \
  --manifest public/models/iphone-17-pro-max/apple-user-remastered-runtime.manifest.json
```

Esta variante é derivada do LOD0 conservador e prioriza upload de textura, primeiro frame e shaders mobile. Ela mantém o normal map principal em 512x512, reduz a tela para 256x512, reduz os dois mapas `ZHfKunYSTKCyTaN` para 256x256 e preserva os demais mapas em até 256x256. A compressão WebP usa qualidade 95 para normal/metallic-roughness e 92 para base color/emissive.

O pipeline remove `KHR_materials_clearcoat`, `KHR_materials_ior`, `KHR_materials_specular` e `KHR_materials_transmission` e registra, material por material, a aproximação equivalente em core PBR metallic-roughness. A transmissão é eliminada; os quatro materiais `BLEND` e todos os estados `doubleSided` são preservados para evitar buracos ou regressões de transparência.

O candidato validado possui 812.008 bytes e estima 5.679.772 bytes para as 13 texturas decodificadas como RGBA8 com mipmaps, contra 18.262.684 bytes no LOD0 de rede. Ele preserva 76.426 triângulos, 32 meshes, 32 materiais, 39 nodes, sete anchors e todos os nomes. Os 32 draw calls também permanecem; o ganho de GPU vem da redução de upload/memória das texturas, da remoção da transmissão e de shaders físicos mais simples.

A comparação neutra pode ser reproduzida com `render_glb_candidate.py` e analisada localmente, sem visão generativa, usando:

```bash
.tools/blender-3.6.23/Blender.app/Contents/MacOS/Blender \
  --background \
  --python tools/3d/compare_runtime_renders.py \
  -- \
  --source-dir /caminho/renders-lod0 \
  --candidate-dir /caminho/renders-runtime \
  --report /caminho/comparison.json
```

O relatório validado está em `artifacts/3d/apple-user-runtime/reports/neutral-render-comparison.json`. Essa comparação numérica não substitui a aprovação das câmeras reais no Three.js, Safari e aparelhos físicos.

### HDRI reduzido para o hero

```bash
.tools/blender-3.6.23/Blender.app/Contents/MacOS/Blender \
  --background \
  --python tools/3d/resize_hero_hdri.py \
  -- \
  --source public/models/iphone-17-pro-max/studio_small_08_1k.hdr \
  --output public/models/iphone-17-pro-max/studio_small_08_256.hdr \
  --manifest public/models/iphone-17-pro-max/studio_small_08_256.manifest.json
```

O candidato reduz o HDRI CC0 de 1024x512 e 1.508.872 bytes para 256x128 e 100.269 bytes, preservando o formato Radiance RGBE e a faixa dinâmica. A redução muda a resolução dos reflexos e precisa de comparação visual nas câmeras reais antes de ser integrada.

Neste checkout, as fontes privadas `.tools/models/apple-user-original/iphone17promax.glb`, `.tools/models/apple-user-working/remaster-master.blend` e `.tools/environments/studio_small_08_1k.hdr` não estão presentes. Os dois scripts acima trabalham somente com os derivados públicos disponíveis e recusam mudanças destrutivas.

## Scripts ativos

- `prepare_apple_user_model.py`: prepara o master, materiais, câmeras, metadados e anchors.
- `render_apple_user_evidence.py`: renderiza sete pares determinísticos e os posters transparentes.
- `export_apple_user_web.py`: une por material e exporta a cópia web.
- `inspect_iphone17_model.py`: inventaria e reimporta GLBs com procedência parametrizada.
- `render_glb_candidate.py`: render neutro de candidatos, preservado para inspeções locais.
- `build_apple_user_lod0.py`: cria e valida o LOD0 conservador, sem simplificar topologia ou alterar materiais.
- `build_apple_user_runtime.py`: cria a variante de primeiro frame com texturas limitadas e materiais core PBR.
- `compare_runtime_renders.py`: compara pares de renders localmente por métricas de cor, luminância e silhueta.
- `resize_hero_hdri.py`: reduz localmente o HDRI do hero e valida resolução, formato e faixa dinâmica.

## Pipelines históricos

- `create_iphone17_blockout.py` e `diagnostic_blender.py`: blockouts e diagnóstico inicial.
- `prepare_iphone17_model.py`, `render_iphone17_production.py` e `export_iphone17_web.py`: pipeline do modelo anterior.
- `create_iphone17_authorial_v1.py` e scripts authorial/production relacionados: estudos anteriores que não são o ativo atual da prévia.

Os artefatos históricos não devem ser apagados ou reaproveitados como se fossem evidência do novo modelo.
