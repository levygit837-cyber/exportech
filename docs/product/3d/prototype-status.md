# Protótipo do hero 3D: estado e procedência

Status: protótipo técnico local, não integrado à home
Última validação: 2026-07-15

## O que foi validado

- Blender 3.6.23 Intel oficial executa em modo automatizado no Mac atual quando possui acesso normal à GPU.
- O motor Eevee renderizou cenas com materiais metálicos, vidro, emissão e luzes de área.
- O exportador glTF gerou GLB com compressão Draco.
- Um blockout procedural produziu os quatro estados de direção: frente, lateral, traseira e close da câmera em vista explodida.
- O blockout exportado tem aproximadamente 203 KB; o arquivo Blender tem aproximadamente 1,2 MB.

## Hardware observado

- MacBook Pro Intel, modelo `MacBookPro11,4`.
- Intel Core i7 de quatro núcleos.
- 16 GB de memória.
- Intel Iris Pro com 1536 MB de memória dinâmica.
- macOS Monterey 12.7.6.

O Blender reporta ausência de Metal 2.2 e recursos modernos da GPU. A máquina é suficiente para blockouts leves, Eevee e automação, mas não deve ser tratada como estação adequada para renderização pesada ou como único dispositivo de validação da experiência web.

## Blockout procedural

Arquivos principais:

- `artifacts/3d/iphone17-blockout-v2/01-front.png`
- `artifacts/3d/iphone17-blockout-v2/02-side.png`
- `artifacts/3d/iphone17-blockout-v2/03-back.png`
- `artifacts/3d/iphone17-blockout-v2/04-camera-exploded.png`
- `artifacts/3d/iphone17-blockout-v2/iphone-17-pro-max-blockout.blend`
- `artifacts/3d/iphone17-blockout-v2/iphone-17-pro-max-blockout.glb`

As dimensões gerais usam como referência as especificações oficiais do iPhone 17 Pro Max: 78 mm de largura, 163,4 mm de altura e 8,75 mm de profundidade.

Limitações:

- é uma interpretação visual simplificada, não um modelo industrial certificado;
- componentes internos da câmera são estilizados;
- detalhes de antena, portas, alto-falantes e microgeometria ainda não foram modelados;
- materiais não usam texturas finais nem ambiente HDRI;
- a tela ainda não contém a animação de inicialização;
- os renders não representam o acabamento final aprovado.

## Modelo gratuito preferencial

Candidato primário validado:

- Título: `iPhone 17 Pro Max`.
- Autor: Taufiq K.
- Página: <https://sketchfab.com/3d-models/iphone-17-pro-max-e7c5674931ae4b0ea1b4eaaabb159fdb>.
- Licença exibida: Creative Commons Attribution 4.0.
- Arquivo-fonte: GLB de aproximadamente 5 MB, baixado e importado localmente.
- Geometria validada: 30.032 triângulos, 17,3 mil vértices, 16 materiais e uma malha.
- Dimensões encontradas: aproximadamente 79,1 x 163,1 mm no plano e 13,5 mm de profundidade total incluindo o conjunto de câmeras.
- Resultado visual: plataforma horizontal, três lentes, Dynamic Island, botões e proporções coerentes com as referências oficiais; materiais e reflexos funcionam sob iluminação neutra própria.

As medidas oficiais do iPhone 17 Pro Max são 78 x 163,4 x 8,75 mm para o corpo. A proximidade no plano e a profundidade maior causada pelo relevo das câmeras tornam o arquivo adequado como base visual, sem tratá-lo como desenho industrial certificado.

Limitação relevante: toda a geometria está em uma única malha. Frente, lateral, traseira e aproximações podem ser animadas imediatamente, mas a vista explodida exige separar grupos desconectados e materiais das lentes, aros e sensores antes da otimização para web.

Texto provisório de atribuição:

> Modelo 3D base por Taufiq K no Sketchfab, licenciado sob CC BY 4.0; adaptado e otimizado pela Exportech.

Candidato de reserva:

- Autor: MajdyModels (`MG990`).
- Página: <https://sketchfab.com/3d-models/iphone-17-pro-max-87fc1df741384124a8ce0226d2b2058d>.
- Licença exibida: Creative Commons Attribution 4.0.
- Estado: mantido como alternativa visual; arquivo-fonte ainda não foi adotado.

## Candidatos não adotados

- Modelo que combina `CC Attribution` na interface com `Non-commercial use only` na descrição: rejeitado por licença contraditória.
- Modelo `Free Standard` marcado como `NoAI`: não deve entrar no fluxo automatizado atual.
- Modelo CGTrader `Royalty Free` marcado como `no AI`: não deve entrar no fluxo automatizado sem autorização contratual clara.
- Modelo conceitual de Ranguel, publicado antes do produto: rejeitado porque a ilha de câmeras não corresponde ao desenho oficial lançado.
- Modelos que descrevem titânio, quatro câmeras ou design sem portas: rejeitados por não representar o iPhone 17 Pro Max real.

## Próxima validação

1. Preservar a página, o autor e o texto da licença como evidência de atribuição.
2. Separar de forma não destrutiva as lentes, aros, sensores e plataforma da câmera.
3. Corrigir pequenos materiais e preparar uma variante de acabamento prata.
4. Otimizar e exportar uma cópia GLB própria para web, preservando o fonte original.
5. Criar poster estático, fallback para dispositivos limitados e orçamento de desempenho.
6. Integrar a animação de inicialização e os três estados principais da timeline de scroll.
