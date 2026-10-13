import {test} from 'node:test';
import assert from 'node:assert/strict';
import {streamImport,readImportResponse} from '../lib/import-transport.ts';
test('progress arrives before a delayed recipe result',async()=>{
 const seen=[];const response=streamImport(async progress=>{await new Promise(r=>setTimeout(r,35));progress('Reviewing amounts');return Response.json({recipe:{name:'Onion'}})},5);
 const value=await readImportResponse(response,message=>seen.push(message));assert.equal(value.recipe.name,'Onion');assert.ok(seen.includes('Still working on your recipe…'));assert.ok(seen.includes('Reviewing amounts'));
});
test('streamed failures preserve status-specific fields',async()=>{
 const response=streamImport(async()=>Response.json({error:'Sign in to continue.',sourceRequired:true},{status:401}),5);
 await assert.rejects(readImportResponse(response),e=>e.message==='Sign in to continue.'&&e.sourceRequired===true);
});
test('unexpected server errors close the stream with a useful failure',async()=>{
 await assert.rejects(readImportResponse(streamImport(async()=>{throw Error('private internal detail')},5)),/could not complete/);
});
test('a truncated connection cannot be mistaken for a successful import',async()=>{
 const response=new Response('{"type":"progress","message":"Working"}\n',{headers:{'Content-Type':'application/x-ndjson'}});
 await assert.rejects(readImportResponse(response),/before extraction finished/);
});
test('UTF-8 split across network chunks and un-terminated result are decoded',async()=>{
 const data=new TextEncoder().encode(' {"type":"progress","message":"Sauté"}\n{"type":"result","status":200,"data":{"ok":true}}');
 const stream=new ReadableStream({start(c){for(const byte of data)c.enqueue(new Uint8Array([byte]));c.close()}});const seen=[];
 assert.deepEqual(await readImportResponse(new Response(stream,{headers:{'Content-Type':'application/x-ndjson'}}),m=>seen.push(m)),{ok:true});assert.deepEqual(seen,['Sauté']);
});
test('ordinary JSON response remains compatible',async()=>{
 assert.deepEqual(await readImportResponse(Response.json({existing:{id:'abc'}})),{existing:{id:'abc'}});
 await assert.rejects(readImportResponse(new Response('Gateway error',{status:502})),/incomplete response/);
});
