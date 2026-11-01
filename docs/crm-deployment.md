# CRM: sincronização e publicação

O código editável permanece no Google AI Studio e no repositório `dbcreativeia/clinica-nido`.

## Publicação

Após enviar um commit para `main`, a hospedagem verifica atualizações a cada cinco minutos. O trabalho cron preserva o arquivo legado de leads, aplica o Git, executa TypeScript, os testes do CRM e o build e, somente se esses comandos passarem, executa `scripts/crm-restart.cjs`.

O reinício específico é necessário porque o LiteSpeed mantinha workers `lsnode` antigos mesmo depois de o código ser atualizado e de reinícios solicitados pelo painel. O script só sinaliza workers do mesmo usuário cujo diretório de trabalho corresponde exatamente à raiz desta aplicação.

## Persistência

MySQL é a fonte autoritativa dos leads. Falhas não devem ser convertidas silenciosamente em leitura ou escrita de `data/leads.json`.

Exclusões usam `deleted_at`. Sincronizações e atualizações só alteram linhas ativas e não inserem novamente registros ausentes. A versão remota é armazenada em `kommo_updated_at` para rejeitar atualizações antigas.

Leads vinculados são consultados pelo ID exato do Kommo. A recuperação de um vínculo ausente requer telefone brasileiro completo normalizado e um único candidato ativo no funil permitido. Não há comparação apenas dos últimos oito dígitos ou por nome.

Os webhooks e a sincronização manual usam o mesmo mapeamento numérico de etapas. A sincronização de status não representa envio de conversões para plataformas de anúncios.

## Verificação

```sh
node --test crm-sync.test.mjs
npm run lint
npm run build
```

O script `npm run crm:diagnose` faz consultas de leitura e mostra apenas informações técnicas, sem imprimir credenciais ou dados de contatos. A resposta de sincronização identifica a versão `nido-crm-sync-v2` e o armazenamento `mysql`.
