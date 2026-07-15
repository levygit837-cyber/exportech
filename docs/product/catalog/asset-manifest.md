# Inventário de imagens do catálogo

Status: restaurado e decodificado com sucesso
Última restauração: 2026-07-15

Todas as imagens dos produtos são renders PNG transparentes em `public/products/catalog/`. Os cards e o hero usam `object-contain` e escalas específicas por modelo para manter os aparelhos completamente visíveis e visualmente equilibrados.

## Renders dos produtos

| Modelo | Acabamento | Arquivo |
|---|---|---|
| iPhone 15 | Preto | `iphone-15-black.png` |
| iPhone 16 | Preto | `iphone-16-black.png` |
| iPhone 16 | Rosa | `iphone-16-pink.png` |
| iPhone 16 | Verde-azulado | `iphone-16-teal.png` |
| iPhone 16 | Ultramarino | `iphone-16-ultramarine.png` |
| iPhone 16 | Branco | `iphone-16-white.png` |
| iPhone 17 | Preto | `iphone-17-black.png` |
| iPhone 17 | Azul | `iphone-17-blue.png` |
| iPhone 17 | Lavanda | `iphone-17-lavender.png` |
| iPhone 17 | Sálvia | `iphone-17-sage.png` |
| iPhone 17 | Branco | `iphone-17-white.png` |
| iPhone 17e | Preto | `iphone-17e-black.png` |
| iPhone Air | Branco | `iphone-air-white.png` |
| iPhone 17 Pro | Azul | `iphone-17-pro-blue.png` |
| iPhone 17 Pro | Laranja | `iphone-17-pro-orange.png` |
| iPhone 17 Pro | Prateado | `iphone-17-pro-silver.png` |
| iPhone 17 Pro Max | Azul | `iphone-17-pro-max-blue.png` |
| iPhone 17 Pro Max | Laranja | `iphone-17-pro-max-orange.png` |
| iPhone 17 Pro Max | Prateado | `iphone-17-pro-max-silver.png` |

## Imagem da marca

- `public/brand/exportech-mark.png`: símbolo `ET` transparente e em alta resolução, sem o nome ExportTec nem a assinatura inferior.
- A imagem é usada na navegação e no footer.
- Não substituir por texto, ícone aproximado ou desenho em CSS.

## Registro de validação

- 19 arquivos PNG de produtos presentes.
- Todos os arquivos foram decodificados integralmente depois da restauração.
- Todos possuem canal alfa e pixels transparentes.
- A marca foi decodificada como RGBA com margem transparente.
- Folha de contato: `/Users/apple/.codex/visualizations/2026/07/14/019f5ecf-2504-7ed3-a435-52d29f2219c9/exportech-restored-catalog-qa.png`.

## Regras de enquadramento

- Preservar o `figure[data-product-media]` dedicado dentro de cada card.
- Manter controles, preço e textos fora da área de mídia.
- Usar o valor `mediaScale` definido por modelo em `src/data/products.ts`.
- Não usar `object-cover` nos renders transparentes, pois isso corta o aparelho.
- Verificar o enquadramento em desktop e mobile sempre que uma imagem ou `mediaScale` mudar.
