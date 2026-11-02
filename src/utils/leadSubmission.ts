import {trackConfirmedGoogleContact} from './googleAdsContact.ts';
/** A conversion is allowed only after the CRM acknowledges a persisted contact. */
export async function persistContactLead(payload: Record<string, unknown>): Promise<{id: string}> {
  const response = await fetch('/api/leads', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const result = await response.json();
  if (!response.ok || result.success !== true || typeof result.lead?.id !== 'string') {
    throw new Error('Não foi possível confirmar seu cadastro. Tente novamente.');
  }
  try {trackConfirmedGoogleContact(result.lead.id);} catch {/* A tracking failure must not reject a saved form. */}
  return result.lead;
}
