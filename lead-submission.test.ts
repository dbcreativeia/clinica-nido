import test from 'node:test';
import assert from 'node:assert/strict';
import {persistContactLead} from './src/utils/leadSubmission.ts';
for(const [status,body] of [[500,{success:false}],[200,{success:false}],[201,{success:true}]] as const)test('CRM failure or missing acknowledgment blocks conversion '+status+JSON.stringify(body),async()=>{globalThis.fetch=async()=>({ok:status<400,json:async()=>body}) as any;await assert.rejects(persistContactLead({}));});
test('only acknowledged CRM contact can continue to conversion',async()=>{globalThis.fetch=async()=>({ok:true,json:async()=>({success:true,lead:{id:'test'}})}) as any;assert.equal((await persistContactLead({})).id,'test');});
