import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {buildSync} from 'esbuild';import {webcrypto} from 'node:crypto';
const code=buildSync({entryPoints:['src/components/ConsentBanner.tsx'],bundle:true,platform:'node',format:'cjs',external:['react','react/jsx-runtime','react-router-dom','lucide-react'],write:false}).outputFiles[0].text;
function app(saved){
 const values=new Map(saved?[['nido_cookie_consent',JSON.stringify(saved)]]:[]),events=[],hooks=[],effects=[];let i=0,mounted=false,gps=0;
 const React={useState(v){const j=i++;if(!(j in hooks))hooks[j]=typeof v==='function'?v():v;return[hooks[j],v=>hooks[j]=v];},useEffect(f){if(!mounted)effects.push(f);}};
 const jsx=(type,props)=>({type,props:props||{}});
 const ctx={module:{exports:{}},exports:{},crypto:webcrypto,Date,URL,URLSearchParams,process:{env:{NODE_ENV:"test"}},console,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},window:{location:{hostname:'preview.example.com',pathname:'/',hash:'',search:''},dispatchEvent:e=>events.push(e),addEventListener(){},removeEventListener(){}},document:{cookie:'',referrer:''},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},sessionStorage:{removeItem(){}},navigator:{geolocation:{getCurrentPosition(){gps++;}}},fetch:async()=>({ok:true,json:async()=>({success:true})}),require(n){if(n==='react')return{...React,default:React};if(n==='react/jsx-runtime')return{jsx,jsxs:jsx};if(n==='lucide-react')return new Proxy({},{get:(_,k)=>k});if(n==='react-router-dom')return{Link:'a'};throw Error(n);}};
 vm.runInNewContext(code,ctx);function render(){i=0;let tree=ctx.module.exports.ConsentBanner();if(!mounted){mounted=true;effects.forEach(f=>f());i=0;tree=ctx.module.exports.ConsentBanner();}return tree;}
 function nodes(n){if(!n||typeof n!=='object')return[];return[n,...[n.props?.children].flat(Infinity).flatMap(nodes)];}
 function text(n){if(typeof n==='string')return n;if(!n||typeof n!=='object')return'';return[n.props?.children].flat(Infinity).map(text).join('');}
 return{render,nodes,text,values,events,gps:()=>gps};
}
test('actual banner makes accept/refuse equivalent, grants optional cookies without requesting GPS',()=>{
 const a=app(),tree=a.render(),buttons=a.nodes(tree).filter(n=>n.type==='button');
 const accept=buttons.find(n=>a.text(n)==='Aceitar opcionais'),refuse=buttons.find(n=>a.text(n)==='Recusar opcionais');
 assert.equal(accept.props.className,refuse.props.className);accept.props.onClick();
 const saved=JSON.parse(a.values.get('nido_cookie_consent'));assert.equal(saved.meta,true);assert.equal(saved.analytics,true);assert.equal(saved.geo,undefined);assert.equal(a.gps(),0);assert.equal(a.render(),null);
});
test('actual customization defaults off, remembers a refusal and saves independent choices',()=>{
 const a=app();let tree=a.render();a.nodes(tree).find(n=>n.type==='button'&&a.text(n)==='Personalizar').props.onClick();tree=a.render();
 const inputs=a.nodes(tree).filter(n=>n.type==='input');assert.equal(inputs.length,2);assert.equal(inputs.every(n=>n.props.checked===false),true);
 inputs[0].props.onChange({target:{checked:true}});tree=a.render();a.nodes(tree).find(n=>n.type==='button'&&a.text(n)==='Salvar minhas escolhas').props.onClick();
 let c=JSON.parse(a.values.get('nido_cookie_consent'));assert.equal(c.analytics,true);assert.equal(c.meta,false);
 const b=app({analytics:false,meta:false,timestamp:Date.now()});assert.equal(b.render(),null);
});
test('an old Meta-only advertising grant asks again before adding Google measurement',()=>{
 const a=app({analytics:true,meta:true,noticeVersion:'nido-privacy-2026-11-01',timestamp:Date.now()});
 const tree=a.render();assert.ok(tree);assert.match(a.text(tree),/Google/);
});
test('mobile browsers without crypto.randomUUID, with corrupted receipt history or blocked gtag still save consent without error',()=>{
 const a=app();
 a.values.set('nido_privacy_receipts','{corrupted-json');
 a.values.set('nido_privacy_receipts_pending','"not-an-array"');
 const tree=a.render();
 const accept=a.nodes(tree).find(n=>n.type==='button'&&a.text(n)==='Aceitar opcionais');
 accept.props.onClick();
 assert.equal(a.render(),null);
 const saved=JSON.parse(a.values.get('nido_cookie_consent'));
 assert.equal(saved.analytics,true);
 assert.equal(saved.meta,true);
});
