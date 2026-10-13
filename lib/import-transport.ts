type ImportEvent={type:'progress';message:string}|{type:'result';status:number;data:any};

// Send bytes while extraction is running so an idle gateway cannot drop the request.
// The terminal record carries the original HTTP status; streaming itself starts at 200.
export function streamImport(run:(progress:(message:string)=>void)=>Promise<Response>,heartbeatMs=5000){
 const encoder=new TextEncoder();let closed=false;let timer:ReturnType<typeof setInterval>;
 const stream=new ReadableStream<Uint8Array>({
  start(controller){
   const send=(event:ImportEvent)=>{if(!closed)controller.enqueue(encoder.encode(JSON.stringify(event)+'\n'));};
   controller.enqueue(encoder.encode(' '.repeat(4096)+'\n'));
   send({type:'progress',message:'Checking your recipe…'});
   timer=setInterval(()=>send({type:'progress',message:'Still working on your recipe…'}),heartbeatMs);
   void (async()=>{try{const response=await run(message=>send({type:'progress',message}));send({type:'result',status:response.status,data:await response.json()});}
    catch{send({type:'result',status:503,data:{error:'Recipe importing could not complete. Your recipe text is still here. Please try again.'}});}
    finally{clearInterval(timer);if(!closed){closed=true;controller.close();}}})();
  },
  cancel(){closed=true;clearInterval(timer);}
 });
 return new Response(stream,{headers:{'Content-Type':'application/x-ndjson; charset=utf-8','Cache-Control':'no-store, no-transform','X-Accel-Buffering':'no'}});
}

function resultData(status:number,data:any){if(status<200||status>=300)throw Object.assign(new Error(data?.error||'Recipe importing could not complete. Please try again.'),data);return data;}

export async function readImportResponse(response:Response,progress?:(message:string)=>void){
 if(!response.headers.get('content-type')?.includes('application/x-ndjson')){
  let data;try{data=await response.json();}catch{throw new Error('The recipe service returned an incomplete response. Your recipe text is still here. Please try again.');}
  return resultData(response.status,data);
 }
 const reader=response.body?.getReader();if(!reader)throw new Error('The recipe connection ended. Your recipe text is still here. Please try again.');
 const decoder=new TextDecoder();let pending='';
 try{while(true){const {done,value}=await reader.read();pending+=done?decoder.decode():decoder.decode(value,{stream:true});
   const lines=pending.split('\n');pending=lines.pop()||'';if(done&&pending.trim()){lines.push(pending);pending='';}
   for(const line of lines){if(!line.trim())continue;const event:ImportEvent=JSON.parse(line);if(event.type==='progress')progress?.(event.message);else if(event.type==='result')return resultData(event.status,event.data);}
   if(done)throw new Error('The recipe connection ended before extraction finished. Your recipe text is still here. Please try again.');
  }}finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
}
