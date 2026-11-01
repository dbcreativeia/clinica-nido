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
