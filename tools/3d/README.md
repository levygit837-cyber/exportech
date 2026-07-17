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

## Scripts ativos

- `prepare_apple_user_model.py`: prepara o master, materiais, câmeras, metadados e anchors.
- `render_apple_user_evidence.py`: renderiza sete pares determinísticos e os posters transparentes.
- `export_apple_user_web.py`: une por material e exporta a cópia web.
- `inspect_iphone17_model.py`: inventaria e reimporta GLBs com procedência parametrizada.
- `render_glb_candidate.py`: render neutro de candidatos, preservado para inspeções locais.

## Pipelines históricos

- `create_iphone17_blockout.py` e `diagnostic_blender.py`: blockouts e diagnóstico inicial.
- `prepare_iphone17_model.py`, `render_iphone17_production.py` e `export_iphone17_web.py`: pipeline do modelo anterior.
- `create_iphone17_authorial_v1.py` e scripts authorial/production relacionados: estudos anteriores que não são o ativo atual da prévia.

Os artefatos históricos não devem ser apagados ou reaproveitados como se fossem evidência do novo modelo.
