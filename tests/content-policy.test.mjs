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
test('the supplied spiedini recipe contains no website links',async()=>{const fs=await import('node:fs/promises');const text=await fs.readFile(new URL('./fixtures/spiedini.txt',import.meta.url),'utf8');assert.deepEqual(sourceLinkErrors(text,[]),[])});
test('ChatGPT attribution, fractions, ingredient markers and cooking prose are not links',()=>{assert.deepEqual(sourceLinkErrors('Formatted by ChatGPT. Mix {{i1}} and {{i13}}. Add ⅔ cup panko, ½ tsp garlic powder. Cook at 400°F until 165°F (74°C). Marinate for 30–60 minutes. Prep Time: 15 minutes.',[]),[])});
test('actual rejected text links identify the offending domain',()=>{assert.match(sourceLinkErrors('Visit https://unrelated.example/promo',[])[0],/unrelated\.example/)});
