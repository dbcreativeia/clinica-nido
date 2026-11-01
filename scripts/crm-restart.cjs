const fs=require('node:fs');const cp=require('node:child_process');const path=require('node:path');
const root=fs.realpathSync(path.join(__dirname,'..'));
const listing=cp.execFileSync('ps',['-u',String(process.getuid()),'-o','pid=,comm='],{encoding:'utf8'});
const targets=[];
for(const line of listing.trim().split('\n')){const m=line.trim().match(/^(\d+)\s+(.*)$/);if(!m||!m[2].startsWith('lsnode:'))continue;const pid=Number(m[1]);try{if(pid!==process.pid&&fs.realpathSync('/proc/'+pid+'/cwd')===root)targets.push(pid)}catch{}}
for(const pid of targets){try{if(fs.realpathSync('/proc/'+pid+'/cwd')!==root)continue;process.kill(pid,'SIGTERM');console.log('Restart requested for application worker '+pid)}catch(e){if(e.code!=='ESRCH')throw e}}
console.log('Application workers signaled: '+targets.length);
