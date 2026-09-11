
const people = YEARBOOK_PEOPLE;
const total = people.length;
let current = 0;
let busy = false;

const cover = document.getElementById('cover');
const book = document.getElementById('book');
const indexScreen = document.getElementById('indexScreen');
const memoryScreen = document.getElementById('memoryScreen');
const leftContent = document.getElementById('leftContent');
const rightContent = document.getElementById('rightContent');
const leftPageNo = document.getElementById('leftPageNo');
const rightPageNo = document.getElementById('rightPageNo');
const counter = document.getElementById('counter');
const turnPage = document.getElementById('turnPage');

function esc(s=''){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function personPhoto(p){
  if(!p.photo){
    return `<div class="photo-frame no-photo"><div class="photo-caption"><strong>${esc(p.name)}</strong><small>${p.type==='dean'?'Associate Dean':'XLRI BM 24–26'}</small></div></div>`;
  }
  return `<div class="photo-frame has-photo">
    <img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="eager"
      onerror="this.onerror=null; this.remove(); this.closest('.photo-frame').classList.remove('has-photo'); this.closest('.photo-frame').classList.add('no-photo');">
    <div class="photo-caption"><strong>${esc(p.name)}</strong><small>${p.type==='dean'?'Associate Dean':'PGDM-BM • Batch of 2026'}</small></div>
  </div>`;
}

function notePage(p){
  const dean = p.type==='dean';
  return `<div class="note-page">
    ${dean ? '<div class="dean-badge">Associate Dean · XLRI Jamshedpur</div>' : '<div class="note-kicker">A little something about</div>'}
    <h2>${dean ? 'A message for<br><em>BM 24–26</em>' : esc(p.name)}</h2>
    ${p.hasNote ? `<div class="note">${esc(p.note)}</div>` : `<div class="empty-note">No message was submitted for this page. Sometimes a familiar face needs no explanation.</div>`}
    ${dean ? '<div class="note-sign">— Prof. Giri</div>' : '<div class="note-sign">— From someone who knows you 🤍</div>'}
  </div>`;
}

function render(){
  const p=people[current];
  leftContent.innerHTML = personPhoto(p);
  rightContent.innerHTML = notePage(p);
  leftPageNo.textContent = current+1;
  rightPageNo.textContent = current+1;
  counter.textContent = `${current+1} / ${total}`;
  document.getElementById('prevBtn').disabled = current===0;
  document.getElementById('nextBtn').disabled = current===total-1;
  document.getElementById('prevBtn').style.opacity=current===0?.4:1;
  document.getElementById('nextBtn').style.opacity=current===total-1?.4:1;
}

function openBook(index=0){
  current=Math.max(0,Math.min(total-1,index));
  render();
  cover.classList.remove('active');
  book.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  document.getElementById('bookSpread').focus({preventScroll:true});
}

function closeOverlays(){
  indexScreen.classList.remove('active');
  memoryScreen.classList.remove('active');
}

function go(delta){
  if(busy || current+delta<0 || current+delta>=total) return;
  busy=true;
  const oldRight = rightContent.innerHTML;
  const oldLeft = leftContent.innerHTML;
  turnPage.className='turn-page';
  if(delta>0){
    turnPage.innerHTML=`<div class="page-inner">${oldRight}</div>`;
    turnPage.classList.add('flip-next');
  }else{
    turnPage.innerHTML=`<div class="page-inner">${oldLeft}</div>`;
    turnPage.classList.add('flip-prev');
  }
  current += delta;
  render();
  setTimeout(()=>{turnPage.className='turn-page';turnPage.innerHTML='';busy=false;},680);
}

function buildIndex(filter=''){
  const q=filter.trim().toLowerCase();
  const grid=document.getElementById('indexGrid');
  const matches=people.map((p,i)=>({p,i})).filter(x=>!q||x.p.name.toLowerCase().includes(q));
  grid.innerHTML=matches.map(({p,i})=>`
    <button class="index-item" data-index="${i}">
      <span class="index-no">${String(i+1).padStart(2,'0')}</span>
      <span class="index-name">${esc(p.name)}</span>
    </button>`).join('') || '<p style="padding:25px;color:#777">No match found.</p>';
  grid.querySelectorAll('[data-index]').forEach(b=>b.addEventListener('click',()=>{
    closeOverlays(); openBook(Number(b.dataset.index));
  }));
}

document.getElementById('openBtn').addEventListener('click',()=>openBook(0));
document.getElementById('homeBtn').addEventListener('click',()=>{
  book.classList.remove('active'); cover.classList.add('active'); closeOverlays();
});
document.getElementById('indexBtn').addEventListener('click',()=>{buildIndex();indexScreen.classList.add('active')});
document.getElementById('closeIndex').addEventListener('click',()=>indexScreen.classList.remove('active'));
document.getElementById('memoryBtn').addEventListener('click',()=>memoryScreen.classList.add('active'));
document.getElementById('surpriseBtn').addEventListener('click',()=>openBook(Math.floor(Math.random()*total)));
document.getElementById('closeMemory').addEventListener('click',()=>memoryScreen.classList.remove('active'));
document.getElementById('memoryBack').addEventListener('click',()=>memoryScreen.classList.remove('active'));
document.getElementById('prevBtn').addEventListener('click',()=>go(-1));
document.getElementById('nextBtn').addEventListener('click',()=>go(1));
document.getElementById('searchInput').addEventListener('input',e=>buildIndex(e.target.value));

document.addEventListener('keydown',e=>{
  if(indexScreen.classList.contains('active')||memoryScreen.classList.contains('active')){
    if(e.key==='Escape') closeOverlays();
    return;
  }
  if(!book.classList.contains('active')) return;
  if(e.key==='ArrowRight') go(1);
  if(e.key==='ArrowLeft') go(-1);
});

let touchX=0;
document.getElementById('bookSpread').addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX},{passive:true});
document.getElementById('bookSpread').addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-touchX;
  if(Math.abs(dx)>45) go(dx<0?1:-1);
},{passive:true});

buildIndex();
render();
