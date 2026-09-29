const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

// Minimal .env loader so the project works without an extra dependency.
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const raw of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('\"') && value.endsWith('\"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

const PORT = Number(process.env.PORT || 3000);
const ADMIN_USER = process.env.ADMIN_USER || 'authority';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-before-deployment';
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const PUBLIC_DIR = path.join(ROOT, 'public');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const sessions = new Map();

fs.mkdirSync(DATA_DIR, { recursive: true });
for (const file of [APPLICATIONS_FILE, STUDENTS_FILE]) if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');

const facts = {
  schoolName: 'Gubali Secondary School (Gubali High School)',
  postal: 'S. L. P 507, Kondoa-Dodoma, Tanzania',
  email: 'gubalisecondary@gmail.com',
  phones: ['+255 713 484 974', '+255 718 840 327'],
  location: 'Bolisa, Kondoa Town Council, Dodoma Region. The supplied joining instructions describe the school as about 15 km from Kondoa town on the main road toward Babati/Arusha.',
  combinations: ['PCB', 'PCM', 'PMC', 'HGL', 'HGLi', 'HGK', 'HKL']
};

function readJson(file){try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return [];}}
function writeJson(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2));}
function clean(v,max=1000){return typeof v==='string'?v.trim().slice(0,max):'';}
function cleanObject(obj){
  if(Array.isArray(obj)) return obj.slice(0,20).map(cleanObject);
  if(obj && typeof obj==='object') { const o={}; for(const [k,v] of Object.entries(obj)) o[k]=typeof v==='string'?clean(v):cleanObject(v); return o; }
  return obj;
}
function send(res,status,data,headers={}){const body=typeof data==='string'?data:JSON.stringify(data);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(body);}
function sendFile(res,file){
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}
    const ext=path.extname(file).toLowerCase(); const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.pdf':'application/pdf','.json':'application/json; charset=utf-8'};
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':ext==='.html'?'no-cache':'public, max-age=3600'});res.end(data);
  });
}
function readBody(req){return new Promise((resolve,reject)=>{let body='';req.on('data',c=>{body+=c;if(body.length>12*1024*1024){req.destroy();reject(new Error('Request too large'));}});req.on('end',()=>{try{resolve(body?JSON.parse(body):{});}catch(e){reject(e);}});req.on('error',reject);});}
function isAuthed(req){const h=req.headers.authorization||'';const token=h.startsWith('Bearer ')?h.slice(7):'';if(!token||!sessions.has(token))return false;const session=sessions.get(token);if(Date.now()-session.createdAt>8*60*60*1000){sessions.delete(token);return false;}return true;}
function unauthorized(res){return send(res,401,{error:'Unauthorized'});}

async function route(req,res){
  const url=new URL(req.url,`http://${req.headers.host||'localhost'}`); const p=url.pathname;
  if(req.method==='POST' && p==='/api/login'){
    const body=await readBody(req).catch(()=>null); if(!body)return send(res,400,{error:'Invalid request'});
    if(clean(body.username,100)!==ADMIN_USER || (typeof body.password==='string'?body.password:'')!==ADMIN_PASSWORD) return send(res,401,{error:'Invalid login details'});
    const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{createdAt:Date.now()});return send(res,200,{token,user:ADMIN_USER});
  }
  if(p==='/api/site' && req.method==='GET') return send(res,200,facts);
  if(p==='/api/ai' && req.method==='POST'){
    const body=await readBody(req).catch(()=>null);if(!body)return send(res,400,{error:'Invalid request'});
    const q=clean(body.question,500).toLowerCase(); const has=(...w)=>w.some(x=>q.includes(x));let answer;
    if(has('where','location','address','ipo wapi','mahali')) answer=`${facts.schoolName} is in Bolisa, Kondoa Town Council, Dodoma Region. The supplied joining instructions say it is about 15 km from Kondoa town on the main road toward Babati/Arusha. Postal address: ${facts.postal}.`;
    else if(has('contact','phone','simu','email','mawasiliano')) answer=`School email: ${facts.email}. Main contacts: ${facts.phones.join(' / ')}.`;
    else if(has('apply','application','admission','join','kujiunga','maombi','fomu')) answer='Use the Apply Online page. It contains student particulars, parent/guardian information, emergency contacts, declarations, and photo uploads based on the supplied joining form.';
    else if(has('requirement','uniform','sare','mahitaji')) answer='The supplied joining instructions list jungle-green suit trousers, long-sleeve white shirts, dark-blue sportswear, black lace-up leather shoes, white socks, a jungle-green V-neck sweater, study materials, bedding, utensils, a mattress and other personal items. Open the Joining Instructions PDF for the complete list.';
    else if(has('fee','fees','contribution','mchango','80,000')) answer='The supplied instructions list school operation 65,000/=, caution 5,000/=, badge 5,000/= and school ID 5,000/=; total 80,000/=. Students without health insurance are instructed to bring 50,400/= for NHIF.';
    else if(has('combination','tahasusi','pcm','pcb','pmc','hgl')) answer='The supplied form references combinations including PCB, PCM, PMC, HGL, HGLi, HGK and HKL. Choose the combination shown on the official placement/joining instructions.';
    else if(has('history','historia')) answer='A public school directory identifies Gubali Secondary School as a government school in Bolisa, Kondoa Town Council and reports registration in 2007. The detailed institutional history should be added by the school authority.';
    else if(has('medical','hospital','health')) answer='The original joining pack contains a medical examination form intended to be completed by a medically qualified and registered professional. The website keeps that form as a downloadable document rather than asking students to self-complete it.';
    else answer='I can answer questions about the school profile, location, contacts, application process, combinations, joining requirements, and the attached joining instructions. Try “How do I apply?”, “Where is Gubali?”, or “What are the joining requirements?”';
    return send(res,200,{answer});
  }
  if(p==='/api/applications' && req.method==='POST'){
    const data=cleanObject(await readBody(req).catch(()=>null)||{});const per=data.personal||{},g=data.guardian||{};
    if(!clean(per.fullName)||!clean(per.dob)||!clean(per.previousSchool)||!clean(per.combination)||!clean(g.urgentPhone)) return send(res,400,{error:'Please complete the required student and guardian fields.'});
    const apps=readJson(APPLICATIONS_FILE);const id=`GUB-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    apps.unshift({id,submittedAt:new Date().toISOString(),status:'submitted',registrationNumber:null,...data});writeJson(APPLICATIONS_FILE,apps);return send(res,201,{ok:true,id,message:'Application submitted successfully.'});
  }
  if(p.startsWith('/api/admin/')){
    if(!isAuthed(req))return unauthorized(res);
    if(p==='/api/admin/applications' && req.method==='GET')return send(res,200,readJson(APPLICATIONS_FILE));
    if(p==='/api/admin/students' && req.method==='GET')return send(res,200,readJson(STUDENTS_FILE));
    if(p==='/api/admin/export.csv' && req.method==='GET'){
      const apps=readJson(APPLICATIONS_FILE);const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;const rows=[['Application ID','Submitted','Status','Registration No.','Student Name','DOB','Sex','Combination','O-Level School','CSEE Index','Division','Points','Guardian Phone'].map(q)];
      for(const a of apps)rows.push([a.id,a.submittedAt,a.status,a.registrationNumber||'',a.personal?.fullName||'',a.personal?.dob||'',a.personal?.sex||'',a.personal?.combination||'',a.personal?.previousSchool||'',a.personal?.cseeIndex||'',a.personal?.division||'',a.personal?.points||'',a.guardian?.urgentPhone||''].map(q));
      const csv=rows.map(r=>r.join(',')).join('\n');res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="gubali-admissions.csv"'});return res.end(csv);
    }
    const statusMatch=p.match(/^\/api\/admin\/applications\/([^/]+)\/status$/);
    if(statusMatch&&req.method==='PATCH'){const body=await readBody(req).catch(()=>null);const valid=['submitted','reviewing','approved','rejected'];if(!body||!valid.includes(body.status))return send(res,400,{error:'Invalid status'});const apps=readJson(APPLICATIONS_FILE);const i=apps.findIndex(x=>x.id===statusMatch[1]);if(i<0)return send(res,404,{error:'Application not found'});apps[i].status=body.status;apps[i].updatedAt=new Date().toISOString();writeJson(APPLICATIONS_FILE,apps);return send(res,200,apps[i]);}
    const regMatch=p.match(/^\/api\/admin\/applications\/([^/]+)\/register$/);
    if(regMatch&&req.method==='POST'){const apps=readJson(APPLICATIONS_FILE);const i=apps.findIndex(x=>x.id===regMatch[1]);if(i<0)return send(res,404,{error:'Application not found'});if(apps[i].registrationNumber)return send(res,200,apps[i]);if(apps[i].status!=='approved')return send(res,409,{error:'Approve the application before registering the student.'});const students=readJson(STUDENTS_FILE);const year=new Date().getFullYear();const registrationNumber=`GHS-${year}-${String(students.length+1).padStart(4,'0')}`;const appRecord=apps[i];const student={registrationNumber,applicationId:appRecord.id,registeredAt:new Date().toISOString(),fullName:appRecord.personal?.fullName||'',combination:appRecord.personal?.combination||'',previousSchool:appRecord.personal?.previousSchool||'',sex:appRecord.personal?.sex||'',phone:appRecord.guardian?.urgentPhone||'',application:appRecord};students.unshift(student);writeJson(STUDENTS_FILE,students);appRecord.registrationNumber=registrationNumber;appRecord.status='registered';appRecord.updatedAt=new Date().toISOString();apps[i]=appRecord;writeJson(APPLICATIONS_FILE,apps);return send(res,201,{application:appRecord,student});}
    return send(res,404,{error:'Admin route not found'});
  }
  if(p==='/')return sendFile(res,path.join(PUBLIC_DIR,'index.html'));
  if(p==='/apply.html')return sendFile(res,path.join(PUBLIC_DIR,'apply.html'));
  if(p==='/admin.html')return sendFile(res,path.join(PUBLIC_DIR,'admin.html'));
  const safe=path.normalize(p).replace(/^\.{2}[\\/]/,'');const file=path.join(PUBLIC_DIR,safe);if(file.startsWith(PUBLIC_DIR) && fs.existsSync(file)&&fs.statSync(file).isFile())return sendFile(res,file);
  return sendFile(res,path.join(PUBLIC_DIR,'index.html'));
}

const server=http.createServer((req,res)=>{route(req,res).catch(e=>{console.error(e);if(!res.headersSent)send(res,500,{error:'Server error'});else res.end();});});
server.listen(PORT,()=>console.log(`Gubali High School Portal running at http://localhost:${PORT}`));
