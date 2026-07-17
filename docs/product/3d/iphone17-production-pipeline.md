# Pipeline de produção 3D — iPhone 17 Pro Max

- Status: modelo preparado e validado; integração frontend não implementada
- Data: 2026-07-15
- Blender: 3.6.23 LTS Intel
- Render: Eevee, 64 amostras, sem bloom

## Resultado produzido

O modelo escolhido de modelo anterior foi preservado em `.tools/`, inspecionado em cena limpa e reconstruído como 20 objetos semânticos a partir de ilhas desconectadas. Nenhuma face visível foi cortada e nenhum componente óptico interno foi inventado. A cópia derivada remove 32 triângulos de área zero com normais inválidas que já existiam no fonte.

O `.blend` reproduzível permanece ignorado em:

- `.tools/models/taufiq-k-working/iphone-17-pro-max-production.blend`

Os ativos promovidos para integração futura são:

- `public/models/iphone-17-pro-max/iphone-17-pro-max-optimized.glb`
- `public/models/iphone-17-pro-max/poster.webp`

Nenhum componente React, CSS, rota, dependência ou comportamento de scroll foi modificado nesta branch.

## Inventário validado

| Métrica | Original | GLB final reimportado |
| --- | ---: | ---: |
| Malhas/objetos | 1 | 20 |
| Materiais | 16 | 13 |
| Imagens incorporadas | 4 | 0 |
| Triângulos | 30.032 | 30.000 |
| Vértices importados | 21.485 | 21.976 |
| Dimensões X × Y × Z | 79,1153 × 13,4865 × 163,0815 mm | 79,1153 × 13,4865 × 163,0815 mm |
| Tamanho | 5.240.964 bytes | 1.097.504 bytes |

O aumento de vértices pós-exportação é causado pela divisão de primitivas/materiais do glTF. A superfície e as dimensões permaneceram iguais. A diferença de 32 triângulos é exclusivamente a limpeza documentada de polígonos degenerados; a reimportação final encontrou zero faces duplicadas, zero polígonos degenerados e zero normais inválidas.

SHA-256 do GLB final:

`80337c87c58dbfb8956918f4ab61c8f7e93001108b84586e02be79276449a765`

SHA-256 do poster:

`35f6313fca505b50f2a43bf544a116921c8545f6803c2e89fedaf660b39625b5`

## Objetos semânticos

- `phone_body`
- `rear_plateau`
- `rear_glass`
- `front_glass`
- `front_bezel`
- `display`
- `dynamic_island`
- `camera_main_glass`
- `camera_main_ring`
- `camera_ultrawide_glass`
- `camera_ultrawide_ring`
- `camera_telephoto_glass`
- `camera_telephoto_ring`
- `flash`
- `lidar`
- `microphone`
- `apple_logo`
- `side_buttons`
- `usb_port`
- `speaker_details`

Os nomes main, ultrawide e telephoto são uma classificação visual pela posição convencional. O fonte não contém metadados ópticos que comprovem o sensor interno de cada grupo.

## Materiais e tela

A variante de produção usa alumínio prata, vidro traseiro fosco, vidro frontal separado, aros de alumínio, três camadas ópticas por grupo de câmera, sensores escuros e tela apagada. Todos os materiais usam Principled BSDF e parâmetros exportáveis para glTF; não dependem de nós exclusivos do Blender.

O `.blend` contém:

- `EX_Display_Off`, estado padrão exportado;
- `EX_Display_Soft_On`, emissão técnica suave;
- `display_logo_placeholder`, símbolo neutro “E” da Exportech, oculto no estado padrão;
- superfície `display` independente e pronta para uma textura futura.

O logo físico da Apple já existente no modelo-base foi preservado. Uso comercial, animação de marca e aprovações de trademark continuam fora desta validação técnica.

## Vista explodida reimportada

O GLB final contém sete objetos animados:

- plataforma: deslocamento máximo de 1,2 mm;
- três aros: deslocamento máximo de 3 mm;
- três conjuntos de vidro/lentes: deslocamento máximo de 5 mm.

Estados:

| Frame | Estado |
| ---: | --- |
| 1 | montado |
| 12 | início da separação |
| 28 | parcialmente expandido |
| 48 | completamente apresentado |
| 64 | retorno |
| 80 | montado novamente |

Na reimportação do GLB final, o maior erro entre as posições dos frames 1 e 80 foi 0,000000 mm.

## Enquadramentos Blender

- `camera_front`: frente com inclinação leve e espaço lateral.
- `camera_side`: perfil e botões com aparelho inteiro no quadro.
- `camera_back`: traseira e plataforma Pro Fusion.
- `camera_close`: close montado e vista explodida.
- `camera_close_side`: leitura lateral das distâncias explodidas.

Essas câmeras pertencem ao `.blend` e não são incluídas no GLB público.

## Evidência visual

Os sete renders obrigatórios estão em `artifacts/3d/iphone17-production/renders/`. A mesma pasta contém seis WebPs leves da sequência explodida. A pasta `reimport-check/` registra a prova visual feita a partir do GLB final importado em uma cena limpa.

Foram inspecionados:

- tela apagada e tela técnica ligada;
- perfil completo;
- traseira montada;
- close das três lentes;
- vista explodida frontal e lateral;
- poster WebP;
- render traseiro do GLB reimportado.

## Decisão de compressão

O GLB público não usa Draco, Meshopt nem KTX2. Sem texturas e sem decimação, ele já ficou em aproximadamente 1,05 MiB, abaixo da meta ideal de 3 MB. Isso evita exigir um decoder específico antes de o frontend 3D existir.

O exportador oferece `--draco` para uma experiência futura. Em teste local, Draco nível 6 gerou aproximadamente 165 KB e reimportou no Blender, mas essa variante não foi promovida porque o frontend atual ainda não possui carregador 3D. Para reproduzir o teste:

```bash
.tools/blender-3.6.23/Blender.app/Contents/MacOS/Blender \
  --background \
  .tools/models/taufiq-k-working/iphone-17-pro-max-production.blend \
  --python tools/3d/export_iphone17_web.py \
  -- \
  --output .tools/models/taufiq-k-working/iphone-17-pro-max-optimized-draco.glb \
  --manifest artifacts/3d/iphone17-production/reports/web-export-draco-manifest.json \
  --draco
```

Antes de qualquer promoção dessa variante, o futuro componente `<model-viewer>` ou outro carregador deverá ser implementado e validado em desktop, mobile, rede limitada, fallback e ausência de WebGL.

## Limitações restantes

- A timeline de scroll, controles de câmera e carregamento progressivo ainda não existem.
- A tela não possui sequência final de inicialização.
- Não foram modelados sensores internos ou seções técnicas inexistentes no fonte.
- As variantes laranja cósmico e azul profundo não foram produzidas; prata é a única variante desta etapa.
- O Mac Intel atual validou Blender/Eevee e reimportação, mas não substitui testes futuros em navegadores e dispositivos móveis reais.
- Acessibilidade, movimento reduzido, interação por teclado/toque e fallback de execução pertencem à futura integração frontend.

## Relatórios

- `artifacts/3d/iphone17-production/reports/original-inspection.md`
- `artifacts/3d/iphone17-production/reports/preparation-report.md`
- `artifacts/3d/iphone17-production/reports/web-export-manifest.json`
- `artifacts/3d/iphone17-production/reports/optimized-reimport-inspection.md`

Os comandos completos estão em `tools/3d/README.md`.
