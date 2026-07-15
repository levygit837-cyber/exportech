# Ferramentas 3D da Exportech

Este diretório contém scripts reproduzíveis para validar e desenvolver o futuro hero 3D sem alterar a home atual.

## Blender local

O protótipo foi validado com Blender 3.6.23 Intel, mantido localmente em `.tools/blender-3.6.23/`. A pasta `.tools/` não deve ser versionada.

Neste Mac, o Blender precisa ser executado com acesso normal à GPU. A inicialização dentro de um sandbox restrito falha durante a detecção do Metal.

## Scripts

- `diagnostic_blender.py`: teste mínimo de cena, material, iluminação, render e exportação GLB.
- `create_iphone17_blockout.py`: gera os quatro estados do storyboard, o arquivo Blender e um GLB comprimido com Draco.
- `validate_glb.py`: reimporta o GLB em uma cena limpa e verifica malhas, materiais e triângulos.
- `render_glb_candidate.py`: renderiza um GLB candidato sob a mesma iluminação neutra para comparação local.

## Gerar o blockout

```bash
.tools/blender-3.6.23/Blender.app/Contents/MacOS/Blender \
  --background \
  --python tools/3d/create_iphone17_blockout.py \
  -- \
  --output-dir artifacts/3d/iphone17-blockout-v2
```

Os arquivos em `artifacts/3d/` são evidência de protótipo. Eles não são automaticamente ativos de produção.
