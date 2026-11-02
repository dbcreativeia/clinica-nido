# Google Ads — qualificação pelo CRM

Conta `8211144272`; ação principal `7887252150` (`NIDÔ | Lead qualificado | CRM`).

A primeira transição para `agendado`, `compareceu` ou `convertido` grava horário UTC e contexto original no mesmo UPDATE SQL do status. As transições seguintes e novos formulários da mesma pessoa não substituem esse marco. A fila de preparação reconstrói a exportação após reinício/falha e percorre todas as páginas de registros.

O endpoint `/api/google-ads/qualified.csv` exige autenticação Basic: usuário `googleads` e segredo aleatório com pelo menos 32 caracteres em `GOOGLE_ADS_FEED_SECRET`. É exclusivo para leitura de conversões; nunca usar a senha administrativa. Sem configuração ou fora de produção, não exporta dados. O segredo fica somente no servidor e na conexão HTTPS do Google Ads Data Manager; nunca no Git/AI Studio ou URL.

Conectar pela Central de Dados > HTTPS > Conversões off-line > ação existente. Mapear `Google Click ID`, `Conversion Name`, `Conversion Time` (UTC explícito) e `Order ID`. Escolher o agendamento disponível, registrar o horário e conferir o resultado de importação na Central de Dados. Servir o CSV não prova aceitação pelo Google. Com zero cliques qualificados reais, o arquivo contém somente o cabeçalho; nunca inserir cliques ou pacientes fictícios para contornar o conector.

A exportação contém GCLID, nome institucional de conversão, horário e hash opaco do ID do lead. Não contém nome, telefone, e-mail, tratamento, mensagens, coordenadas ou histórico clínico. Requer aviso `nido-privacy-2026-11-02`, escolha de Publicidade válida e recibo permitido tanto no momento do evento quanto na consulta. Recibos revogados e contatos excluídos ficam fora da exportação.

A captura preserva o tipo original de GCLID/GBRAID/WBRAID. O feed atual é de GCLID: braids são guardados com tipo correto, mas não exportados como GCLID.

A conversão secundária de formulário usa `AW-11000286313/GoyeCMrii5MaEOmYrP0o`, somente depois da confirmação de persistência do servidor, com `transaction_id` estável e URLs/título institucionais. Publicidade pode ser recusada sem impedir o formulário. Não há envio de dados de correspondência ao Google nem remarketing personalizado. Cliques/aberturas do WhatsApp não são tratados como conversa efetiva.

Publicação segue `docs/crm-deployment.md`. Aplicar a versão testada no GitHub, aguardar/verificar deploy da hospedagem e puxar a versão no AI Studio antes de novas edições.

Validação: `node --test *.test.mjs *.test.ts`, `npm run lint`, `npm run build`, `node --check server.ts`; conferir 401 sem credencial e CSV sem dados pessoais com conexão autenticada. Não alterar status de contatos reais para testes. Confirmar uma importação real quando houver clique legítimo elegível.

Validation on 2026-11-02: 114 automated tests passed. MariaDB 10.11.19 temporary-table test returned timestamp_preserved=1, context_preserved=1, original_click_preserved=1, utc_timestamp_valid=1. No live lead records were touched.

Production rollout on 2026-11-02: published via main, AI Studio pulled GitHub changes. Hosting selector did not persist the new variable, so GOOGLE_ADS_FEED_SECRET is in an untracked server-only .env (0600), loaded by dotenv. New Google ledger must use utf8mb4_unicode_ci to match nido_leads.id. Existing empty ledger was migrated with ALTER TABLE nido_google_qualifications CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci after reproducing MariaDB error 1267 using a count-only JOIN. No patient rows changed.
