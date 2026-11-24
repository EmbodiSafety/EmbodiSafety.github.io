'use strict';
history.scrollRestoration='manual';
if(location.hash)history.replaceState(null,'',location.pathname+location.search);
window.scrollTo({top:0,left:0,behavior:'instant'});
window.addEventListener('pageshow',()=>window.scrollTo({top:0,left:0,behavior:'instant'}),{once:true});
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const heroVideos=[...document.querySelectorAll('#heroMosaic video')];
const visibleHeroVideos=new Set();
let heroPaused=reducedMotion.matches;
function updateHero(){
  for(const video of heroVideos){
    if(heroPaused||document.hidden||!visibleHeroVideos.has(video)){
      video.pause();
    }else if(video.paused){
      ensureSource(video);
      video.play().catch(error=>{
        if(error.name!=='AbortError'&&error.name!=='NotAllowedError')throw error;
      });
    }
  }
}
const heroObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){
    if(entry.isIntersecting)visibleHeroVideos.add(entry.target);
    else visibleHeroVideos.delete(entry.target);
  }
  updateHero();
},{threshold:.2});
heroVideos.forEach(video=>heroObserver.observe(video));
updateHero();

const demoCards=[...document.querySelectorAll('.demo-card')];
const demoVideos=demoCards.map(card=>card.querySelector('video'));
const visibleVideos=new Set();
const galleryMotion=document.querySelector('#galleryMotion');
let galleryPaused=reducedMotion.matches;
const userPausedVideos=new Set(),userPlayingVideos=new Set();
const programPauses=new WeakSet(),programPlays=new WeakSet();
function ensureSource(video){if(!video.getAttribute('src')){video.src=video.dataset.src;video.load();}}
function pauseDemo(video){if(!video.paused){programPauses.add(video);video.pause();}}
function playDemo(video){
  if(!video.paused)return;
  programPlays.add(video);
  video.play().catch(error=>{if(error.name==='NotAllowedError'){programPlays.delete(video);return;}if(error.name==='AbortError')return;throw error;});
}
function updateGallery(){
  demoVideos.forEach(video=>{const show=visibleVideos.has(video)&&!video.closest('.demo-card').hidden;
    if(!show||document.hidden||document.querySelector('#demoDialog').open||userPausedVideos.has(video)||(galleryPaused&&!userPlayingVideos.has(video)))pauseDemo(video);else{ensureSource(video);playDemo(video);}
  });
  galleryMotion.textContent=galleryPaused?'Play videos':'Pause videos';galleryMotion.setAttribute('aria-pressed',String(galleryPaused));
}
const demoObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){visibleVideos.add(entry.target);ensureSource(entry.target);}else visibleVideos.delete(entry.target);});updateGallery();},{threshold:.2});
demoVideos.forEach(video=>{
  video.addEventListener('pause',()=>{if(!programPauses.delete(video)){userPausedVideos.add(video);userPlayingVideos.delete(video);}});
  video.addEventListener('play',()=>{if(!programPlays.delete(video)){userPausedVideos.delete(video);userPlayingVideos.add(video);}});
  demoObserver.observe(video);
});
galleryMotion.addEventListener('click',()=>{galleryPaused=!galleryPaused;userPlayingVideos.clear();if(!galleryPaused)userPausedVideos.clear();updateGallery();});
document.querySelectorAll('.demo-filter').forEach(button=>button.addEventListener('click',()=>{
  const environment=button.dataset.environment;let count=0;
  demoCards.forEach(card=>{const show=environment==='all'||card.dataset.environment===environment;card.hidden=!show;if(show)count++;else pauseDemo(card.querySelector('video'));});
  document.querySelector('#demoGallery').classList.toggle('filtered',environment!=='all');
  document.querySelector('#demoCount').textContent=`${count} ${count===1?'example':'examples'}`;
  document.querySelectorAll('.demo-filter').forEach(control=>{const selected=control===button;control.classList.toggle('active',selected);control.setAttribute('aria-pressed',String(selected));});
  updateGallery();
}));
reducedMotion.addEventListener('change',event=>{heroPaused=event.matches;galleryPaused=event.matches;userPlayingVideos.clear();updateHero();updateGallery();});
document.addEventListener('visibilitychange',()=>{updateHero();updateGallery();});
// Reveal each block once as it enters the viewport.
const revealElements=[...document.querySelectorAll('.section-heading,.native-panel,.overview-text,.demo-card,.dataset-facts,.track,.environment-mixture,.score-highlights,.score-chart,.table-scroll,.podium-card,.leaderboard-scroll')];
if(!reducedMotion.matches){
 const revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});},{threshold:.08,rootMargin:'0px 0px -24px 0px'});
 revealElements.forEach((el,index)=>{el.classList.add('reveal');el.style.setProperty('--reveal-delay',`${el.classList.contains('demo-card')?(index%4)*65:0}ms`);revealObserver.observe(el);});
 document.documentElement.classList.add('motion-ready');
}
const comingToast=document.createElement('div');comingToast.className='coming-toast';comingToast.setAttribute('role','status');document.body.append(comingToast);let toastTimer;
document.querySelectorAll('[data-coming]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();clearTimeout(toastTimer);comingToast.textContent=`${link.dataset.coming} is coming soon`;const box=link.getBoundingClientRect();comingToast.style.left=`${Math.max(12,Math.min(innerWidth-230,box.right-210))}px`;comingToast.style.top=`${Math.min(innerHeight-52,box.bottom+10)}px`;comingToast.classList.add('visible');toastTimer=setTimeout(()=>comingToast.classList.remove('visible'),2400);}));

const demoDialog=document.querySelector('#demoDialog');
const dialogVideo=demoDialog.querySelector('video');
const demoVideoStatus=document.querySelector('#demoVideoStatus');
const demoOriginalLink=document.querySelector('#demoOriginalLink');
const videoMessage=(en,zh)=>document.documentElement.lang==='zh-CN'?zh:en;
function showVideoError(){
 demoVideoStatus.textContent=videoMessage('Unable to load the HD video. Check your connection or open the video directly.','高清视频加载失败，请检查网络，或直接打开视频链接。');
}
dialogVideo.addEventListener('error',()=>{if(demoDialog.open&&dialogVideo.getAttribute('src'))showVideoError();});
dialogVideo.addEventListener('playing',()=>{demoVideoStatus.textContent='';});
document.querySelectorAll('.demo-open').forEach(button=>button.addEventListener('click',()=>{
 const card=button.closest('.demo-card'),preview=card.querySelector('video');
 dialogVideo.poster=preview.poster;
 dialogVideo.loop=true;
 dialogVideo.src=preview.dataset.fullSrc;
 demoOriginalLink.href=preview.dataset.fullSrc;
 demoOriginalLink.textContent=videoMessage('Open HD video','打开高清视频');
 demoVideoStatus.textContent=videoMessage('Loading HD video…','正在加载高清视频…');
 demoDialog.querySelector('h3').textContent=card.querySelector('h3').textContent;
 demoDialog.querySelector('.demo-dialog-copy > p:not(#demoVideoStatus)').textContent=card.querySelector('.demo-caption p').textContent;
 demoDialog.showModal();
 updateGallery();
 dialogVideo.play().catch(error=>{
  if(!demoDialog.open||error.name==='AbortError')return;
  if(error.name==='NotAllowedError')demoVideoStatus.textContent=videoMessage('Press play to start the HD video.','请点击播放按钮观看高清视频。');
  else showVideoError();
 });
}));
demoDialog.querySelector('.demo-dialog-close').addEventListener('click',()=>demoDialog.close());
demoDialog.addEventListener('click',event=>{if(event.target===demoDialog)demoDialog.close();});
demoDialog.addEventListener('close',()=>{dialogVideo.pause();dialogVideo.removeAttribute('src');dialogVideo.removeAttribute('poster');dialogVideo.load();demoVideoStatus.textContent='';demoOriginalLink.removeAttribute('href');updateGallery();});

// Each diagram explains its active step; pointer and keyboard take priority over autoplay.
const construction=document.querySelector('#construction');
const constructionMotion=document.querySelector('#constructionMotion');
let constructionPaused=reducedMotion.matches,constructionVisible=false;
const processContent={
 generation:[
  ['Scenario specification','GPT-5.6 combines the task, environment, robot, viewpoint and intended hazard.'],
  ['Script & video synthesis','Specify the order of events and what must be visible, then generate the sequence with Seedance2.5.'],
  ['Candidate sample','Pair selected frames with the instruction and draft the response mode, risk and next action.']
 ],
 selection:[
  ['Snapshot','A child is ahead of the robot carrying a steaming mug.'],
  ['Trajectory','Three ordered frames show the vials being taken and the tray left empty.'],
  ['Vials on tray','Medication is still on the counter beside the fridge and the open bag.'],
  ['Vials taken','The requester reaches into the tray and gathers the vials.'],
  ['Empty tray','The vials are gone and the requester gestures beside the fridge.']
 ],
 review:[
  ['Visual grounding','Reject candidates whose key objects or hazard are not visible.'],
  ['Temporal consistency','Check that the frames support the claimed order and outcome.'],
  ['Label support','Compare the independently predicted mode with the initial label.'],
  ['Action safety','Check that the next step is feasible in the observed situation.']
 ],
 verification:[
  ['Expert assessment','Five specialists review the annotations independently of the AI.'],
  ['AI assessment','Compare the model and expert judgements to identify cases for re-review.'],
  ['Retain','Keep a sample when its evidence supports the annotated decision.'],
  ['Revise','Correct an annotation when the evidence supports a different decision.'],
  ['Remove','Exclude samples with insufficient evidence for a reliable decision.']
 ]
};
const groupSpecs=[
 ['generation','.generation-panel','.process-step'],
 ['selection','.selection-panel','button.sample-track,.film-frame'],
 ['review','.ai-panel','.review-check'],
 ['verification','.human-panel','.independent-review button,.review-decisions button']
];
const processGroups=groupSpecs.map(([key,selector,itemSelector])=>{
 const panel=construction.querySelector(selector),items=[...panel.querySelectorAll(itemSelector)],dock=panel.querySelector('.process-detail');
 const group={key,panel,items,dock,index:0,elapsed:0,hovered:false,focused:false};
 items.forEach((item,index)=>{
  item.classList.add('process-interactive');item.dataset.tone=String(index%4);
  item.addEventListener('pointerenter',()=>{group.hovered=true;activateProcess(group,index);});
  item.addEventListener('pointerleave',()=>{group.hovered=false;group.elapsed=0;dock.style.removeProperty('--detail-shift');item.style.removeProperty('--pointer-x');item.style.removeProperty('--pointer-y');});
  item.addEventListener('pointermove',event=>{
   const rect=item.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
   item.style.setProperty('--pointer-x',`${x}px`);item.style.setProperty('--pointer-y',`${y}px`);
   dock.style.setProperty('--detail-shift',`${(x/rect.width-.5)*12}px`);
  });
  item.addEventListener('focus',()=>{group.focused=item.matches(':focus-visible');activateProcess(group,index);});
  item.addEventListener('blur',()=>{group.focused=false;group.elapsed=0;});
  item.addEventListener('click',()=>activateProcess(group,index));
 });
 panel.addEventListener('pointerleave',()=>dock.style.setProperty('--detail-shift','0px'));
 activateProcess(group,0);return group;
});
function activateProcess(group,index){
 group.index=index;group.elapsed=0;
 group.items.forEach((item,i)=>{
  const selected=i===index;
  item.classList.toggle('active',selected);
  item.setAttribute('aria-pressed',String(selected));
  item.closest('tr')?.classList.toggle('active',selected);
 });
 const [title,copy]=processContent[group.key][index],dock=group.dock;
 group.panel.dataset.activeStep=String(index);
 dock.dataset.tone=String(index%4);
 dock.querySelector('.detail-title').textContent=title;
 dock.querySelector('.detail-copy').textContent=copy;
 dock.style.setProperty('--process-progress','0');
 if(!reducedMotion.matches)dock.animate([{opacity:.35,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'ease-out'});
}
function updateConstructionMotion(){
 constructionMotion.setAttribute('aria-pressed',String(constructionPaused));
 constructionMotion.textContent=document.documentElement.lang==='zh-CN'?(constructionPaused?'播放动效':'暂停动效'):(constructionPaused?'Play motion':'Pause motion');
}
constructionMotion.addEventListener('click',()=>{constructionPaused=!constructionPaused;updateConstructionMotion();});
new IntersectionObserver(entries=>{constructionVisible=entries[0].isIntersecting;},{threshold:.03}).observe(construction);
let processLast=0;
function animateProcesses(time){
 const delta=Math.min(time-processLast,100);processLast=time;
 for(const group of processGroups){
  const manual=group.hovered||group.focused;
  if(!constructionVisible||document.hidden||constructionPaused||manual)continue;
  group.elapsed+=delta;
  if(group.elapsed>=7200)activateProcess(group,(group.index+1)%group.items.length);
  group.dock.style.setProperty('--process-progress',String(group.elapsed/7200));
 }
 requestAnimationFrame(animateProcesses);
}
requestAnimationFrame(animateProcesses);
reducedMotion.addEventListener('change',event=>{constructionPaused=event.matches;updateConstructionMotion();});
updateConstructionMotion();

// Sort the two reported tracks independently; never synthesize a combined score.
const scoreTable=document.querySelector('.leaderboard');
document.querySelectorAll('.score-sort').forEach(button=>button.addEventListener('click',()=>{
  const column=Number(button.dataset.column),header=button.closest('th');
  const ascending=header.getAttribute('aria-sort')==='descending';
  scoreTable.querySelectorAll('thead th[aria-sort]').forEach(th=>th.setAttribute('aria-sort','none'));
  header.setAttribute('aria-sort',ascending?'ascending':'descending');
  const rows=[...scoreTable.tBodies[0].rows];
  rows.sort((a,b)=>(Number(a.cells[column].dataset.score)-Number(b.cells[column].dataset.score))*(ascending?1:-1));
  scoreTable.tBodies[0].append(...rows);
}));

const copyCitation=document.querySelector('#copyCitation');
copyCitation.addEventListener('click',async()=>{
  const code=document.querySelector('#citationBibtex');
  const status=document.querySelector('#citationStatus');
  const chinese=document.documentElement.lang==='zh-CN';
  try{
    await navigator.clipboard.writeText(code.textContent);
    status.textContent=chinese?'已复制 BibTeX。':'BibTeX copied.';
  }catch{
    const selection=window.getSelection(),range=document.createRange();
    range.selectNodeContents(code);selection.removeAllRanges();selection.addRange(range);
    status.textContent=chinese?'引用已选中，请按 Ctrl+C 或 ⌘C 复制。':'Citation selected. Press Ctrl+C or ⌘C to copy.';
  }
});
