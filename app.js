const AUTH_KEY='wren_user_v1';
function getUser(){ try{return JSON.parse(localStorage.getItem(AUTH_KEY));}catch(_){return null;} }
function saveUser(u){ try{localStorage.setItem(AUTH_KEY,JSON.stringify(u));}catch(_){} }

const THEME_KEY='wren_theme_v1';
function setTheme(mode){
  document.documentElement.setAttribute('data-theme',mode);
  try{localStorage.setItem(THEME_KEY,mode);}catch(_){}
  document.getElementById('theme-light').classList.toggle('selected',mode==='light');
  document.getElementById('theme-dark').classList.toggle('selected',mode==='dark');
}
(function(){
  let saved='light';
  try{ saved=localStorage.getItem(THEME_KEY)||'light'; }catch(_){}
  setTheme(saved);
})();

function openSettings(){
  document.getElementById('settings-overlay').classList.add('open');
  document.getElementById('settings-panel').classList.add('open');
}
function closeSettings(){
  document.getElementById('settings-overlay').classList.remove('open');
  document.getElementById('settings-panel').classList.remove('open');
}
const SETTINGS_KEY='wren_settings_v1';
function saveSettings(){
  const s={ tts:document.getElementById('setting-tts').checked, history:document.getElementById('setting-history').checked };
  try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(s));}catch(_){}
}
(function(){
  try{
    const s=JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if(s){ document.getElementById('setting-tts').checked=s.tts!==false; document.getElementById('setting-history').checked=s.history!==false; }
  }catch(_){}
})();

function showPage(name){
  const current=document.querySelector('.page.active');
  const next=document.getElementById('page-'+name);
  if(!next||next===current)return;
  if(current){ current.classList.remove('page-visible'); setTimeout(()=>current.classList.remove('active'),320); }
  setTimeout(()=>{ next.classList.add('active'); requestAnimationFrame(()=>requestAnimationFrame(()=>next.classList.add('page-visible'))); }, current?180:0);
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  const nl=document.getElementById('nav-'+name); if(nl)nl.classList.add('active');
  window.scrollTo(0,0);
  if(name==='home'){ initHomeGlobe(); initScrollArrow(); }
  if(name==='app') initAppGlobe();
}

function toggleDrawer(){
  document.getElementById('nav-hamburger').classList.toggle('open');
  document.getElementById('nav-drawer').classList.toggle('open');
  document.body.style.overflow = document.getElementById('nav-drawer').classList.contains('open')?'hidden':'';
}
function closeDrawer(){
  document.getElementById('nav-hamburger').classList.remove('open');
  document.getElementById('nav-drawer').classList.remove('open');
  document.body.style.overflow='';
}

function initScrollArrow(){
  const arrow=document.querySelector('.home-hero-scroll');
  if(!arrow)return;
  arrow.classList.remove('hidden');
  const hide=()=>{arrow.classList.add('hidden');window.removeEventListener('scroll',hide);};
  window.addEventListener('scroll',hide,{passive:true,once:true});
}
initScrollArrow();

function goToApp(){
  closeDrawer();
  showPage('app');
  const u=getUser();
  if(u) activateWren(u.name);
}

function scrollToAbout(){
  closeDrawer(); showPage('home');
  setTimeout(()=>document.getElementById('about-section').scrollIntoView({behavior:'smooth'}),300);
}

function startFromGate(){
  const v=document.getElementById('gate-name-input').value.trim()||'Explorer';
  saveUser({name:v,joined:Date.now()});
  updateNavUser(v);
  showPage('app');
  activateWren(v);
}
document.getElementById('gate-name-btn').addEventListener('click',startFromGate);
document.getElementById('gate-name-input').addEventListener('keydown',e=>{if(e.key==='Enter')startFromGate();});

function updateNavUser(name){
  const ini=name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  document.getElementById('nav-avatar-el').textContent=ini;
  document.getElementById('nav-user-name-el').textContent=name;
  document.getElementById('dropdown-user-label').textContent=name;
  // Show the profile wrap (avatar + dropdown), hide the fallback gear
  document.getElementById('nav-profile-wrap').style.display='inline-flex';
  document.getElementById('nav-settings-fallback').style.display='none';
}
(function(){ const u=getUser(); if(u) updateNavUser(u.name); })();

/* ════ PROFILE DROPDOWN ════ */
function toggleProfileDropdown(){
  const dd=document.getElementById('nav-profile-dropdown');
  dd.classList.toggle('open');
}
function closeProfileDropdown(){
  document.getElementById('nav-profile-dropdown').classList.remove('open');
}
// Close dropdown when clicking anywhere outside it
document.addEventListener('click',function(e){
  const wrap=document.getElementById('nav-profile-wrap');
  if(wrap && !wrap.contains(e.target)){
    closeProfileDropdown();
  }
});
function clearUserAndSignOut(){
  try{localStorage.removeItem('wren_user_v1');}catch(_){}
  document.getElementById('nav-profile-wrap').style.display='none';
  document.getElementById('nav-settings-fallback').style.display='flex';
  document.getElementById('nav-avatar-el').textContent='?';
  document.getElementById('nav-user-name-el').textContent='';
  showPage('home');
}

/* ════════════════════════════════
   NAV SCROLL COLLAPSE
   On scroll down past a small threshold, the "WREN" wordmark
   next to the logo fades + slides away, leaving just the icon.
   Scrolling back near the top brings it back smoothly.
   ════════════════════════════════ */
function initNavCollapse(){
  const wordEl = document.getElementById('nav-logo-word');
  if(!wordEl) return;
  const THRESHOLD = 40; // px scrolled before the word starts collapsing

  function update(){
    if(window.scrollY > THRESHOLD) wordEl.classList.add('collapsed');
    else wordEl.classList.remove('collapsed');
  }
  window.addEventListener('scroll', update, {passive:true});
  update();
}
initNavCollapse();

let userName='', isThinking=false, recognition=null, isListening=false;
let chipsHidden=false, currentTTS=null;
const hasSR=!!(window.SpeechRecognition||window.webkitSpeechRecognition);
const hasTTS=!!window.speechSynthesis;
const isChromeLike=/Chrome|Edg/.test(navigator.userAgent)&&!/Firefox/.test(navigator.userAgent);

function activateWren(name){
  userName=name||'Explorer';
  if(!isChromeLike) document.getElementById('browser-notice').style.display='block';
  if(window._stopTypewriter) window._stopTypewriter();
  document.getElementById('hero-eyebrow').textContent='Where should we start,';
  document.getElementById('typed-text').textContent=userName+'?';
  document.getElementById('hero-name').setAttribute('data-text',userName+'?');
  document.getElementById('hero-tagline').textContent='Ask me anything across the universe of human knowledge.';
  const hs=document.getElementById('hero-section');
  hs.querySelectorAll('*').forEach(el=>{el.style.animation='none';el.offsetHeight;el.style.animation='';});
  document.getElementById('search-input').focus();
  renderHistory();
  initVoice();
}

function ensureActivated(){
  if(!userName){
    const u=getUser();
    activateWren(u?u.name:'Explorer');
  }
}
document.getElementById('nav-app') && document.getElementById('nav-app').addEventListener('click', ensureActivated);

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function initials(){return userName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';}
function scrollBottom(){const m=document.getElementById('messages');m.scrollTop=m.scrollHeight;}
function extractSpeakableText(bubbleEl){
  const clone=bubbleEl.cloneNode(true);
  clone.querySelectorAll('.src-tag,.stop-btn,.copy-btn,.dis-title,.dis-link').forEach(el=>el.remove());
  let text=(clone.innerText||clone.textContent||'').trim();
  text=text.replace(/https?:\/\/\S+/g,'').replace(/Wikipedia\s*·[^\n]*/g,'').replace(/\s{2,}/g,' ').trim();
  return text;
}

function addMsg(role,html,doSpeak=true){
  const msgs=document.getElementById('messages');
  const div=document.createElement('div');
  div.className=`msg ${role}`;
  if(role==='assistant'){
    div.innerHTML=`<div class="avatar wren">W</div><div class="bubble wren-bubble">${html}<button class="stop-btn" onclick="stopTTS(this)">■ Stop</button><button class="copy-btn" onclick="copyBubble(this)">Copy</button></div>`;
  } else {
    div.innerHTML=`<div class="avatar user-av">${esc(initials())}</div><div class="bubble user-bubble">${esc(html)}</div>`;
  }
  msgs.appendChild(div); scrollBottom();
  const ttsEnabled=document.getElementById('setting-tts')?document.getElementById('setting-tts').checked:true;
  if(role==='assistant'&&doSpeak&&hasTTS&&ttsEnabled){
    const bubble=div.querySelector('.bubble');
    speakText(extractSpeakableText(bubble),bubble);
  }
}
function showTyping(){
  const msgs=document.getElementById('messages');
  const div=document.createElement('div');
  div.className='msg assistant';div.id='typing-ind';
  div.innerHTML=`<div class="avatar wren">W</div><div class="bubble wren-bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(div);scrollBottom();
}
function hideTyping(){const t=document.getElementById('typing-ind');if(t)t.remove();}
function setThinking(v){isThinking=v;}
function setHeroSearching(v){document.getElementById('hero-name').classList.toggle('searching',v);}

function speakText(text,bubbleEl){
  if(!hasTTS||!text)return;
  window.speechSynthesis.cancel();
  const utt=new SpeechSynthesisUtterance(text);
  utt.rate=0.95;utt.pitch=1.0;currentTTS=utt;
  function assignVoice(){
    const voices=window.speechSynthesis.getVoices();
    const pick=voices.find(v=>v.name.includes('Google UK English Female'))||voices.find(v=>v.lang==='en-GB')||voices.find(v=>v.lang.startsWith('en'));
    if(pick)utt.voice=pick;
  }
  assignVoice();
  if(bubbleEl){
    utt.onstart=()=>bubbleEl.classList.add('reading');
    utt.onend=()=>{bubbleEl.classList.remove('reading');currentTTS=null;};
    utt.onerror=()=>{bubbleEl.classList.remove('reading');currentTTS=null;};
  }
  if(window.speechSynthesis.getVoices().length){window.speechSynthesis.speak(utt);}
  else{window.speechSynthesis.onvoiceschanged=()=>{assignVoice();window.speechSynthesis.speak(utt);};}
}
function stopTTS(){window.speechSynthesis.cancel();document.querySelectorAll('.bubble.reading').forEach(b=>b.classList.remove('reading'));}

function initVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const micBtn=document.getElementById('mic-btn');
  if(!SR){micBtn.classList.add('unsupported');return;}
  if(recognition)return;
  recognition=new SR();recognition.continuous=false;recognition.interimResults=true;recognition.lang='en-US';
  recognition.onstart=()=>{
    isListening=true;micBtn.classList.add('listening');
    document.getElementById('mic-icon-svg').innerHTML=`<rect x="6" y="6" width="12" height="12" rx="2"/>`;
    document.getElementById('voice-status').classList.add('active');
    document.getElementById('voice-status-text').textContent='Listening…';
    document.getElementById('search-input').placeholder='Speak now…';
    if(hasTTS)window.speechSynthesis.cancel();
  };
  recognition.onresult=e=>{
    let interim='',final='';
    for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)final+=e.results[i][0].transcript;else interim+=e.results[i][0].transcript;}
    document.getElementById('search-input').value=final||interim;
    document.getElementById('voice-status-text').textContent=interim?`"${interim}"…`:'Processing…';
  };
  recognition.onend=()=>{
    isListening=false;micBtn.classList.remove('listening');
    document.getElementById('mic-icon-svg').innerHTML=`<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="9" y1="22" x2="15" y2="22"/>`;
    document.getElementById('voice-status').classList.remove('active');
    document.getElementById('search-input').placeholder='Search for anything on Wikipedia…';
    const v=document.getElementById('search-input').value.trim();
    if(v){doSearch(v);document.getElementById('search-input').value='';}
  };
  recognition.onerror=()=>{
    isListening=false;micBtn.classList.remove('listening');
    document.getElementById('mic-icon-svg').innerHTML=`<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="9" y1="22" x2="15" y2="22"/>`;
    document.getElementById('voice-status').classList.remove('active');
    document.getElementById('search-input').placeholder='Search for anything on Wikipedia…';
  };
  micBtn.addEventListener('click',()=>{if(isListening)recognition.stop();else{try{recognition.start();}catch(_){}}});
}

const WIKI='https://en.wikipedia.org/w/api.php';
async function wikiFetch(params){
  const qs=new URLSearchParams({...params,format:'json',origin:'*'}).toString();
  const directURL=`${WIKI}?${qs}`;
  const proxies=[url=>`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,url=>`https://corsproxy.io/?${encodeURIComponent(url)}`];
  try{const res=await fetch(directURL,{mode:'cors'});if(res.ok)return await res.json();}catch(_){}
  for(const makeProxy of proxies){
    try{
      const res=await fetch(makeProxy(directURL));if(!res.ok)continue;
      const wrapper=await res.json();
      const raw=wrapper.contents!==undefined?wrapper.contents:JSON.stringify(wrapper);
      return JSON.parse(raw);
    }catch(_){}
  }
  throw new Error('All fetch attempts failed');
}
async function wikiSummary(title){
  const data=await wikiFetch({action:'query',prop:'extracts',exintro:true,explaintext:true,exsentences:5,redirects:1,titles:title});
  const page=Object.values(data.query.pages)[0];
  if(!page||page.missing===''||!page.extract||page.extract.trim()==='')throw new Error('no page');
  return{title:page.title,extract:page.extract};
}
async function wikiSearch(query){
  const data=await wikiFetch({action:'query',list:'search',srsearch:query,srlimit:5});
  return data.query?.search||[];
}
function stripHtml(s){return s.replace(/<[^>]+>/g,'').replace(/&[a-z#0-9]+;/g,' ').trim();}
function renderSingle(title,extract){
  const wikiUrl=`https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g,'_'))}`;
  return `<span class="wiki-title">${esc(title)}</span>${esc(extract.replace(/\n+/g,' ').trim())}<span class="src-tag">Wikipedia · <a class="dis-link" href="${wikiUrl}" target="_blank" rel="noopener">Read full article →</a></span>`;
}
function renderMultiple(results){
  let html=`<span class="wiki-title">Related topics found</span><div class="dis-card"><div class="dis-title">Wikipedia Articles</div>`;
  results.forEach(r=>{
    const wikiUrl=`https://en.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g,'_'))}`;
    html+=`<div class="dis-item"><strong>${esc(r.title)}</strong> — ${esc((r.extract||stripHtml(r.snippet||'')).slice(0,160))}… <br><a class="dis-link" href="${wikiUrl}" target="_blank" rel="noopener">Read more →</a></div>`;
  });
  return html+`</div><span class="src-tag">${results.length} articles matched</span>`;
}

async function doSearch(query){
  query=query.trim();if(!query||isThinking)return;
  ensureActivated();
  if(!chipsHidden){chipsHidden=true;document.getElementById('suggestions').classList.add('hidden');}
  setThinking(true);setHeroSearching(true);
  document.getElementById('send-btn').disabled=true;
  document.getElementById('search-input').disabled=true;
  addMsg('user',query,false);showTyping();
  const historyEnabled=document.getElementById('setting-history')?document.getElementById('setting-history').checked:true;
  if(historyEnabled) addToHistory(query);
  try{
    let matched=false;
    try{const r=await wikiSummary(query);hideTyping();addMsg('assistant',renderSingle(r.title,r.extract));matched=true;}catch(_){}
    if(!matched){
      const hits=await wikiSearch(query);
      if(!hits.length){hideTyping();addMsg('assistant',`<span class="err-msg">No results found for "${esc(query)}".</span>`);}
      else{
        const enriched=await Promise.all(hits.slice(0,3).map(async h=>{try{const s=await wikiSummary(h.title);return{title:s.title,extract:s.extract,snippet:h.snippet};}catch(_){return{title:h.title,extract:'',snippet:h.snippet};}}));
        hideTyping();
        if(enriched[0].title.toLowerCase()===query.toLowerCase()&&enriched[0].extract)addMsg('assistant',renderSingle(enriched[0].title,enriched[0].extract));
        else addMsg('assistant',renderMultiple(enriched));
      }
    }
  }catch(err){
    hideTyping();
    addMsg('assistant',`<span class="err-msg">Could not reach Wikipedia. Check your connection.</span>`);
    console.error(err);
  }
  setThinking(false);setHeroSearching(false);
  document.getElementById('send-btn').disabled=false;
  document.getElementById('search-input').disabled=false;
  document.getElementById('search-input').focus();
}
function sendChip(el){doSearch(el.textContent.trim());}
document.getElementById('send-btn').addEventListener('click',()=>{const v=document.getElementById('search-input').value.trim();if(v){doSearch(v);document.getElementById('search-input').value='';}});
document.getElementById('search-input').addEventListener('keydown',e=>{if(e.key==='Enter'){const v=e.target.value.trim();if(v){doSearch(v);e.target.value='';}}});

const HISTORY_KEY='wren_history_v1';
function loadHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY))||[];}catch(_){return[];}}
function saveHistory(arr){try{localStorage.setItem(HISTORY_KEY,JSON.stringify(arr));}catch(_){}}
function addToHistory(q){let h=loadHistory();h=h.filter(x=>x.q.toLowerCase()!==q.toLowerCase());h.unshift({q,t:Date.now()});h=h.slice(0,10);saveHistory(h);renderHistory();}
function removeFromHistory(i){const h=loadHistory();h.splice(i,1);saveHistory(h);renderHistory();}
function clearHistory(){saveHistory([]);renderHistory();}
function toggleHistory(){document.getElementById('history-panel').classList.toggle('show');}
function timeAgo(ts){const s=Math.floor((Date.now()-ts)/1000);if(s<60)return'just now';if(s<3600)return Math.floor(s/60)+'m ago';if(s<86400)return Math.floor(s/3600)+'h ago';return Math.floor(s/86400)+'d ago';}
function renderHistory(){
  const h=loadHistory();const list=document.getElementById('history-list');const btn=document.getElementById('history-toggle');const panel=document.getElementById('history-panel');
  if(!list)return;
  if(btn)btn.style.display=h.length?'flex':'none';
  if(!h.length){panel.classList.remove('show');list.innerHTML='';return;}
  list.innerHTML=h.map((item,i)=>`<div class="history-item" onclick="historySearch(${i})"><span class="history-icon">↺</span><span class="history-text">${esc(item.q)}</span><span class="history-time">${timeAgo(item.t)}</span><button class="history-delete" onclick="event.stopPropagation();removeFromHistory(${i})">✕</button></div>`).join('');
}
function historySearch(i){const h=loadHistory();if(h[i]){toggleHistory();doSearch(h[i].q);}}

function copyBubble(btn){
  const bubble=btn.closest('.bubble');const clone=bubble.cloneNode(true);
  clone.querySelectorAll('.stop-btn,.copy-btn,.src-tag').forEach(el=>el.remove());
  const text=(clone.innerText||clone.textContent).trim();
  navigator.clipboard.writeText(text).then(()=>{btn.textContent='✓ Copied';btn.classList.add('copied');btn.style.opacity='1';setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');btn.style.opacity='';},2000);}).catch(()=>{
    const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
    btn.textContent='✓ Copied';btn.classList.add('copied');setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},2000);
  });
}

(function(){
  const QUOTES=["Knowledge is the compass of civilization.","Every search is a step into the infinite.","The curious mind never stops exploring."];
  const textEl=document.getElementById('typed-text');const cursor=document.getElementById('typed-cursor');
  const TYPE_SPEED=52,ERASE_SPEED=28,PAUSE_AFTER=2600,PAUSE_BEFORE=420;
  let quoteIndex=0,charIndex=0,isErasing=false,timer=null,stopped=false;
  function tick(){
    if(stopped)return;
    const current=QUOTES[quoteIndex];
    if(!isErasing){
      charIndex++;textEl.textContent=current.slice(0,charIndex);cursor.classList.add('paused');
      if(charIndex===current.length){cursor.classList.remove('paused');timer=setTimeout(()=>{isErasing=true;tick();},PAUSE_AFTER);}
      else{timer=setTimeout(tick,TYPE_SPEED+Math.random()*22-11);}
    } else {
      charIndex--;textEl.textContent=current.slice(0,charIndex);cursor.classList.add('paused');
      if(charIndex===0){isErasing=false;quoteIndex=(quoteIndex+1)%QUOTES.length;cursor.classList.remove('paused');timer=setTimeout(tick,PAUSE_BEFORE);}
      else{timer=setTimeout(tick,ERASE_SPEED);}
    }
  }
  timer=setTimeout(tick,900);
  window._stopTypewriter=function(){stopped=true;clearTimeout(timer);cursor.style.display='none';textEl.textContent='';};
})();

const revealObserver=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>{
  el.style.opacity='0';
  el.style.transform='translateY(40px)';
  el.style.transition='opacity .85s cubic-bezier(.16,1,.3,1),transform .85s cubic-bezier(.16,1,.3,1)';
  revealObserver.observe(el);
});
const revealStyle=document.createElement('style');
revealStyle.textContent='.reveal.visible{opacity:1!important;transform:translateY(0)!important;}';
document.head.appendChild(revealStyle);

function animateCountUp(el){
  const target=parseInt(el.dataset.target);const suffix=el.dataset.suffix||'';
  const duration=1800,step=16,steps=duration/step,inc=target/steps;let current=0;
  const timer=setInterval(()=>{current+=inc;if(current>=target){current=target;clearInterval(timer);}el.textContent=Math.floor(current)+suffix;},step);
}
const countObserver=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){const num=e.target.querySelector('.stat-num[data-target]');if(num&&!num.dataset.counted){num.dataset.counted='1';animateCountUp(num);}}});
},{threshold:0.5});
document.querySelectorAll('.stat-item').forEach(el=>countObserver.observe(el));

const MOCK_TEXT="The Silk Road was an ancient network of trade routes that connected the East and West, stretching from China through Central Asia to the Mediterranean. It was central to cultural, commercial and technological exchange between the Han dynasty, Parthian Empire and Roman Empire.";
let mockStarted=false;
const mockObserver=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting&&!mockStarted){
      mockStarted=true;let i=0;
      const el=document.getElementById('how-mock-text');if(!el)return;
      const t=setInterval(()=>{i++;el.textContent=MOCK_TEXT.slice(0,i);if(i>=MOCK_TEXT.length){clearInterval(t);const c=document.getElementById('how-mock-cursor');if(c)c.style.display='none';}},18);
    }
  });
},{threshold:0.4});
const howVisual=document.getElementById('how-visual-answer');
if(howVisual)mockObserver.observe(howVisual);

requestAnimationFrame(()=>requestAnimationFrame(()=>{
  const active=document.querySelector('.page.active');
  if(active)active.classList.add('page-visible');
}));

document.addEventListener('keydown',e=>{if(e.code==='Space'&&document.activeElement!==document.getElementById('search-input')&&!isThinking&&recognition){e.preventDefault();if(isListening)recognition.stop();else{try{recognition.start();}catch(_){}}}});