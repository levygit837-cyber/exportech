# Preparo de produção — iPhone 17 Pro Max

Data: 2026-07-15
Blender: 3.6.23

## Método

O GLB de trabalho foi importado em cena limpa. Cada objeto semântico foi gerado exclusivamente a partir de ilhas de geometria desconectadas e materiais existentes. Nenhuma face visível foi cortada e nenhuma geometria interna de câmera foi inventada.

A limpeza removeu 32 triângulos de área zero que já possuíam normais inválidas no fonte. Essa remoção não altera a superfície visível.

O objeto-fonte permanece no `.blend` dentro da coleção oculta `SOURCE_REFERENCE`. O GLB original também permanece inalterado em `.tools/models/taufiq-k-original/`.

## Objetos preparados

| Objeto | Triângulos | Ilhas-fonte | Material de produção |
| --- | ---: | ---: | --- |
| `apple_logo` | 73 | 2 | `EX_Rear_Logo_Graphite` |
| `camera_main_glass` | 3,614 | 7 | `EX_Camera_Lens_Housing` |
| `camera_main_ring` | 1,152 | 1 | `EX_Camera_Ring_Aluminum` |
| `camera_telephoto_glass` | 3,228 | 7 | `EX_Camera_Lens_Housing` |
| `camera_telephoto_ring` | 1,152 | 1 | `EX_Camera_Ring_Aluminum` |
| `camera_ultrawide_glass` | 3,998 | 7 | `EX_Camera_Lens_Housing` |
| `camera_ultrawide_ring` | 1,152 | 1 | `EX_Camera_Ring_Aluminum` |
| `display` | 74 | 2 | `EX_Display_Off` |
| `dynamic_island` | 806 | 192 | `EX_Sensor_Dark` |
| `flash` | 956 | 4 | `EX_Flash_Diffuser` |
| `front_bezel` | 180 | 2 | `EX_Sensor_Dark` |
| `front_glass` | 226 | 1 | `EX_Front_Glass` |
| `lidar` | 94 | 1 | `EX_Sensor_Dark` |
| `microphone` | 46 | 1 | `EX_Sensor_Dark` |
| `phone_body` | 6,562 | 50 | `EX_Silver_Forged_Aluminum` |
| `rear_glass` | 299 | 29 | `EX_Frosted_Rear_Glass` |
| `rear_plateau` | 796 | 6 | `EX_Silver_Camera_Plateau` |
| `side_buttons` | 2,218 | 56 | `EX_Silver_Forged_Aluminum` |
| `speaker_details` | 1,036 | 212 | `EX_Port_And_Speaker_Detail` |
| `usb_port` | 2,338 | 113 | `EX_Port_And_Speaker_Detail` |

## Estados técnicos

- Display desligado: `EX_Display_Off` (estado padrão e exportado).
- Display com emissão suave: `EX_Display_Soft_On`.
- Logo provisório: `display_logo_placeholder`, símbolo técnico neutro da Exportech, oculto no estado padrão.
- A superfície `display` pode receber uma textura futura sem alterar o vidro frontal.

## Vista explodida

A animação é reversível entre os frames 1 e 80. A plataforma desloca 1,2 mm, os aros 3 mm e os vidros das lentes 5 mm no eixo traseiro, sem deslocamento lateral. Marcadores registram os estados montado, início, parcial, apresentado e retorno.

## Limitações honestas

- Os nomes main, ultrawide e telephoto identificam os três grupos visuais pelo posicionamento convencional; o arquivo não contém metadados ópticos que comprovem o sensor interno de cada grupo.
- Não foram criados sensores internos inexistentes no modelo-fonte.
- O símbolo oficial da Apple presente no modelo-base foi preservado fisicamente; qualquer uso comercial ou animação de marca continua sujeito a revisão. A tela usa um placeholder neutro.
- A integração com scroll, `<model-viewer>` ou frontend não faz parte deste preparo.
