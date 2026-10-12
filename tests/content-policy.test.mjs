import test from 'node:test';import assert from 'node:assert/strict';import {offensiveWordDetected,sourceLinkErrors} from '../lib/content-policy.ts';
test('blocks profanity with spacing, casing, Unicode and leet obfuscation',()=>{for(const word of ['FUCK','f.u.c.k','f u c k','ｆｕｃｋ','sh1t','sh\u200bit'])assert.equal(offensiveWordDetected(word),true)});
test('blocks explicit racial and homophobic epithets',()=>{for(const word of ['nigger','kike','faggot'])assert.equal(offensiveWordDetected(word),true)});
test('does not mistake ordinary food words for profanity',()=>{for(const food of ['shiitake mushrooms','cocktail sauce','spicy rice','black beans','white rice','assemble the dish'])assert.equal(offensiveWordDetected(food),false)});
test('allows the original source and its www alias',()=>assert.deepEqual(sourceLinkErrors('Recipe at https://www.example.com/recipe',['https://example.com/original']),[]));
test('rejects third-party, deceptive subdomain, and bare promotional domains',()=>{for(const url of ['https://evil.com/shop','https://example.com.evil.com/recipe','www.evil.com','evil.com'])assert.ok(sourceLinkErrors(url,['https://example.com/recipe']).length)});
test('rejects links without an attributed source',()=>assert.ok(sourceLinkErrors('https://example.com/recipe',[]).length));
test('rejects unsupported protocols, credentials and nested redirects',()=>{for(const url of ['javascript:alert(1)','data:text/html,test','https://user:pass@example.com/recipe','https://example.com/recipe?redirect=https%3A%2F%2Fevil.com'])assert.ok(sourceLinkErrors(url,['https://example.com/recipe']).length)});
test('checks entity-encoded links',()=>assert.ok(sourceLinkErrors('https&#58;&#47;&#47;evil.com',['https://example.com/recipe']).length));
test('recognizes both a YouTube source and its attributed linked recipe',()=>assert.deepEqual(sourceLinkErrors('https://www.youtube.com/watch?v=abc and https://example.com/recipe',['https://www.youtube.com/watch?v=abc','https://example.com/recipe']),[]));

test('upload filenames are not websites, but explicit file-suffix URLs still are',()=>{assert.deepEqual(sourceLinkErrors('Uploaded PDF: recipe.pdf and photo.png',[]),[]);assert.ok(sourceLinkErrors('https://recipe.pdf',[]).length)});
