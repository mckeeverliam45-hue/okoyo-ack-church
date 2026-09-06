const Database = require('better-sqlite3');
const db = new Database('okoyo.db');
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY AUTOINCREMENT, service_date TEXT, title TEXT, time TEXT, minister TEXT, items TEXT, published INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS gallery (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, caption TEXT, image TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, phone TEXT, message TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS giving (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, amount REAL, purpose TEXT, reference TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`);
const seed = db.prepare('INSERT OR IGNORE INTO content (key,value) VALUES (?,?)');
[
 ['hero_title','WELCOME TO ACK OKOYO CHURCH'],
 ['hero_subtitle','A Christ-centred family serving God and community in Oluti Village, Seme Constituency, Kisumu County.'],
 ['history','ACK Okoyo Church is part of the Anglican Church of Kenya under the Diocese of Maseno South. The congregation serves believers and the surrounding community in Oluti Village, Seme Constituency, Kisumu County. This website is designed to preserve the church story, share ministry activities, publish services and strengthen communication. Historical dates and milestones can be expanded by church leadership through the admin dashboard.'],
 ['mission','To proclaim Christ, nurture faithful disciples, build a caring Christian family and serve our community with integrity.'],
 ['vision','A growing, united and Christ-centred church transforming lives through faith, love, service and hope.'],
 ['pastor','Church leadership details can be updated from the administration dashboard.'],
 ['youtube',process.env.YOUTUBE_URL || 'https://www.youtube.com/']
].forEach(x=>seed.run(x));
const count = db.prepare('SELECT COUNT(*) c FROM services').get().c;
if(!count){ db.prepare(`INSERT INTO services (service_date,title,time,minister,items) VALUES (?,?,?,?,?)`).run(new Date().toISOString().slice(0,10),'Sunday Worship Service','8:00 AM – 11:00 AM','Church Minister','Opening & praise\nBible readings\nSermon / teaching\nPrayers\nHoly Communion (as scheduled)\nAnnouncements\nOffering & thanksgiving\nBenediction'); }
const gcount=db.prepare('SELECT COUNT(*) c FROM gallery').get().c;
if(!gcount){
 const ins=db.prepare('INSERT INTO gallery(title,caption,image) VALUES (?,?,?)');
 ins.run('Worship & Fellowship','A church gathering and time of prayer.','/assets/service.jpg');
 ins.run('KAMA Commissioning','KAMA commissioning event poster shared by the church.','/assets/kama.jpg');
 ins.run('Building Project','Progress on the church building project.','/assets/roofing.jpg');
 ins.run('Stewardship','Stewardship and giving materials.','/assets/stewardship.jpg');
 ins.run('Church Plan','Okoyo Church floor plan.','/assets/floor-plan.jpg');
}
module.exports=db;
