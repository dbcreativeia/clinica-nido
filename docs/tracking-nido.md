# Origem, localização e comportamento no CRM Nidô

Código único: AI Studio → GitHub `main` → GitHub Actions (gera `dist`) → cron da hospedagem.
Se uma correção entrar pelo GitHub, usar **Pull changes to Google AI Studio** antes de editar ou enviar outra versão do AI Studio. Nunca substituir os dados persistentes da hospedagem pelo preview.

## Localização

Sem GPS autorizado, coordenadas válidas e data de captura: `Não informada`, sem ponto no mapa. Não há sorteio de bairros, cidade por DDD nem estimativa por IP. Coordenadas antigas sem comprovação ficam fora do mapa, preservadas no banco original. O navegador informa coordenadas e precisão; nomes de cidade e bairro exigem geocodificação real. Nenhum provedor de geocodificação foi configurado nesta mudança.

## Atribuição

UTMs mais parâmetros explícitos de campanha, conjunto/grupo e anúncio. Última origem identificada conservada por até 30 dias. IDs são strings. Campos ausentes aparecem como não informados; nomes genéricos de campanha não são criados. `fbclid` sozinho não comprova anúncio pago. Um ID de anúncio não identifica cada combinação automática de imagens, títulos ou formatos.

| Uso | Página de destino | Parâmetros a colar |
| --- | --- | --- |
| Meta Ads | https://www.nidoestetica.com.br/tratamentos/endoslim | `utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_id={{campaign.id}}&utm_term={{adset.name}}&utm_content={{ad.name}}&adset_id={{adset.id}}&ad_id={{ad.id}}&placement={{placement}}` |
| Google Pesquisa | https://www.nidoestetica.com.br/tratamentos/endoslim | `utm_source=google&utm_medium=cpc&utm_campaign=endoslim_pesquisa&utm_id={campaignid}&adgroup_id={adgroupid}&ad_id={creative}&utm_content={creative}&utm_term={keyword}&placement={network}` |
| Bio Instagram | https://www.nidoestetica.com.br/ | `utm_source=instagram&utm_medium=organic_social&utm_campaign=perfil_clinica_nido&utm_content=bio` |
| Stories orgânico | https://www.nidoestetica.com.br/tratamentos/endoslim | `utm_source=instagram&utm_medium=organic_social&utm_campaign=endoslim_2026_11&utm_content=story_01` |
| WhatsApp | https://www.nidoestetica.com.br/tratamentos/endoslim | `utm_source=whatsapp&utm_medium=messaging&utm_campaign=endoslim_2026_11&utm_content=recepcao_01` |
| Google Perfil da Empresa | https://www.nidoestetica.com.br/ | `utm_source=google&utm_medium=organic&utm_campaign=perfil_empresa&utm_content=botao_site` |

Meta: usar o campo **Parâmetros de URL** do anúncio, sem `?`. Google: usar **Sufixo do URL final**, sem `?`, manter marcação automática e trocar `endoslim_pesquisa` por um rótulo por campanha. Para link orgânico completo: página + `?` + parâmetros. Não colocar UTMs em links internos: isso substituiria a origem de aquisição.

No Google o nome do grupo pode ser fornecido por `adgroup_name` fixo ou parâmetro personalizado; `{adgroupid}` fornece o ID. Em PMax não prometer grupo de anúncios ou cada asset individual quando o formato não os disponibiliza.

## Comportamento

Visualizações, visitantes anônimos, cliques em links/botões, tratamentos e tempo com página visível. Heartbeats idempotentes a cada 30 segundos e ao sair. Páginas administrativas e preview não contam como tráfego público. O detalhe do lead conserva a jornada e os parâmetros; o analytics agrega campanhas e atenção por página. Tempo visível não prova leitura e não é gravação de tela. Dados anteriores sem parâmetros não permitem reconstruir campanha ou criativo.

## Ambientes

Mesmas dependências, código e contratos nos três ambientes. Preview usa origem própria e `isPreview`, portanto seus eventos são excluídos dos relatórios públicos. MySQL e tokens ficam na configuração de execução do ambiente; o preview precisa de conectividade e variáveis equivalentes para usar as integrações. O código não pode criar dados fictícios para disfarçar banco indisponível. Produção deve responder `nido-analytics-v2`, `storage=mysql`, `ready=true` após implantação.


## Funil e qualificação no servidor (novembro/2026)

- WhatsAppFormOpen: abertura do modal, Pixel + CAPI com mesmo event_id e consentimento de marketing.
- Contact: somente depois do retorno success:true e lead.id do CRM. Falha de cadastro mantém o formulário aberto, sem conversão.
- Lead: primeira qualificação (Agendado, Compareceu ou Convertido), por ciclo de atendimento. Disparo exclusivamente no servidor, após persistência do status manual ou recebido do Kommo. action_source=system_generated identifica a qualificação no CRM; analisar a coluna Leads, sem presumir que a subcategoria Leads no site será idêntica.
- Attribution JSON guarda os identificadores do visitante e a evidência do consentimento de marketing recebidos no formulário. IP/UA são capturados no servidor no cadastro original, nunca no navegador do operador.
- Sem consentimento verificável, não fazer backfill de conversões históricas. Cidade/estado/país desconhecidos não são inventados.
- nido_meta_outbox possui chave única por lead/ciclo. A fila continua após restart, com lease de 2 minutos e retentativas do mesmo event_id/time. Somente events_received>0 marca enviado. Rejeição 400 fica failed, expiração de 7 dias/consentimento ou lead excluído fica skipped. Falhas transitórias ficam pending com backoff.
- GET /api/meta/crm-status informa prontidão e totais da fila, sem retornar dados de contatos. GET /api/meta/status informa nido-meta-v3 e crmQualification.ready.
- UTMs dos anúncios: utm_source={{site_source_name}}, utm_medium=paid_social, utm_campaign={{campaign.name}}, utm_term={{adset.name}}, utm_content={{ad.name}}, campaign_id={{campaign.id}}, adset_id={{adset.id}}, ad_id={{ad.id}}, placement={{placement}}. Preservar destino; não duplicar UTMs na URL base e em Parâmetros de URL.

## Correspondência e diagnóstico CAPI (02/11/2026)

- Eventos do site com marketing autorizado usam o consentSubjectId já existente como external_id. O CRM prioriza o mesmo identificador e aplica SHA-256 no envio de Lead; visitantes legados mantêm o fallback visitorId. Não é criado identificador novo, não depende de Analytics e não há envio quando publicidade é recusada. O Pixel recebe o identificador em advanced matching na inicialização, sem reinicializações repetidas; a CAPI recebe o external_id normalizado com hash no servidor.
- O rastreador do navegador bloqueia Lead. Contact permanece somente após confirmação de persistência. Qualificação e fila do Kommo/CRM mantêm as regras anteriores.
- GET /api/meta/status versão nido-meta-v4 inclui dispatchDiagnostics: contadores agregados por tipo de evento de requests, attempts, cacheHits, inFlightReuses, acknowledged, eventsReceived e failures. Não contém event_id, token, contato, IP ou payload. Scope=current-process: reinicia a cada processo e não deve ser interpretado como total global da hospedagem.
- Requests conta chamadas ao helper, attempts conta solicitações HTTP à Meta e acknowledged conta respostas aceitas. Cache hits e concurrent reuse não fazem novo HTTP. Os contadores permitem investigar a diferença entre Browser e Server, mas não comprovam sozinhos a deduplicação no Gerenciador de Eventos nem detectam emissores externos.
- Na auditoria de 02/11, o MCP retornou servidor exatamente 2x navegador para os eventos recentes. Inspeção do aplicativo mostrou apenas um emissor web, com ID compartilhado e cache de confirmação. Origem externa/múltiplos processos/deduplicação da Meta ainda precisam de verificação com eventos reais. Não remover um emissor por suposição.
- Mudança validada em 100 testes locais, TypeScript e build. Métricas futuras de correspondência não são garantia de melhora de atribuição ou redução de custo.
