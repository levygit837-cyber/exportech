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

Candidato atual:

- Título: `iPhone 17 Pro Max`.
- Autor: MajdyModels (`MG990`).
- Página: <https://sketchfab.com/3d-models/iphone-17-pro-max-87fc1df741384124a8ce0226d2b2058d>.
- Licença exibida: Creative Commons Attribution 4.0.
- Geometria informada: aproximadamente 29,6 mil triângulos e 16,4 mil vértices.
- Estado: download pendente de login; arquivo ainda não inspecionado.

A licença CC BY permite adaptação e uso comercial com atribuição, mas a adoção só acontece após conferir o arquivo baixado, os metadados, as texturas, a correspondência visual e eventuais restrições adicionais exibidas no pacote.

Texto provisório de atribuição, se o ativo for aprovado:

> Modelo 3D base por MajdyModels no Sketchfab, licenciado sob CC BY 4.0; adaptado e otimizado pela Exportech.

## Candidatos não adotados

- Modelo que combina `CC Attribution` na interface com `Non-commercial use only` na descrição: rejeitado por licença contraditória.
- Modelo `Free Standard` marcado como `NoAI`: não deve entrar no fluxo automatizado atual.
- Modelo CGTrader `Royalty Free` marcado como `no AI`: não deve entrar no fluxo automatizado sem autorização contratual clara.
- Modelos conceituais publicados antes do produto ou que descrevem titânio, quatro câmeras ou design sem portas: rejeitados por não representar o iPhone 17 Pro Max real.

## Próxima validação

1. Baixar o candidato CC BY após login autorizado pelo usuário.
2. Preservar a página e o texto da licença como evidência.
3. Inspecionar hierarquia, nomes, materiais, texturas, dimensões e geometria.
4. Comparar visualmente com referências oficiais atuais.
5. Decidir entre adaptar o modelo gratuito e continuar o blockout procedural.
6. Somente então criar a animação de inicialização e a timeline de scroll.
