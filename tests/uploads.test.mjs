import test from 'node:test';import assert from 'node:assert/strict';import {validateUpload} from '../lib/uploads.ts';
const file=(type,data,name='recipe')=>({type,name,data:'data:'+type+';base64,'+Buffer.from(data,'binary').toString('base64')});
test('accept PDF signature and safe filename',()=>assert.equal(validateUpload(file('application/pdf','%PDF-1.4\n','../recipe.pdf')).name,'..recipe.pdf'));
test('accept PNG, JPEG, and WebP signatures',()=>{for(const [type,header] of [['image/png','\x89PNG\r\n\x1a\nabc'],['image/jpeg','\xff\xd8\xffabc'],['image/webp','RIFF1234WEBP']])assert.ok(validateUpload(file(type,header)).bytes>0)});
test('reject executable masquerading as PDF',()=>assert.throws(()=>validateUpload(file('application/pdf','MZ executable')),/valid PDF/));
test('reject unsupported formats and malformed encoding',()=>{assert.throws(()=>validateUpload(file('text/html','<html>')),/Use a PDF/);assert.throws(()=>validateUpload({name:'a',type:'image/png',data:'data:image/png;base64,!@#$'}),/base64/)});
test('reject mismatched MIME prefix',()=>assert.throws(()=>validateUpload({name:'a',type:'image/png',data:'data:application/pdf;base64,JVBERg=='}),/format/));
test('enforce photo limit',()=>assert.throws(()=>validateUpload(file('image/jpeg','\xff\xd8\xff'+'a'.repeat(5*1024*1024))),/5 MB/));
