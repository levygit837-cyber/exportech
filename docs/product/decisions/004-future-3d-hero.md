# Decisão 004: hero interativo 3D em prévia privada

Status: protótipo técnico privado, não aprovado para publicação
Data: 2026-07-14
Última revisão: 2026-07-20

## Decisão

A Exportech possui uma prévia privada de visualização 3D interativa do iPhone mais recente, implementada com React Three Fiber e protegida por flag e query string.

O protótipo comprova viabilidade técnica no ambiente local testado. Ele não comprova benefício para clientes, impacto em conversão, licença pronta para uso comercial, desempenho em aparelhos reais ou prontidão para publicação.

## Por que não é uma prioridade pública

- a licença do modelo precisa ser revalidada e arquivada;
- Safari desktop e iOS real ainda não foram aprovados;
- falta medição em aparelho mobile físico;
- a revisão visual humana das comparações A/B permanece pendente;
- não existe evidência de que o 3D melhora compreensão, preferência ou ação comercial;
- páginas de produto, verdade comercial mínima e aprendizado possuem dependências menores;
- o hero estático continua sendo o fallback e a experiência pública.

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

Foi a recomendação inicial para um primeiro protótipo técnico.

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

### C. Cena customizada com React Three Fiber e Three.js

Vantagens:

- controle máximo de iluminação, materiais, câmera e interação;
- maior liberdade criativa.

Desvantagens:

- implementação e manutenção mais complexas;
- mais risco de desempenho e acessibilidade;
- exige gerenciamento explícito de recursos WebGL;
- dificulta rollback e testes.

Decisão revisada: esta opção foi implementada em prévia privada porque a narrativa exigiu controle de câmera, materiais, anotações e interação além do protótipo anterior. A implementação deve permanecer isolada e reversível. O Three.js exige liberação explícita de recursos, conforme o [guia de limpeza do Three.js](https://threejs.org/manual/en/cleanup.html).

## Condições atendidas pelo protótipo

- GLB preparado para web e poster estático;
- carregamento progressivo;
- comportamento responsivo;
- alternativa para `prefers-reduced-motion`;
- controles por toque e teclado;
- descrição textual acessível;
- fallback para erro ou ausência de WebGL;
- remoção por flag sem afetar preço, catálogo ou navegação;
- validação local em Chromium desktop e emulação mobile.

## Condições pendentes para publicação

1. licença revalidada;
2. aprovação visual humana;
3. Safari desktop real;
4. Safari iOS em aparelho real;
5. medição em pelo menos um aparelho mobile físico;
6. hipótese mensurável de benefício;
7. comparação entre hero estático e 3D;
8. confirmação de que a ação principal não piora.

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

## Critérios de sucesso para promoção

- melhora perceptível da apresentação sem prejudicar a ação principal;
- carregamento progressivo estável;
- funcionamento aceitável em mobile;
- controles acessíveis;
- ausência de mudança de layout;
- poster e fallback visualmente completos;
- produto, preço e CTA continuam disponíveis mesmo quando o 3D falha;
- remoção possível por uma mudança pequena e reversível.
- sinal observado de benefício para compreensão, exploração ou ação do visitante.

As métricas técnicas detalhadas e as pendências atuais estão em [estado da prévia privada](../3d/prototype-status.md).
