# Decisão 004: hero interativo 3D futuro

Status: planejado, não implementado
Data: 2026-07-14

## Decisão

A Exportech pretende adicionar ao primeiro hero da home uma visualização 3D interativa do iPhone mais recente. O objetivo é gerar uma primeira impressão mais forte, tornar o produto mais tangível e diferenciar a vitrine de um catálogo convencional.

Esta é uma decisão de roadmap, não uma funcionalidade disponível hoje.

## Por que não é uma prioridade inicial

- ainda não foi identificado um modelo 3D fiel e com licença adequada;
- o arquivo pode prejudicar o carregamento inicial;
- a interação precisa funcionar em toque, mouse e teclado;
- dispositivos móveis ou de baixo consumo precisam de alternativa;
- o conteúdo e a arquitetura do site ainda possuem prioridades mais fundamentais;
- o hero estático atual já oferece um fallback seguro.

## Opções consideradas

### A. Vídeo pré-renderizado ou sequência de imagens

Vantagens:

- implementação mais simples;
- aparência previsível;
- controle completo da direção visual;
- fallback fácil.

Desvantagens:

- interação limitada;
- pode consumir muitos dados;
- não permite exploração realmente livre do aparelho.

Uso recomendado: fallback ou protótipo conceitual, não solução 3D definitiva.

### B. `<model-viewer>` com GLB otimizado

Recomendado para o primeiro protótipo técnico.

Vantagens:

- componente dedicado à apresentação de modelos;
- suporte a poster e carregamento progressivo;
- controles de câmera e toque;
- implementação mais isolada do que uma cena Three.js completa;
- rollback simples para imagem estática.

Desvantagens:

- direção visual menos livre que uma cena totalmente customizada;
- continua dependendo de um GLB bem produzido;
- exige validação em dispositivos reais.

Referências:

- [documentação do `<model-viewer>`](https://modelviewer.dev/docs/index.html);
- [carregamento e poster](https://modelviewer.dev/examples/loading/);
- [exemplo de desempenho com Lighthouse](https://modelviewer.dev/examples/lighthouse.html).

### C. Cena customizada com Three.js

Vantagens:

- controle máximo de iluminação, materiais, câmera e interação;
- maior liberdade criativa.

Desvantagens:

- implementação e manutenção mais complexas;
- mais risco de desempenho e acessibilidade;
- exige gerenciamento explícito de recursos WebGL;
- dificulta rollback e testes.

Decisão: adiar, a menos que o protótipo com `<model-viewer>` não consiga entregar a direção visual aprovada. O Three.js exige liberação explícita de recursos, conforme o [guia de limpeza do Three.js](https://threejs.org/manual/en/cleanup.html).

## Condições para iniciar o protótipo

O trabalho começa somente quando existirem:

1. modelo GLB fiel e licenciado;
2. poster estático aprovado;
3. baseline de desempenho da home atual;
4. orçamento de tamanho para biblioteca e modelo;
5. comportamento definido para mobile e baixo consumo;
6. alternativa para `prefers-reduced-motion`;
7. controles por toque e teclado;
8. descrição textual acessível;
9. fallback para erro ou ausência de WebGL;
10. método de remoção sem afetar preço, catálogo ou navegação.

## Orçamento provisório de desempenho

O protótipo deverá definir números finais, mas precisa respeitar estas regras:

- o poster aparece antes do modelo;
- biblioteca e GLB carregam após interação ou gatilho progressivo deliberado;
- o carregamento não pode deslocar o layout;
- a imagem estática continua sendo conteúdo válido;
- a experiência precisa ser testada em rede e hardware modestos;
- falha no 3D não pode esconder nome, preço ou ação principal.

## Acessibilidade e interação

- Oferecer descrição do objeto e da interação.
- Permitir uso por toque, mouse e teclado.
- Respeitar redução de movimento.
- Evitar rotação automática contínua sem controle.
- Manter nome, preço e ações como HTML semântico fora do canvas.
- Garantir que o 3D não seja necessário para entender ou comprar o produto.

## Reversão

O hero 3D deve ser uma melhoria isolada. Sua remoção precisa restaurar a imagem estática atual sem alterar dados de produto, preços, catálogo ou navegação.

## Critérios de sucesso

- melhora perceptível da apresentação sem prejudicar a ação principal;
- carregamento progressivo estável;
- funcionamento aceitável em mobile;
- controles acessíveis;
- ausência de mudança de layout;
- poster e fallback visualmente completos;
- produto, preço e CTA continuam disponíveis mesmo quando o 3D falha;
- remoção possível por uma mudança pequena e reversível.
