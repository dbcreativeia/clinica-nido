# Google qualified lead feed implementation plan

Goal: Connect confirmed CRM qualifications to Google Ads action 7887252150 through the native HTTPS Data Manager connector.
Architecture: Persist the first qualifying transition for each lead in a separate SQL ledger. Serve a minimal CSV through export-only Basic authentication; Google schedules imports and owns acceptance diagnostics. Preserve existing Meta behavior.
Scope: agendado/compareceu/convertido; once per lead; production only; fresh Google-inclusive marketing consent; explicit click ID type; no patient identifiers or health fields in export.

- [x] Add behavior tests for qualification eligibility, consent, stable first timestamp and duplicate transitions, deleted/revoked leads, CSV schema, authentication, and typed click capture.
- [x] Implement crm-google.mjs ledger and private CSV handler; integrate in existing qualification hooks and retry timer.
- [x] Preserve click identifier type through browser attribution and store Google-specific consent context. Update advertising notice; require fresh choice before Google export.
- [x] Add secondary form conversion only after MySQL acknowledgment. WhatsApp open remains outside conversion counts.
- [x] Run complete existing regression suite, TypeScript and build. Inspect diff and generated distribution.
- [ ] Configure export-only connection on hosting after explicit approval of this new access; deploy validated commit, sync AI Studio and verify endpoint, denial paths and Google connector.
- [ ] Keep campaign unserved until receiver configuration is confirmed. Do not fabricate real clicks or change patient statuses for testing.

Verification: 114 tests pass, TypeScript passes, production build passes (existing font/chunk warnings), node syntax check passes. Independent review findings repaired. MariaDB temporary-table test verified UTC timestamp and original click/context remain unchanged across status and attribution updates. No real contacts changed. Native Data Manager connection dialog currently renders blank, so receiver validation remains pending.
