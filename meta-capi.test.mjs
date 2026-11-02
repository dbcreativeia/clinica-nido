import test from 'node:test';
import assert from 'node:assert/strict';
import { sendMetaConversionEvent } from './meta-capi.mjs';

test('CAPI successful event dispatch records acknowledgment', async () => {
  let calls = 0;
  const fakeFetch = async () => {
    calls++;
    return {
      ok: true,
      status: 200,
      json: async () => ({ events_received: 1, fbtrace_id: 'trace_123' })
    };
  };
  const payload = { data: [{ event_name: 'Lead', event_id: 'ev_001' }] };
  const res1 = await sendMetaConversionEvent(payload, { fetchFn: fakeFetch, token: 'token_val' });
  assert.equal(res1.success, true);
  assert.equal(calls, 1);

  // Second call with same event_id should hit acknowledged cache without calling fetch again
  const res2 = await sendMetaConversionEvent(payload, { fetchFn: fakeFetch, token: 'token_val' });
  assert.equal(res2.success, true);
  assert.equal(res2.cached, true);
  assert.equal(calls, 1);
});

test('HTTP 200 with events_received 0 is treated as failure and does not ack', async () => {
  const fakeFetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ events_received: 0 })
  });
  const payload = { data: [{ event_name: 'Lead', event_id: 'ev_zero' }] };
  const res = await sendMetaConversionEvent(payload, { fetchFn: fakeFetch, token: 'token_val', maxRetries: 1 });
  assert.equal(res.success, false);
});

test('Concurrent requests for same event share single promise', async () => {
  let calls = 0;
  const fakeFetch = async () => {
    calls++;
    await new Promise(r => setTimeout(r, 50));
    return {
      ok: true,
      status: 200,
      json: async () => ({ events_received: 1 })
    };
  };
  const payload = { data: [{ event_name: 'Lead', event_id: 'ev_concurrent' }] };
  const [r1, r2] = await Promise.all([
    sendMetaConversionEvent(payload, { fetchFn: fakeFetch, token: 'token_val' }),
    sendMetaConversionEvent(payload, { fetchFn: fakeFetch, token: 'token_val' })
  ]);
  assert.equal(r1.success, true);
  assert.equal(r2.success, true);
  assert.equal(calls, 1);
});

test('4xx client error does not retry and hides payload', async () => {
  const fakeFetch = async () => ({
    ok: false,
    status: 400,
    json: async () => ({ error: { message: 'Secret PII payload echo' } })
  });
  const payload = { data: [{ event_name: 'Lead', event_id: 'ev_4xx' }] };
  const res = await sendMetaConversionEvent(payload, { fetchFn: fakeFetch, token: 'token_val' });
  assert.equal(res.success, false);
  assert.equal(res.status, 400);
  assert.equal(res.error?.includes('Secret PII'), false);
});
test('failed delivery can be retried with the original event ID and time',async()=>{
 const payload={data:[{event_name:'Contact',event_id:'retry_failure',event_time:123}]};let calls=0;
 const fetchFn=async(_url,opts)=>{calls++;assert.deepEqual(JSON.parse(opts.body),payload);return{ok:calls>1,status:calls>1?200:503,json:async()=>({events_received:calls>1?1:0})}};
 assert.equal((await sendMetaConversionEvent(payload,{fetchFn,token:'test',maxRetries:1})).success,false);
 assert.equal((await sendMetaConversionEvent(payload,{fetchFn,token:'test',maxRetries:1})).success,true);assert.equal(calls,2);
});

test('dispatch diagnostics distinguish actual network attempts, cache hits and concurrent copies without identifiers',async()=>{
 const {getMetaDispatchDiagnostics}=await import('./meta-capi.mjs');
 assert.equal(typeof getMetaDispatchDiagnostics,'function');
 const before=getMetaDispatchDiagnostics().events.Contact;
 const payload={data:[{event_name:'Contact',event_id:'diagnostic_private_event',user_data:{em:'private-email'}}]};let calls=0;
 const fetchFn=async()=>{calls++;await new Promise(r=>setTimeout(r,5));return{ok:true,status:200,json:async()=>({events_received:1})}};
 await Promise.all([sendMetaConversionEvent(payload,{fetchFn,token:'test'}),sendMetaConversionEvent(payload,{fetchFn,token:'test'})]);
 await sendMetaConversionEvent(payload,{fetchFn,token:'test'});
 const after=getMetaDispatchDiagnostics(),delta=key=>after.events.Contact[key]-before[key];
 assert.equal(calls,1);assert.equal(delta('requests'),3);assert.equal(delta('attempts'),1);assert.equal(delta('inFlightReuses'),1);assert.equal(delta('cacheHits'),1);assert.equal(delta('acknowledged'),1);assert.equal(delta('eventsReceived'),1);
 assert.equal(JSON.stringify(after).includes('private'),false);
 after.events.Contact.requests=-1;assert.notEqual(getMetaDispatchDiagnostics().events.Contact.requests,-1);
});
