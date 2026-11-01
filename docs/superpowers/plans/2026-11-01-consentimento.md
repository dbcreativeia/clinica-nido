# Consentimento Implementation Plan
> Execução direta autorizada pelo usuário no fluxo já aprovado.
**Goal:** Escolha simples e granular de cookies e localização.
**Architecture:** Componente ConsentBanner existente com utilitário de preferências; LocationPreferences na página Contato; recibos MySQL independentes do CRM.
**Tech Stack:** React, TypeScript, Express e MySQL existentes.
**Spec:** docs/superpowers/specs/2026-11-01-consentimento-design.md
## Global Constraints
Opcionais inicialmente desligados. Aceitar e recusar equivalentes. GPS nunca no aceite de cookies. Geolocalização no CRM só com finalidade específica. Preservar consentimentos legados válidos de cookies. Sem fontes clínicas para Meta.
## Review Focus
Storage indisponível; consentimento expirado/futuro; GPS negado e callback após revogação; preferência alterada em outra aba; recibo indisponível não bloquear navegação nem afirmar registro remoto.
## Tasks
- [x] Testes RED de preferências e GPS sem armazenamento automático.
- [x] Implementar privacy-consent.mjs, src/utils/privacyConsent.ts, ConsentBanner e LocationPreferences. Registrar recibos e bloquear qualificações futuras quando houver revogação vinculada.
- [ ] Atualizar políticas, testes CI e validar conjunto completo.
- [ ] Publicar, sincronizar AI Studio, verificar versão online e interface.

Decisões: corrigido também GA4 incondicional e mapa Google automático, pois contrariavam o aviso. Rota transmite coordenadas ao Google só no link calculado; CRM exige opt-in distinto. Recibos sem contatos/IP/GPS, mantidos por 12 meses no servidor, com validade de escolha de 180 dias. Revisão feita pelo próprio autor nesta sessão, sem delegação.
