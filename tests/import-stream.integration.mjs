// Local-only import transport regression. No recipe is saved or published.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readImportResponse} from '../lib/import-transport.ts';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5190';if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw Error('Local tests only');
const headers={'Content-Type':'application/json',Accept:'application/x-ndjson',Origin:base};
await assert.rejects(readImportResponse(await fetch(base+'/api/import',{method:'POST',headers,body:'{}'})),/Sign in/);
const started=Date.now();const events=[];
const response=await fetch(base+'/api/import',{method:'POST',headers:{...headers,'oai-authenticated-user-id':'stream_regression','oai-authenticated-user-email':'stream@sites.test'},body:JSON.stringify({text:fs.readFileSync(new URL('./fixtures/spiedini.txt',import.meta.url),'utf8')})});
assert.match(response.headers.get('content-type'),/application\/x-ndjson/);assert.ok(Date.now()-started<5000,'Headers and progress must arrive before extraction completes');
const result=await readImportResponse(response,message=>events.push({message,ms:Date.now()-started}));assert.ok(result.recipe);assert.equal(result.recipe.ingredients.length,20);assert.ok(events.length>=3);assert.ok(events[0].ms<5000);
console.log(JSON.stringify({checks:2,elapsedMs:Date.now()-started,progressEvents:events.length,ingredientEntries:result.recipe.ingredients.length}));
