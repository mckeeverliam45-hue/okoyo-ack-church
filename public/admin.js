let token=localStorage.okoyoAdmin||'';
const $=s=>document.querySelector(s);
const api=async(u,o={})=>{
  o.headers={...(o.headers||{}),...(token?{Authorization:'Bearer '+token}:{})};
  const r=await fetch(u,o); const d=await r.json();
  if(!r.ok)throw new Error(d.error||'Request failed'); return d;
};
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function parseJSON(v,fallback={}){try{return v?JSON.parse(v):fallback}catch(e){return fallback}}

async function start(){
  if(!token)return;
  try{
    const d=await api('/api/site');
    $('#login').style.display='none';
    $('#dashboard').style.display='block';
    for(const k of ['hero_title','hero_subtitle','mission','vision','history','youtube']){
      const el=$(`[name="${k}"]`); if(el)el.value=d.content[k]||'';
    }
    renderServices(d.services); renderGallery(d.gallery); loadPrivate();
  }catch(e){localStorage.removeItem('okoyoAdmin');token='';$('#login').style.display='block';$('#dashboard').style.display='none';}
}

function renderServices(a){
  $('#services').innerHTML='<table><tr><th>Date</th><th>Service</th><th>Time</th><th>Readings</th><th>Ministers</th><th></th></tr>'+a.map(s=>{
    const r=parseJSON(s.readings); const m=parseJSON(s.ministers);
    const reading=[r.old_testament,r.psalm,r.epistle,r.gospel].filter(Boolean).join(' • ');
    const mins=[m.presiding,m.preacher,m.reader].filter(Boolean).join(' • ') || s.minister || '';
    return `<tr><td>${esc(s.service_date)}</td><td>${esc(s.title)}</td><td>${esc(s.time)}</td><td>${esc(reading||'—')}</td><td>${esc(mins||'—')}</td><td><button class="danger" onclick="delService(${s.id})">Delete</button></td></tr>`;
  }).join('')+'</table>';
}
async function delService(id){if(confirm('Delete this service?')){await api('/api/services/'+id,{method:'DELETE'});start()}}

function renderGallery(a){
  $('#gallery').innerHTML='<table><tr><th>Image</th><th>Title</th><th>Caption</th><th></th></tr>'+a.map(g=>`<tr><td><img src="${esc(g.image)}" style="width:90px;height:60px;object-fit:cover;border-radius:6px" alt="${esc(g.title)}"></td><td>${esc(g.title)}</td><td>${esc(g.caption)}</td><td><button class="danger" onclick="delGallery(${g.id})">Delete</button></td></tr>`).join('')+'</table>';
}
async function delGallery(id){if(confirm('Delete this image?')){await api('/api/gallery/'+id,{method:'DELETE'});start()}}

async function loadPrivate(){
  const [g,m]=await Promise.all([api('/api/admin/giving'),api('/api/admin/messages')]);
  $('#giving').innerHTML='<table><tr><th>Date</th><th>Amount</th><th>Purpose</th><th>Reference</th></tr>'+g.map(x=>`<tr><td>${esc(x.created_at)}</td><td>KSh ${Number(x.amount).toLocaleString()}</td><td>${esc(x.purpose)}</td><td>${esc(x.reference)}</td></tr>`).join('')+'</table>';
  $('#messages').innerHTML='<table><tr><th>Name</th><th>Contact</th><th>Message</th></tr>'+m.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.email)}<br>${esc(x.phone)}</td><td>${esc(x.message)}</td></tr>`).join('')+'</table>';
}

$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  try{
    const d=await api('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});
    token=d.token;localStorage.okoyoAdmin=token;$('#loginMsg').textContent='';start();
  }catch(x){$('#loginMsg').textContent=x.message}
});

$('#contentForm').addEventListener('submit',async e=>{
  e.preventDefault();
  try{
    for(const [k,v] of new FormData(e.target))await api('/api/content/'+k,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({value:v})});
    $('#contentMsg').textContent='Saved successfully.';
  }catch(x){$('#contentMsg').textContent=x.message}
});

$('#serviceForm').addEventListener('submit',async e=>{
  e.preventDefault();
  try{
    const data=Object.fromEntries(new FormData(e.target));
    data.published=e.target.elements.published.checked?1:0;
    await api('/api/services',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    $('#serviceMsg').textContent='Service published successfully.';
    e.target.reset(); e.target.elements.published.checked=true; start();
  }catch(x){$('#serviceMsg').textContent=x.message}
});

$('#galleryImage').addEventListener('change',e=>{
  const file=e.target.files[0]; const preview=$('#galleryPreview');
  if(!file){preview.style.display='none';return}
  preview.src=URL.createObjectURL(file); preview.style.display='block';
});

$('#galleryForm').addEventListener('submit',async e=>{
  e.preventDefault();
  try{
    const r=await fetch('/api/gallery',{method:'POST',headers:{Authorization:'Bearer '+token},body:new FormData(e.target)});
    const d=await r.json(); if(!r.ok)throw new Error(d.error||'Upload failed');
    $('#galleryMsg').textContent='Image uploaded successfully.';
    e.target.reset(); $('#galleryPreview').style.display='none'; start();
  }catch(x){$('#galleryMsg').textContent=x.message}
});

start();
