# Briefings de página e requisitos de evidência

Status: especificação de conteúdo
Última atualização: 2026-07-20

## Estados de evidência

Toda afirmação que não seja diretamente um dado de produto deve possuir um destes estados antes da implementação:

| Estado | Significado | Uso público |
|---|---|---|
| Confirmado | Informação fornecida e aprovada pelo responsável da empresa | Pode ser publicada com data de revisão |
| Respaldado por fonte | Sustentado por fonte primária aplicável ao produto ou política exata | Pode ser publicado com atribuição quando necessário |
| Hipótese a validar | Decisão de produto ou conteúdo ainda sem sinal suficiente de clientes | Pode orientar um experimento interno, mas não deve ser apresentada como fato |
| Pendente de confirmação | Plausível, mas ainda não aprovado | Deve permanecer fora da interface pública |
| Planejado | Capacidade ou decisão de roadmap futura | Pode aparecer somente em documentação interna |
| Proibido | Falso, não verificável ou enganoso | Nunca publicar |

## Evidência proporcional ao estágio

A empresa não precisa acumular grande quantidade de depoimentos, cases ou métricas antes de evoluir o produto. A evidência mínima depende do tipo de afirmação:

| Tipo | Evidência mínima |
|---|---|
| Dado de produto | Fonte primária e data de consulta |
| Preço | Lista recebida, responsável, data de vigência e regra de apresentação |
| Canal de contato | Destino ativo testado |
| Processo comercial | Descrição aprovada de algo que já acontece |
| Política | Definição operacional e revisão adequada antes da publicação |
| Prioridade de produto | Sinal de uso, dúvida recorrente, observação ou entrevista |
| Prova social | Registro real e consentimento aplicável |

Na ausência dessa evidência, reduzir o escopo ou omitir o conteúdo. Não exigir provas sociais que a empresa ainda não tem e não fabricar substitutos.

## Fatos que precisam de confirmação

Não presumir:

- número oficial do WhatsApp;
- horários e tempo de resposta;
- regiões atendidas;
- opções de entrega e retirada;
- formas de pagamento;
- existência real de 24 parcelas e suas condições;
- funcionamento do estoque em tempo real;
- duração de uma reserva;
- processo de nota fiscal ou recibo;
- responsável e prazo da garantia;
- processo de troca, devolução e cancelamento;
- escopo do pós-venda;
- endereço e dados de registro da empresa;
- processo de verificação da autenticidade dos produtos;
- quantidade de clientes;
- anos de operação;
- status de revendedor autorizado;
- avaliações e notas de clientes;
- parcerias, certificações e selos de segurança.

## Checklist para coleta de conteúdo

Antes de publicar `/ajuda`, `/atendimento`, `/sobre` ou rotas de política, registrar:

1. fato;
2. fonte ou responsável comercial;
3. texto público exato;
4. data da última validação;
5. data da próxima revisão;
6. pessoa responsável;
7. exceções ou limitações para o cliente;
8. caminho de contato quando o processo padrão falhar.

## Briefing de página: `/iphones`

Objetivo do visitante: navegar por todos os modelos e configurações disponíveis.

Conteúdo mínimo:

- nome do modelo;
- imagem atual para cada cor oferecida;
- armazenamentos disponíveis;
- origem do preço e observação de conversão;
- controles de configuração;
- link para detalhes do produto;
- disponibilidade somente quando for real.

Ação principal: ver detalhes do produto.
Ação secundária: consultar disponibilidade por um canal real.

Não incluir:

- país de origem, salvo se a empresa decidir que isso tem utilidade comercial;
- tabelas técnicas completas;
- selo de estoque sem fonte;
- botões de compra inativos.

## Briefing de página: `/iphones/:slug`

Objetivo do visitante: compreender profundamente um modelo para decidir.

Conteúdo mínimo:

- posicionamento em linguagem simples;
- galeria e acabamentos;
- armazenamento e preço;
- três a cinco benefícios respaldados por características do produto;
- orientação comparativa somente quando houver fonte ou hipótese explicitamente testável;
- produtos relacionados;
- ação de atendimento somente com destino real;
- detalhes técnicos respaldados por fonte.

Ação principal: consultar esta configuração.
Ação secundária: comparar com um modelo próximo.

## Briefing de página: `/comparar`

Objetivo do visitante: decidir entre dois ou três modelos.

Dimensões candidatas de comparação, a confirmar por dúvidas observadas:

- perfil de uso;
- experiência de tela;
- capacidade de câmera;
- posicionamento de bateria;
- tamanho e peso;
- opções de armazenamento;
- preço inicial atual;
- resumo da recomendação.

Não assumir que todas essas dimensões importam igualmente. Evitar uma tabela exaustiva de especificações e explicar por que cada diferença importa quando houver base técnica e sinal de interesse.

## Briefing de página: `/ajuda`

Objetivo do visitante: entender compra e pós-venda.

Conteúdo possível depois da validação:

- antes da compra;
- confirmação do pedido;
- pagamento;
- entrega ou retirada;
- garantia;
- trocas e devoluções;
- problemas no recebimento;
- escalonamento de atendimento.

A experiência de compra da Apple separa temas como pagamento, entrega, processamento, disponibilidade, garantia e devoluções. A Exportech pode adotar o mesmo princípio de organização usando somente seus próprios termos aplicáveis: [ajuda sobre compras da Apple](https://www.apple.com/br/shop/help/shopping_experience).

## Briefing de página: `/atendimento`

Objetivo do visitante: falar com uma pessoa real e saber o que esperar.

Conteúdo mínimo:

- canal ativo;
- horário ou expectativa de resposta;
- informações que o cliente deve fornecer;
- tipos de problema que o canal resolve;
- caminho urgente ou de pós-venda;
- aviso de privacidade para os dados enviados.

Ação principal: abrir o canal real de comunicação.

## Briefing de página: `/sobre`

Objetivo do visitante: verificar que a Exportech é uma empresa real e responsável.

Conteúdo mínimo para justificar a publicação:

- história curta fornecida pela empresa;
- evidências reais das pessoas, operação ou local;
- filosofia de atendimento expressa por comportamentos concretos;
- canais oficiais;
- o que a empresa oferece e o que não oferece;
- dados empresariais aprovados para publicação.

Não usar missão, visão e valores genéricos como substitutos para evidências.

Se esses elementos ainda não existirem, adiar a rota. A ausência de `/sobre` é preferível a uma página genérica.

## Briefing de página: `/guias`

Objetivo do visitante: aprender antes de escolher.

Condição de lançamento: pelo menos um guia substancial que responda a uma dúvida observada. Um segundo guia deve ser adicionado somente quando houver outro tema útil, sem criar uma estrutura editorial vazia.

Cada guia precisa ter:

- uma pergunta específica do cliente;
- introdução que responda primeiro;
- afirmações técnicas respaldadas por fonte;
- exemplos práticos;
- data de atualização;
- revisor;
- links de produtos apenas quando forem relevantes.

Primeiros guias recomendados:

1. Qual iPhone combina com cada tipo de uso?
2. Quanto armazenamento você realmente precisa?

## Atalhos de confiança proibidos

- depoimentos falsos;
- avaliações anônimas de cinco estrelas;
- “milhares de clientes” sem registros;
- “autorizado” sem autorização formal;
- texto de garantia copiado de concorrente;
- política legal copiada;
- selos decorativos de segurança;
- prazo de entrega inventado;
- “em estoque” sem fonte de inventário;
- escassez ou contagem regressiva fabricada.
