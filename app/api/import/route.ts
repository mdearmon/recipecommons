import {body,userRequired,database,HttpError,failure,hash,admin} from '@/lib/server';
import {canonicalSource,fingerprintData,recipeSchema,type Recipe} from '@/lib/recipe';
import {validateUpload} from '@/lib/uploads';
import {recipePolicyText} from '@/lib/content-policy';
import {moderateRecipeContent} from '@/lib/moderation';
import {extract,sourceText} from '@/lib/importer';
import {correctionSummary} from '@/lib/ingredient-tracking';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
const u=await userRequired(),b=await body(req,15000000),db=database();let baseline:Recipe|undefined,source='',canApply=true;
try{source=b.url?canonicalSource(String(b.url)):''}catch{throw new HttpError(400,'Enter a valid HTTP or HTTPS recipe URL.');}
if(b.recheck){if(b.id){const row=await db.prepare('SELECT owner,status,data,source,revision FROM recipes WHERE id=?').bind(String(b.id)).first<any>();if(!row||row.status!=='published'&&row.owner!==u.userId&&!admin(u.email))throw new HttpError(404,'Recipe is unavailable.');if(['deleted','merged','unpublished'].includes(row.status))throw new HttpError(400,'Restore this recipe before rechecking it.');canApply=row.owner===u.userId||admin(u.email);baseline=recipeSchema.parse(JSON.parse(row.data));if(b.recipe&&canApply)baseline=recipeSchema.parse(b.recipe);const original=row.source||baseline!.sourceURLs[0]||'';if(source&&original&&canonicalSource(source)!==canonicalSource(original))throw new HttpError(400,'Use the original attributed recipe source.');source=original||source;}else{baseline=recipeSchema.parse(b.recipe);const original=baseline.sourceURLs[0]||'';if(source&&original&&source!==canonicalSource(original))throw new HttpError(400,'Use the original attributed recipe source.');source=original||source;}}
if(!b.recheck&&source&&!b.text&&!b.file){const existing=await db.prepare('SELECT id,name FROM recipes WHERE source_key=? AND status=? LIMIT 1').bind(source,'published').first();if(existing)return Response.json({existing});}
let file;try{if(b.file)file=validateUpload(b.file)}catch(e){throw new HttpError(400,(e as Error).message)}
let text=String(b.text||'').trim(),structured=false,linkedSource='';
if(!text&&source&&!file){try{const result=await sourceText(source);text=result.text;structured=result.structured;linkedSource=result.linkedSource||'';}catch(e){if(b.recheck)throw new HttpError(422,'The original URL could not be retrieved. Paste the original recipe text or upload its file to recheck.',{sourceRequired:true});throw e;}}
if(!file&&text.length<20)throw new HttpError(400,b.recheck?'Paste the original recipe text or upload its file to recheck ingredient amounts.':'Paste the recipe text or enter a source URL.',{sourceRequired:!!b.recheck});if(text.length>50000)throw new HttpError(400,'Keep recipe text below 50,000 characters.');
const day=new Date().toISOString().slice(0,10);const limit=await db.prepare('INSERT INTO usage (user,day,count) VALUES (?,?,1) ON CONFLICT(user,day) DO UPDATE SET count=count+1 WHERE count<20 RETURNING count').bind(u.userId,day).first();if(!limit)throw new HttpError(429,'You have used today’s 20 AI imports. Manual recipe entry is still available.');
const sources=[...new Set([...(baseline?.sourceURLs||[]),source,linkedSource].filter(Boolean))];await moderateRecipeContent(text,sources,file,String(b.focus||''),!!source&&!b.text&&!file&&!structured);
const recipe=await extract(text,file,String(b.focus||''),baseline);if(file&&!baseline)recipe.sourceLabel='Uploaded '+(file.type==='application/pdf'?'PDF: ':'photo: ')+file.name;recipe.sourceURLs=sources;
await moderateRecipeContent(recipePolicyText(recipe),sources);
const receipt=crypto.randomUUID();await db.prepare('INSERT INTO import_receipts (id,user,sources,fingerprint,created) VALUES (?,?,?,?,?)').bind(receipt,u.userId,JSON.stringify(sources),await hash(fingerprintData(recipe)),new Date().toISOString()).run();recipe.sourceReceipt=baseline?.sourceReceipt||receipt;
return Response.json({recipe,source,structured,canApply,rechecked:!!b.recheck,corrections:baseline?correctionSummary(baseline,recipe):[],sourceChecked:true});
}catch(e){return failure(e)}}
