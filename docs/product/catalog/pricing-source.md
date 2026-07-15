# Fonte dos preços do catálogo

Status: informações comerciais restauradas
Fonte: conversa da tarefa Exportech, 2026-07-14
Última restauração: 2026-07-15

Este documento preserva os valores em USD fornecidos pela empresa. Ele não representa uma cotação cambial em tempo real e não deve ser apresentado dessa forma.

## Regra de conversão

- Taxa-base: `USD 1 = BRL 5,27`.
- Constante atual: `USD_BRL_RATE = 5.27` em `src/data/products.ts`.
- Arredondamento comercial: calcular `USD × 5,27`, subir para a próxima centena e subtrair um real.
- Fórmula implementada: `Math.ceil(converted / 100) * 100 - 1`.
- BRL é o preço principal da vitrine.
- USD aparece apenas como referência discreta ao lado do valor em BRL.
- A taxa é estática até existir um fluxo de atualização cambial aprovado separadamente.

Exemplo: `USD 1.155 × 5,27 = BRL 6.086,85`, exibido como `BRL 6.099`.

## Preços fornecidos

### iPhone 15

| Armazenamento | Acabamento | USD |
|---|---|---:|
| 128 GB | Preto | 630 |

### iPhone 16

| Armazenamento | Acabamento | USD |
|---|---|---:|
| 128 GB | Preto | 680 |
| 128 GB | Rosa | 735 |
| 128 GB | Verde-azulado | 690 |
| 128 GB | Ultramarino | 690 |
| 128 GB | Branco | 735 |

### iPhone 17

| Armazenamento | Acabamento | USD |
|---|---|---:|
| 256 GB | Preto | 865 |
| 256 GB | Azul | 860 |
| 256 GB | Lavanda | 865 |
| 256 GB | Sálvia | 860 |
| 256 GB | Branco | 865 |

### iPhone 17e

| Armazenamento | Acabamento | USD |
|---|---|---:|
| 256 GB | Preto | 600 |

### iPhone Air

A informação comercial original chamava este modelo de “iPhone 17 Air”. A vitrine usa o nome de produto “iPhone Air”.

| Armazenamento | Acabamento | USD |
|---|---|---:|
| 256 GB | Branco | 935 |

### iPhone 17 Pro

| Armazenamento | Acabamento | USD |
|---|---|---:|
| 256 GB | Azul | 1.080 |
| 256 GB | Laranja | 1.080 |
| 256 GB | Prateado | 1.120 |
| 512 GB | Azul | 1.370 |
| 512 GB | Laranja | 1.360 |
| 512 GB | Prateado | 1.380 |

### iPhone 17 Pro Max

| Armazenamento | Acabamento | USD |
|---|---|---:|
| 256 GB | Azul | 1.175 |
| 256 GB | Laranja | 1.155 |
| 256 GB | Prateado | 1.205 |
| 512 GB | Azul | 1.490 |
| 512 GB | Laranja | 1.480 |
| 512 GB | Prateado | 1.510 |
| 1 TB | Azul | 1.750 |
| 1 TB | Laranja | 1.710 |
| 1 TB | Prateado | 1.760 |

## Regras de apresentação

- Não exibir o país de origem nos cards.
- Não mostrar valores irregulares resultantes da multiplicação bruta.
- Manter discretos e funcionais os seletores de armazenamento e acabamento.
- Atualizar juntos imagem, referência em USD e estimativa em BRL ao trocar o acabamento.
- Não chamar o preço de “ao vivo”, “final” ou “garantido” sem uma política comercial que sustente essa afirmação.

## Checklist de atualização

Quando a empresa fornecer uma nova lista:

1. registrar fonte e data;
2. atualizar este documento;
3. atualizar `src/data/products.ts`;
4. conferir todas as combinações de armazenamento e acabamento;
5. executar o build de produção;
6. verificar manualmente o par BRL e USD exibido;
7. commitar juntos documentação, dados e imagens afetadas.
