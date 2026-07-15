# QA de design — restauração da Exportech

- Referência visual: capturas das anotações do navegador anexadas à tarefa atual; o projeto excluído não preservou cópias no sistema de arquivos.
- Implementação: aplicação Vite restaurada em `http://127.0.0.1:5173/`.
- Viewport desejado: referência desktop próxima de 837 × 718, além do comportamento responsivo definido pelos breakpoints atuais.
- Estado: página inicial restaurada, iPhone 17 Pro Max no acabamento padrão e catálogo nos acabamentos padrão.
- Captura da implementação: indisponível nesta execução porque a política de segurança do navegador interno bloqueou o acesso automatizado ao endereço local.

## Evidência da comparação completa

Bloqueada. As capturas de referência continuam disponíveis no histórico da tarefa, mas a implementação restaurada não pôde ser capturada pelo navegador aprovado. Nenhum mecanismo alternativo de controle do navegador foi usado.

## Evidências visuais verificadas fora do navegador

- As 19 imagens do catálogo foram abertas e decodificadas com sucesso depois da restauração.
- Todos os arquivos possuem RGBA e pixels transparentes.
- A folha de contato foi inspecionada em `/Users/apple/.codex/visualizations/2026/07/14/019f5ecf-2504-7ed3-a435-52d29f2219c9/exportech-restored-catalog-qa.png`.
- A marca transparente `ET` foi aberta e inspecionada visualmente.
- As áreas de mídia usam um `figure[data-product-media]` semântico em vez de tratar o card inteiro como imagem.
- Valores específicos de `mediaScale` e `object-contain` foram restaurados para enquadramento consistente sem cortes destrutivos.

## Superfícies obrigatórias de fidelidade

- Fontes e tipografia: código-fonte e tokens restaurados; comparação renderizada bloqueada.
- Espaçamento e ritmo do layout: estrutura restaurada; comparação renderizada bloqueada.
- Cores e tokens visuais: tokens CSS originais restaurados; comparação renderizada bloqueada.
- Qualidade e fidelidade das imagens: aprovada no nível dos arquivos; renders transparentes oficiais, canal alfa válido, mapeamento correto por modelo e acabamento, sem placeholders.
- Textos e conteúdo: restaurados da implementação anterior, incluindo frase curta do hero, remoção de origem e remoção da seção de estatísticas.

## Verificação funcional

- `npm run build`: aprovado.
- Compilação do projeto TypeScript: aprovada como parte do build de produção.
- Bundle de produção do Vite: aprovado.
- `git diff --check`: aprovado.
- Imagens: 19 PNGs de catálogo e uma marca transparente.
- Console do navegador: não verificado porque o acesso ao navegador foi bloqueado.
- Interações principais: não testadas no navegador nesta execução; handlers e controles semânticos estão presentes no código restaurado.

## Constatações

- [P2] Comparação visual no navegador indisponível.
  - Local: página restaurada completa.
  - Evidência: o navegador interno aprovado recusou o acesso à URL local por sua política de segurança de rede.
  - Impacto: enquadramento final, quebras responsivas, estados de hover e composição do viewport não podem ser declarados visualmente aprovados.
  - Correção: abrir a página em um contexto permitido e capturar os mesmos estados em desktop e mobile antes de alterar o resultado final para aprovado.

## Histórico da verificação

1. A primeira inspeção dos arquivos encontrou um download truncado de `iphone-17-blue.png`.
2. O arquivo danificado foi baixado novamente em um caminho temporário, decodificado por completo e somente então movido para o catálogo.
3. A segunda inspeção decodificou os 19 PNGs e a nova folha de contato foi conferida.
4. A comparação da página completa continuou bloqueada pela política do navegador.

## Acabamentos pendentes

- Conferir o hero e os dois primeiros cards no viewport desktop de referência.
- Conferir todos os cards em viewport mobile de 390 px.
- Exercitar armazenamento, acabamento, carrossel e controles do guia de escolha.
- Conferir erros do console depois do primeiro carregamento completo das imagens.

resultado final: bloqueado
