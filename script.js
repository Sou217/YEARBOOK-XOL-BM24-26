const people = YEARBOOK_PEOPLE;
const students = people.filter(p => p.type === 'student');
const pages = [
  { type: 'cover', title: 'Cover' },
  { type: 'ad-note', title: 'A Note from the Associate Dean' },
  { type: 'dean', person: people.find(p => p.type === 'dean') },
  { type: 'wall', title: 'Memory Wall' },
  ...students.map(p => ({ type: 'person', person: p }))
];
let current = 0;
let busy = false;

const cover = document.getElementById('cover');
const book = document.getElementById('book');
const sheet = document.getElementById('bookSheet');
const sheetContent = document.getElementById('sheetContent');
const turnOverlay = document.getElementById('turnOverlay');
const counter = document.getElementById('counter');
const indexScreen = document.getElementById('indexScreen');

function esc(s='') {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function paragraphs(text='') {
  return esc(text).split(/\n\s*\n/).map(x => `<p>${x.replace(/\n/g,'<br>')}</p>`).join('');
}
function photoMarkup(p, compact=false) {
  if (!p.photo) return `<div class="photo-frame no-photo"><div class="no-photo-mark">XLRI</div><div class="photo-caption"><strong>${esc(p.name)}</strong><small>${p.type==='dean'?'Associate Dean':'Photo to be added later'}</small></div></div>`;
  return `<div class="photo-frame has-photo"><img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="eager" onerror="this.onerror=null;this.remove();this.closest('.photo-frame').classList.remove('has-photo');this.closest('.photo-frame').classList.add('no-photo')"><div class="photo-caption"><strong>${esc(p.name)}</strong><small>${p.type==='dean'?'Associate Dean · XLRI Jamshedpur':'PGDM-BM • Batch of 2026'}</small></div></div>`;
}
function commonPage(inner, cls='') {
  return `<div class="page-full ${cls}">${inner}</div>`;
}
function coverPage() {
  return commonPage(`<div class="inside-cover"><div class="inside-kicker">WELCOME TO THE YEARBOOK</div><div class="inside-logo">XLRI</div><h2>Our people.<br><em>Our stories.</em></h2><p>Turn the page and meet the people who made BM 24–26 what it was.</p><div class="cover-rule"></div><small>Page 1</small></div>`, 'cover-inside');
}
function adNotePage() {
  return commonPage(`<div class="ad-note-page"><div class="dean-badge">Associate Dean · XLRI Jamshedpur</div><div class="big-quote">“</div><h2>A note before<br><em>the memories begin.</em></h2><p>Before we turn to the faces, stories and messages of BM 24–26, here is a note from the person who watched this batch grow not just as a cohort, but as a community.</p><div class="signature-line">Prof. Giridhar Ramachandran</div><div class="role-line">Associate Dean · XLRI Jamshedpur</div></div>`, 'ad-note-page-wrap');
}
function deanPage(p) {
  return `<div class="profile-spread dean-spread"><div class="profile-photo">${photoMarkup(p)}</div><div class="profile-note"><div class="note-kicker">A message for BM 24–26</div><h2>Prof. Giridhar<br><em>Ramachandran</em></h2><div class="note-scroll" data-note>${paragraphs(p.note.replace(/— Prof\. Giri\s*$/,'').trim())}</div><div class="note-sign">— Prof. Giri</div></div></div>`;
}
function personPage(p) {
  const note = p.hasNote ? paragraphs(p.note) : `<p class="no-note">No message was submitted for this page.</p>`;
  return `<div class="profile-spread student-spread"><div class="profile-photo">${photoMarkup(p)}</div><div class="profile-note"><div class="note-kicker">A little something about</div><h2>${esc(p.name)}</h2><div class="note-scroll" data-note>${note}</div><div class="note-sign">— From someone who knows you 🤍</div></div></div>`;
}
function wallPage() {
  return commonPage(`<div class="wall-page"><div class="wall-head"><div><div class="note-kicker">BM 24–26</div><h2>Our People</h2><p>Every face has a story. Click a name or photograph to open their page.</p></div><div class="wall-tools"><div class="wall-search"><span>⌕</span><input id="wallSearch" type="search" placeholder="Search names…" autocomplete="off"></div><button class="upload-btn" id="uploadBtn">＋ Add batch photos</button><input id="photoUpload" type="file" accept="image/*" multiple hidden></div></div><div id="peopleWall" class="people-wall"></div><div class="gallery-divider"><span>Batch Memories</span><em>Photos to be uploaded later</em></div><div id="uploadedGallery" class="uploaded-gallery"><div class="gallery-placeholder">Upload group photographs here for a preview.<small>On GitHub Pages, uploaded photos are previewed in the browser; to make them permanent, add the final images to the repository’s <strong>images</strong> folder later.</small></div></div></div>`, 'wall-wrap');
}
function renderWall(filter='') {
  const wall=document.getElementById('peopleWall');
  if(!wall) return;
  const q=filter.trim().toLowerCase();
  const matches=students.map((p,i)=>({p,i})).filter(x=>!q || x.p.name.toLowerCase().includes(q));
  wall.innerHTML=matches.map(({p,i})=>`<button class="person-tile" data-person-index="${i}" aria-label="Open ${esc(p.name)}"><div class="tile-photo">${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy">` : `<span>XLRI</span>`}</div><strong>${esc(p.name)}</strong></button>`).join('') || `<div class="wall-empty">No name matched “${esc(filter)}”.</div>`;
  wall.querySelectorAll('[data-person-index]').forEach(btn=>btn.addEventListener('click',()=>{
    const idx=4 + Number(btn.dataset.personIndex); closeOverlays(); goTo(idx, true);
  }));
}
function renderUploaded(files) {
  const g=document.getElementById('uploadedGallery'); if(!g) return;
  if(!files.length){ g.innerHTML='<div class="gallery-placeholder">Upload group photographs here for a preview.<small>Pictures can be added later.</small></div>'; return; }
  g.innerHTML='';
  Array.from(files).forEach(file=>{
    if(!file.type.startsWith('image/')) return;
    const url=URL.createObjectURL(file);
    const card=document.createElement('div'); card.className='uploaded-card';
    card.innerHTML=`<img src="${url}" alt="Uploaded batch memory"><span>${esc(file.name)}</span>`;
    g.appendChild(card);
  });
}
function renderPage() {
  const page=pages[current];
  if(page.type==='cover') sheetContent.innerHTML=coverPage();
  else if(page.type==='ad-note') sheetContent.innerHTML=adNotePage();
  else if(page.type==='dean') sheetContent.innerHTML=deanPage(page.person);
  else if(page.type==='wall') sheetContent.innerHTML=wallPage();
  else sheetContent.innerHTML=personPage(page.person);
  sheetContent.insertAdjacentHTML('beforeend', `<div class="printed-page-no">${current+1}</div>`);
  counter.textContent=`${current+1} / ${pages.length}`;
  document.getElementById('prevBtn').disabled=current===0;
  document.getElementById('nextBtn').disabled=current===pages.length-1;
  document.getElementById('prevBtn').style.opacity=current===0?.4:1;
  document.getElementById('nextBtn').style.opacity=current===pages.length-1?.4:1;
  if(page.type==='wall'){
    renderWall();
    document.getElementById('wallSearch').addEventListener('input',e=>renderWall(e.target.value));
    document.getElementById('uploadBtn').addEventListener('click',()=>document.getElementById('photoUpload').click());
    document.getElementById('photoUpload').addEventListener('change',e=>renderUploaded(e.target.files));
  }
  requestAnimationFrame(checkNoteOverflow);
}
function checkNoteOverflow(){
  document.querySelectorAll('[data-note]').forEach(n=>{
    if(n.scrollHeight > n.clientHeight + 4) n.classList.add('is-scrollable');
  });
}
function openBook(index=0){
  current=Math.max(0,Math.min(pages.length-1,index));
  renderPage();
  cover.classList.remove('active'); book.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'}); sheet.focus({preventScroll:true});
}
function goTo(index, instant=false){
  if(index<0 || index>=pages.length) return;
  if(instant){ current=index; renderPage(); return; }
  go(index>current?1:-1);
}
function go(delta){
  if(busy || current+delta<0 || current+delta>=pages.length) return;
  busy=true;
  const old=sheetContent.innerHTML;
  turnOverlay.innerHTML=old;
  turnOverlay.className='turn-overlay '+(delta>0?'turn-next':'turn-prev');
  current+=delta;
  renderPage();
  setTimeout(()=>{turnOverlay.className='turn-overlay';turnOverlay.innerHTML='';busy=false;},720);
}
function closeOverlays(){ indexScreen.classList.remove('active'); }
function buildIndex(filter=''){
  const q=filter.trim().toLowerCase(); const grid=document.getElementById('indexGrid');
  const entries=students.map((p,i)=>({p,i})).filter(x=>!q||x.p.name.toLowerCase().includes(q));
  grid.innerHTML=entries.map(({p,i})=>`<button class="index-item" data-student="${i}"><span class="index-no">${String(i+1).padStart(2,'0')}</span><span class="index-name">${esc(p.name)}</span></button>`).join('') || '<p class="no-match">No match found.</p>';
  grid.querySelectorAll('[data-student]').forEach(b=>b.addEventListener('click',()=>{closeOverlays();goTo(4+Number(b.dataset.student),true);}));
}
document.getElementById('openBtn').addEventListener('click',()=>openBook(1));
document.getElementById('homeBtn').addEventListener('click',()=>{book.classList.remove('active');cover.classList.add('active');});
document.getElementById('indexBtn').addEventListener('click',()=>{buildIndex();indexScreen.classList.add('active');});
document.getElementById('closeIndex').addEventListener('click',closeOverlays);
document.getElementById('memoryBtn').addEventListener('click',()=>goTo(3,true));
document.getElementById('prevBtn').addEventListener('click',()=>go(-1));
document.getElementById('nextBtn').addEventListener('click',()=>go(1));
document.addEventListener('keydown',e=>{
  if(indexScreen.classList.contains('active')){ if(e.key==='Escape') closeOverlays(); return; }
  if(!book.classList.contains('active')) return;
  if(e.key==='ArrowRight') go(1); if(e.key==='ArrowLeft') go(-1); if(e.key==='Escape') goTo(0,true);
});
let touchX=0;
sheet.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX},{passive:true});
sheet.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>45)go(dx<0?1:-1)},{passive:true});
renderPage();
