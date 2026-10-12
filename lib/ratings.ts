export type Rating={score:number;revision:number;fingerprint:string;removed:number;user:string};
export function summarizeRatings(ratings:Rating[],owner:string,currentFingerprint:string){const active=ratings.filter(r=>!r.removed&&r.user!==owner);return {average:active.length?active.reduce((a,r)=>a+r.score,0)/active.length:null,count:active.length,updatedSinceRatings:active.some(r=>r.fingerprint!==currentFingerprint)};}
export function countCollectors(users:string[],owner:string){return new Set(users.filter(u=>u!==owner)).size;}
export function validStars(score:unknown){return typeof score==='number'&&Number.isInteger(score)&&score>=1&&score<=5;}
export function compareHighestRated(a:{count:number;average:number|null},b:{count:number;average:number|null}){const qualifiedA=a.count>=5,qualifiedB=b.count>=5;if(qualifiedA!==qualifiedB)return qualifiedA?-1:1;if(!qualifiedA)return b.count-a.count;return (b.average||0)-(a.average||0)||b.count-a.count;}
