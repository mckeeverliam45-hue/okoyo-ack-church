const express=require('express');
const path=require('path');
const fs=require('fs');
const multer=require('multer');
const db=require('./db');
const app=express();
const PORT=process.env.PORT||3000;
const ADMIN_USER=process.env.ADMIN_USER||'admin';
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'ChangeThisPasswordNow!';
const sessions=new Map();
const upload=multer({dest:path.join(__dirname,'uploads'),limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>cb(null,/^image\/(jpeg|png|webp)$/.test(file.mimetype))});
app.use(express.json({limit:'1mb'}));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
function auth(req,res,next){const token=req.headers.authorization?.replace('Bearer ',''); if(!token||!sessions.has(token)) return res.status(401).json({error:'Unauthorised'}); next();}
function content(){return Object.fromEntries(db.prepare('SELECT key,value FROM content').all().map(r=>[r.key,r.value]));}
app.get('/api/site',(req,res)=>res.json({content:content(),services:db.prepare('SELECT * FROM services WHERE published=1 ORDER BY service_date DESC,id DESC').all(),gallery:db.prepare('SELECT * FROM gallery ORDER BY id DESC').all(),paybill:'247247',account:'291900'}));
app.post('/api/login',(req,res)=>{const {username,password}=req.body;if(username===ADMIN_USER&&password===ADMIN_PASSWORD){const token=cryptoRandom();sessions.set(token,Date.now());return res.json({token});}res.status(401).json({error:'Invalid login'});});
function cryptoRandom(){return require('crypto').randomBytes(32).toString('hex');}
app.put('/api/content/:key',auth,(req,res)=>{db.prepare('INSERT INTO content(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(req.params.key,String(req.body.value||''));res.json({ok:true});});
app.post('/api/services',auth,(req,res)=>{const {service_date,title,time,minister,items,published=1}=req.body; const info=db.prepare('INSERT INTO services(service_date,title,time,minister,items,published) VALUES (?,?,?,?,?,?)').run(service_date,title,time,minister,items,published?1:0);res.json({id:info.lastInsertRowid});});
app.put('/api/services/:id',auth,(req,res)=>{const {service_date,title,time,minister,items,published=1}=req.body;db.prepare('UPDATE services SET service_date=?,title=?,time=?,minister=?,items=?,published=? WHERE id=?').run(service_date,title,time,minister,items,published?1:0,req.params.id);res.json({ok:true});});
app.delete('/api/services/:id',auth,(req,res)=>{db.prepare('DELETE FROM services WHERE id=?').run(req.params.id);res.json({ok:true});});
app.post('/api/gallery',auth,upload.single('image'),(req,res)=>{if(!req.file)return res.status(400).json({error:'Image required'});const ext=path.extname(req.file.originalname).toLowerCase()||'.jpg';const filename=`${Date.now()}-${req.file.filename}${ext}`;fs.renameSync(req.file.path,path.join(__dirname,'uploads',filename));const image=`/uploads/${filename}`;const info=db.prepare('INSERT INTO gallery(title,caption,image) VALUES (?,?,?)').run(req.body.title||'Church Gallery',req.body.caption||'',image);res.json({id:info.lastInsertRowid,image});});
app.delete('/api/gallery/:id',auth,(req,res)=>{const row=db.prepare('SELECT image FROM gallery WHERE id=?').get(req.params.id); if(row?.image?.startsWith('/uploads/')){try{fs.unlinkSync(path.join(__dirname,row.image))}catch(e){}} db.prepare('DELETE FROM gallery WHERE id=?').run(req.params.id);res.json({ok:true});});
app.post('/api/messages',(req,res)=>{const {name,email,phone,message}=req.body;if(!name||!message)return res.status(400).json({error:'Name and message are required'});db.prepare('INSERT INTO messages(name,email,phone,message) VALUES (?,?,?,?)').run(name,email||'',phone||'',message);res.json({ok:true,message:'Thank you. Your message has been received.'});});
app.post('/api/giving',(req,res)=>{const {name,phone,amount,purpose,reference}=req.body;if(!amount||Number(amount)<=0)return res.status(400).json({error:'Enter a valid amount'});db.prepare('INSERT INTO giving(name,phone,amount,purpose,reference) VALUES (?,?,?,?,?)').run(name||'',phone||'',Number(amount),purpose||'Offering',reference||'');res.json({ok:true,message:'Giving record saved. Complete the payment using the church PayBill instructions.'});});
app.get('/api/admin/messages',auth,(req,res)=>res.json(db.prepare('SELECT * FROM messages ORDER BY id DESC').all()));
app.get('/api/admin/giving',auth,(req,res)=>res.json(db.prepare('SELECT * FROM giving ORDER BY id DESC').all()));
app.get('/api/admin/gallery',auth,(req,res)=>res.json(db.prepare('SELECT * FROM gallery ORDER BY id DESC').all()));
app.listen(PORT,()=>console.log(`ACK Okoyo Church running at http://localhost:${PORT}`));
