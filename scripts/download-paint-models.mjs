import fs from 'node:fs/promises';
const data=JSON.parse(await fs.readFile('/private/tmp/flower-pet-manifest.json','utf8')).data;
await fs.mkdir('public/models/painting',{recursive:true});
const selected=[['cat','แมว','Cat Sitting (Ginger Tabby)'],['dog','หมา','Retriever Sitting'],['rabbit','กระต่าย','Rabbit Sitting'],['tortoise','เต่า','Tortoise'],['guinea','หนูตะเภา','Guinea Pig']];
const records=[];
for(const [id,name,prefix] of selected){const a=data.assets.find(a=>a.title.startsWith(prefix));if(!a)throw Error(prefix);for(const [url,ext] of [[a.cdnUrl,'glb'],[a.posterUrl,'webp']]){const r=await fetch(url);if(!r.ok)throw Error(r.status+' '+url);const b=Buffer.from(await r.arrayBuffer());await fs.writeFile(`public/models/painting/${id}.${ext}`,b);console.log(id,ext,b.length);}records.push({id,name,source:a.url,license:a.license,bytes:a.stats.fileSize});}
await fs.writeFile('public/models/painting/SOURCES.json',JSON.stringify(records,null,2));
