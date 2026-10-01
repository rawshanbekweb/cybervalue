'use strict';

const icons = {
  browser: '<rect x="3" y="4" width="26" height="23" rx="3"/><path d="M3 11h26M7 8h1m3 0h1M11 17l-4 3 4 3m10-6 4 3-4 3"/>',
  server: '<rect x="5" y="3" width="22" height="11" rx="2"/><rect x="5" y="18" width="22" height="11" rx="2"/><path d="M10 8h1m4 0h7M10 23h1m4 0h7"/>',
  globe: '<circle cx="16" cy="16" r="13"/><ellipse cx="16" cy="16" rx="6" ry="13"/><path d="M3 16h26M6 8h20M6 24h20"/>',
  database: '<ellipse cx="16" cy="7" rx="11" ry="4"/><path d="M5 7v18c0 5 22 5 22 0V7M5 16c0 5 22 5 22 0"/>',
  lock: '<rect x="6" y="14" width="20" height="15" rx="3"/><path d="M10 14V9a6 6 0 0112 0v5M16 20v4"/>',
  app: '<rect x="4" y="4" width="24" height="24" rx="5"/><path d="M12 11l-5 5 5 5m8-10 5 5-5 5m-3-12-2 16"/>',
  dns: '<circle cx="16" cy="7" r="4"/><rect x="2" y="23" width="8" height="6" rx="1"/><rect x="22" y="23" width="8" height="6" rx="1"/><path d="M16 11v7M6 23v-5h20v5"/>'
};
const icon = name => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.globe}</svg>`;
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const callout = (title, body, warning = false) => `<div class="callout${warning ? ' warning' : ''}"><strong>${title}</strong>${body}</div>`;
const table = (heads, rows) => `<table class="data-table"><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const panel = (label, body, right = 'LIVE DIAGRAM') => `<div class="panel dark-panel grid-bg"><div class="panel-label"><span>${label}</span><span>${right}</span></div>${body}</div>`;
const point = (n, title, text) => `<div class="numbered"><span>${n}</span><div><h3>${title}</h3><p>${text}</p></div></div>`;
const layout = (left, right) => `<div class="slide-layout"><div class="slide-copy">${left}</div><div>${right}</div></div>`;
const heading = (title, lead, hero = false) => `<h1${hero ? ' class="hero-title"' : ''}>${title}</h1><p class="lead">${lead}</p>`;
const stack = items => `<div class="stack">${items.map((item, i) => `${i ? `<div class="stack-arrow" style="--i:${i}"><span>↓</span></div>` : ''}<div class="stack-node reveal" style="--i:${i}">${icon(item[0])}<div><strong>${item[1]}</strong><small>${item[2]}</small></div></div>`).join('')}</div>`;

const glossary = [
  ['apt','Advanced Package Tool','Debian/Ubuntu paket menejeri.'],
  ['Bash','Bourne Again SHell','Linux dagi asosiy buyruq qobig\'i.'],
  ['chmod','Change Mode','Fayl yoki katalog ruxsatlarini o\'zgartirish.'],
  ['chown','Change Owner','Fayl yoki katalog egasini o\'zgartirish.'],
  ['CLI','Command Line Interface','Matnli buyruqlar interfeysi.'],
  ['Cron','Command Run On Notice','Vazifalarni vaqt bo\'yicha rejalashtirish.'],
  ['Daemon','Disk And Execution Monitor','Orqa fonda ishlaydigan xizmat.'],
  ['DNS','Domain Name System','Nomni IPga aylantiruvchi tizim.'],
  ['FHS','Filesystem Hierarchy Standard','Linux kataloglar tuzilishi standarti.'],
  ['grep','Global Regular Expression Print','Matn ichidan andoza bo\'yicha qidirish.'],
  ['GUI','Graphical User Interface','Grafik foydalanuvchi interfeysi.'],
  ['IP','Internet Protocol','Tarmoq manzillash tizimi.'],
  ['Kernel','Yadro','Operatsion tizimning apparat bilan ishlovchi asosiy qismi.'],
  ['MAC','Media Access Control','Tarmoq interfeysining fizik manzili.'],
  ['NAT','Network Address Translation','Tarmoq manzillari translyatsiyasi.'],
  ['PID','Process ID','Jarayonning noyob raqami.'],
  ['Port','Port','Tarmoqda xizmatni ajratuvchi mantiqiy nuqta.'],
  ['Root','Root','Tizimning mutlaq huquqli foydalanuvchisi yoki / katalogi.'],
  ['SSH','Secure Shell','Masofaviy xavfsiz ulanish.'],
  ['sudo','Superuser do','Buyruqni root huquqida bajarish.'],
  ['TCP','Transmission Control Protocol','Ulanishga asoslangan ishonchli protokol.'],
  ['UDP','User Datagram Protocol','Tez, lekin ishonchsizroq protokol.']
];

const linuxQuestions = [
  ['Terminal','Linux va GNU/Linux farqi nima?','Linux asosan yadrodir. GNU/Linux — bu to\'liq operatsion tizim (yadro + asbob-uskunalar).'],
  ['Terminal','Shell qanday vazifani bajaradi?','Foydalanuvchi buyruqlarini qabul qilib, ularni yadro tushunadigan ko\'rinishga o\'tkazadi va bajaradi.'],
  ['Terminal','Pipe (|) qanday ishlaydi?','Bir buyruqning chiqishini (stdout) keyingi buyruqning kirishiga (stdin) uzatadi. Misol: ls -la | grep "txt".'],
  ['Fayl tizimi','/etc va /var kataloglarining farqi nima?','/etc tizim konfiguratsiya fayllarini saqlaydi (o\'zgarmas). /var log, kesh va bazalar kabi o\'zgaruvchan ma\'lumotlarni saqlaydi.'],
  ['Fayl tizimi','chmod 755 fayl qanday ruxsatlar beradi?','Egasi uchun o\'qish, yozish, bajarish (rwx=7). Guruh va boshqalar uchun o\'qish va bajarish (r-x=5).'],
  ['Fayl tizimi','Yashirin fayllar Linux da qanday belgilanadi?','Fayl nomi nuqta (.) bilan boshlanadi. Ularni ls -a buyrug\'i bilan ko\'rish mumkin.'],
  ['Tizim','Jarayonlarni to\'xtatishning qanday farqlari bor?','kill 15 (SIGTERM) jarayonga to\'xtashni so\'raydi va tozalashga vaqt beradi. kill -9 (SIGKILL) majburan to\'xtatadi.'],
  ['Tizim','sudo va su farqi nima?','sudo orqali oddiy foydalanuvchi root nomidan bitta buyruq bajaradi. su esa butunlay boshqa foydalanuvchi seansiga o\'tishdir.'],
  ['Tarmoq','ip addr va ip route farqi nima?','ip addr interfeyslarning IP manzillarini ko\'rsatadi. ip route esa paketlar qaysi yo\'nalishda ketishini (routing jadvali) ko\'rsatadi.'],
  ['Tarmoq','Ping ishlayapti, lekin veb-sayt ochilmayapti. Sababi nima bo\'lishi mumkin?','ICMP ishlayapti, ammo DNS (nomni yechish) ishlamayotgan bo\'lishi, veb-server ishdan chiqqan bo\'lishi yoki firewall 80/443 portlarni yopgan bo\'lishi mumkin.'],
  ['SSH','Parol asosida ulanish nima uchun xavfli?','Brute force (parolni taxmin qilish) hujumlari osonlashadi. Kalit juftligi bilan ulanish ancha xavfsiz va hujumlarga chidamli.'],
  ['SSH','Ochiq va yopiq kalitlar qanday ishlaydi?','Yopiq kalit sizda qoladi (sir tutiladi). Ochiq kalit serverga qo\'yiladi. Server shu ochiq kalit orqali sizning ulanishingizni tekshiradi.']
];

const linuxChecks = [
  'Terminal nima ekanini va buyruqlarni tushunaman.',
  'Fayl va kataloglar ustida (ls, cd, mkdir, cat) ishlay olaman.',
  'Ruxsatlarni (chmod) va egalikni (chown) bilaman.',
  'Jarayonlarni (ps, top, kill) boshqara olaman.',
  'Xizmatlarni (systemctl) ishga tushirib/to\'xtata olaman.',
  'ip, ping va dig bilan tarmoq diagnostika qila olaman.',
  'Ochiq portlarni ss yordamida ko\'ra olaman.',
  'Firewall nima uchun kerakligini va asoslarini bilaman.',
  'SSH kalit juftligini yaratib serverga ulay olaman.',
  'Log fayllarni qayerdan o\'qishni bilaman.'
];

const slides = expandLessons([
  { n:'00', title:'Linux va Tarmoq Asoslari', category:'BOSHLANISH', tag:'Interaktiv taqdimot', foot:'Terminaldan tizim boshqaruviga qadar.', notes:'Bu taqdimot kengaytirilgan mavzularni qamrab oladi. O\'quvchi terminal nima ekanini his qilsin.', render:() => layout(heading('Linux va Tarmoq<br><span class="accent">Asoslari</span>','Buyruq satridan boshlab — tarmoq xavfsizligiga qadar to\'liq boshlang\'ich qo\'llanma.',true)+`<div class="intro-pills"><span class="pill">Kengaytirilgan kurs</span><span class="pill">Amaliy buyruqlar</span><span class="pill">Animatsion sxemalar</span></div><button class="start-button" data-action="next">Darsni boshlash <span>↗</span></button><p class="tiny-note">TO\'LIQ DARS &nbsp; / &nbsp; LINUX, TARMOQ VA SSH</p>`, `<div class="panel dark-panel grid-bg"><div class="panel-label"><span>TERMINAL SIMULYATSIYASI</span><span>● JONLI</span></div><pre class="code-window" style="min-height:300px"><span class="code-gray">Welcome to Linux</span>\n\n<span class="code-green">user@cybervalue:~$</span> whoami\nuser\n\n<span class="code-green">user@cybervalue:~$</span> pwd\n/home/user\n\n<span class="code-green">user@cybervalue:~$</span> sudo systemctl status\n● system is running...</pre></div>`) },
  ...foundationSlides()
]);

if (location.protocol === 'http:' || location.protocol === 'https:') {
  const ret = document.querySelector('.resource-return');
  if (ret) ret.hidden = false;
}

function indexFromHash() {
  const hash = location.hash.slice(1);
  if (hash.startsWith('topic-')) {
    const index = slides.findIndex(s => s.n === hash.slice(6));
    return index < 0 ? 0 : index;
  }
  return Math.max(0, Math.min(slides.length-1, (parseInt(hash,10)||1)-1));
}
let current = indexFromHash();
let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let step = 0;
let timer = null;
let linuxQuestionCategory = 'Barchasi';
let linuxQuestionIndex = 0;
let linuxChecked = [];
try { const saved = JSON.parse(localStorage.getItem('linux-asoslar-checks') || '[]'); if (Array.isArray(saved)) linuxChecked = saved.filter(x=>Number.isInteger(x) && x>=0 && x<linuxChecks.length); } catch (_) {}
const $ = id => document.getElementById(id);

function render() {
  clearInterval(timer);
  step = 0;
  const s = slides[current];
  $('slide').innerHTML = `<article class="slide-content${s.topic?' detail-slide':''}"><div class="slide-topline"><span class="eyebrow">${s.n === '00' ? 'LINUX ASOSLARI' : s.n + ' / ' + s.category}</span><span class="topic-tag">${s.tag}</span></div>${s.render()}<div class="slide-footer">${s.foot}</div></article>`;
  $('railNav').innerHTML = slides.map((x,i)=>`<button class="rail-item${i===current?' active':''}" data-go="${i}" aria-label="${x.n}: ${x.title}" ${i===current?'aria-current="step"':''} title="${x.title}">${x.n==='00'?'↗':x.n}</button>`).join('');
  renderContents();
  $('counter').innerHTML = `${String(current+1).padStart(2,'0')} <span>/ ${slides.length}</span>`;
  $('progress').style.width = `${(current+1)/slides.length*100}%`;
  $('prevButton').disabled = current === 0;
  $('nextButton').disabled = current === slides.length-1;
  $('notesText').textContent = s.notes;
  $('announcement').textContent = `${current+1} / ${slides.length}. ${s.title}`;
  document.title = `${s.title} — Linux asoslari`;
  
  if (s.n==='22') filterGlossary('');
  if (foundationFlows[s.n]) updateStep();
  if (s.n==='23') { linuxQuestionCategory='Barchasi'; linuxQuestionIndex=0; updateQuestion(); }
  if (s.n==='24') { document.querySelectorAll('[data-linux-check]').forEach(el=>el.checked=linuxChecked.includes(Number(el.dataset.linuxCheck))); updateChecks(); }
  
  const activeRailItem = $('railNav').querySelector('[aria-current]');
  if (activeRailItem) $('railNav').scrollTop = activeRailItem.offsetTop - $('railNav').offsetTop - $('railNav').clientHeight / 2 + activeRailItem.clientHeight / 2;
  syncPlayback();
  startTimer();
}

function go(index) {
  const next = Math.max(0, Math.min(slides.length-1, index));
  if(next===current) return;
  current=next;
  try { history.replaceState(null,'',`#topic-${slides[current].n}`); } catch (_) { location.hash=`topic-${slides[current].n}`; }
  render();
  $('slide').focus({preventScroll:true});
  window.scrollTo({top:0,behavior:'instant'});
}

function syncPlayback() {
  document.body.classList.toggle('paused',!playing);
  $('playButton').innerHTML = `${playing?'Ⅱ':'▷'} <span>${playing?'Animatsiya':'Davom ettirish'}</span>`;
  $('playButton').setAttribute('aria-pressed',String(playing));
  $('playButton').title = playing ? 'Animatsiyani pauza qilish (Space)' : 'Animatsiyani davom ettirish (Space)';
}

function togglePlayback() { playing=!playing; syncPlayback(); startTimer(); }

function stepCount() { return foundationFlows[slides[current].n]?.length || 0; }

function startTimer() {
  clearInterval(timer);
  if (playing && !document.hidden && stepCount() > 0) timer=setInterval(()=>advanceStep(1,false),4500);
}

function advanceStep(delta, manual = true) {
  const count=stepCount();
  if (!count) return;
  step=(step+delta+count)%count;
  updateStep();
  if(manual) startTimer();
}

function updateStep() {
  const n=slides[current].n;
  if (foundationFlows[n]) updateFoundationStep(n, step);
  if($('stepCounter')) $('stepCounter').textContent=`${String(step+1).padStart(2,'0')} / ${stepCount()}`;
}

function filterGlossary(query) {
  const items=glossary.filter(g=>g.join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));
  const el = $('linuxGlossaryGrid');
  if (el) {
    el.innerHTML=items.length?items.map(g=>`<div class="glossary-item"><b>${g[0]}</b><small>${g[1]}</small><p>${g[2]}</p></div>`).join(''):'<p class="lead">Atama topilmadi. Boshqa so\'z bilan qidiring.</p>';
    $('linuxGlossaryCount').textContent=`${items.length} / ${glossary.length} ta atama`;
  }
}

function updateQuestion() {
  const pool=linuxQuestions.filter(q=>linuxQuestionCategory==='Barchasi'||q[0]===linuxQuestionCategory);
  linuxQuestionIndex=(linuxQuestionIndex+pool.length)%pool.length;
  const q=pool[linuxQuestionIndex];
  if ($('linuxQuestionPosition')) {
    $('linuxQuestionPosition').textContent=`${q[0].toUpperCase()} / ${String(linuxQuestionIndex+1).padStart(2,'0')} — ${pool.length}`;
    $('linuxQuestionTitle').textContent=q[1];
    $('linuxQuestionAnswer').textContent=q[2];
    $('linuxQuestionAnswer').hidden=true;
    const button=document.querySelector('[data-action="linux-answer"]');
    if (button) {
      button.textContent='Javobni ko\'rish';
      button.setAttribute('aria-expanded','false');
    }
  }
}

function updateChecks() {
  if ($('linuxCheckProgress')) {
    $('linuxCheckProgress').textContent=`${linuxChecked.length} / ${linuxChecks.length} ta ko\'nikma ${linuxChecked.length===linuxChecks.length?'— ajoyib, keyingi bosqichga tayyorsiz!':'belgilandi'}`;
    try { localStorage.setItem('linux-asoslar-checks',JSON.stringify(linuxChecked)); } catch (_) {}
  }
}

function toggleNotes(force) {
  const show=typeof force==='boolean'?force:$('notesPanel').hidden;
  $('notesPanel').hidden=!show;
  $('notesButton').setAttribute('aria-expanded',String(show));
}

function renderContents() {
  const normalize = text => text.toLocaleLowerCase().replace(/[‘’'ʼ]/g, '');
  const el = $('contentsSearch');
  if (!el) return;
  const query = normalize(el.value.trim());
  const groups = [
    ['Boshlanish va Fayl tizimi', 0, 8],
    ['Paketlar va Tizim', 9, 13],
    ['Tarmoq buyruqlari', 14, 16],
    ['Tarmoq Xavfsizligi va SSH', 17, 21],
    ['Amaliyot va Yakun', 22, 25]
  ];
  let count = 0;
  $('contentsGrid').innerHTML = groups.map(([label, from, to]) => {
    const items = slides.map((s,i)=>({s,i})).filter(({s}) => {
      const topic = parseInt(s.n, 10);
      return topic >= from && topic <= to && normalize(`${s.n} ${s.title} ${s.notes} ${s.searchText || ''}`).includes(query);
    });
    count += items.length;
    if (!items.length) return '';
    return `<section class="contents-group"><h3>${label}</h3><div>${items.map(({s,i})=>`<button class="contents-item${i===current?' active':''}${s.topic?' contents-child':''}" data-go="${i}" ${i===current?'aria-current="step"':''}><b>${s.n==='00'?'↗':s.n}</b><span>${s.title}</span></button>`).join('')}</div></section>`;
  }).join('') || '<p>Hech narsa topilmadi. Boshqa so\'z bilan qidiring.</p>';
  $('contentsCount').textContent = `${count} / ${slides.length} ta slayd · Asosiy mavzular`;
}

function openContents() { $('contentsSearch').value=''; renderContents(); $('contentsDialog').showModal(); $('contentsSearch').focus(); }

async function fullscreen() {
  try { if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch (_) { $('announcement').textContent='To\'liq ekran bu browserda mavjud emas. Browserning F11 tugmasidan foydalaning.'; }
}

document.addEventListener('click', event=>{
  const button=event.target.closest('button');
  if(!button) return;
  if(button.dataset.go!==undefined){$('contentsDialog').close();go(Number(button.dataset.go));return;}
  if(button.dataset.step!==undefined){step=Number(button.dataset.step);updateStep();startTimer();}
  if(button.dataset.linuxSecurity!==undefined){
    const i=Number(button.dataset.linuxSecurity);
    document.querySelectorAll('[data-linux-security]').forEach((e,j)=>{
      e.classList.toggle('active',i===j);
      e.setAttribute('aria-pressed',String(i===j));
    });
    const items = [['Port 22 (SSH)','Brute force, zaif parol','Kalit auth, fail2ban, port o\'zgartirish'],['Port 80/443 (Web)','XSS, SQLi, misconfiguration','WAF, HTTPS, input validatsiya'],['Xizmat versiyalari','CVE zaifliklar','Muntazam yangilash'],['Foydalanuvchi ruxsatlari','Privilege escalation','Minimal ruxsat tamoyili'],['Log monitoring','Hujumni kech sezish','Centralized logging, SIEM'],['Firewall','Noto\'g\'ri qoidalar','Default deny, minimal allow']];
    $('linuxSecLabel').textContent=items[i][0];
    $('linuxSecQuestion').textContent=items[i][2];
  }
  if(button.dataset.linuxCategory){
    linuxQuestionCategory=button.dataset.linuxCategory;
    linuxQuestionIndex=0;
    document.querySelectorAll('[data-linux-category]').forEach(e=>{
      const active=e===button;
      e.classList.toggle('active',active);
      e.setAttribute('aria-pressed',String(active));
    });
    updateQuestion();
  }
  switch(button.dataset.action){
    case 'next':go(current+1);break;
    case 'restart':go(0);break;
    case 'step-next':advanceStep(1);break;
    case 'step-back':advanceStep(-1);break;
    case 'step-reset':step=0;updateStep();break;
    case 'linux-answer':
      $('linuxQuestionAnswer').hidden=!$('linuxQuestionAnswer').hidden;
      button.textContent=$('linuxQuestionAnswer').hidden?'Javobni ko\'rish':'Javobni yashirish';
      button.setAttribute('aria-expanded',String(!$('linuxQuestionAnswer').hidden));
      break;
    case 'linux-question-next':linuxQuestionIndex++;updateQuestion();break;
  }
});

$('nextButton').addEventListener('click',()=>go(current+1));
$('prevButton').addEventListener('click',()=>go(current-1));
$('playButton').addEventListener('click',togglePlayback);
$('contentsButton').addEventListener('click',openContents);
$('closeContents').addEventListener('click',()=>$('contentsDialog').close());
$('contentsDialog').addEventListener('click',e=>{if(e.target===$('contentsDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('notesButton').addEventListener('click',()=>toggleNotes());
$('closeNotes').addEventListener('click',()=>toggleNotes(false));
$('fullscreenButton').addEventListener('click',fullscreen);

document.addEventListener('input',e=>{
  if(e.target.id==='linuxGlossarySearch') filterGlossary(e.target.value);
  if(e.target.id==='contentsSearch') renderContents();
});

document.addEventListener('change',e=>{
  if(e.target.matches('[data-linux-check]')){
    const i=Number(e.target.dataset.linuxCheck);
    linuxChecked=linuxChecked.filter(x=>x!==i);
    if(e.target.checked) linuxChecked.push(i);
    updateChecks();
  }
});

document.addEventListener('keydown',e=>{
  if(e.target.matches('input,textarea,select')||e.ctrlKey||e.metaKey||e.altKey) return;
  if($('contentsDialog').open) return;
  if(e.code==='Space'&&e.target.closest('button,a,summary')) return;
  switch(e.key){
    case 'ArrowRight':case 'PageDown':e.preventDefault();go(current+1);break;
    case 'ArrowLeft':case 'PageUp':e.preventDefault();go(current-1);break;
    case 'Home':e.preventDefault();go(0);break;
    case 'End':e.preventDefault();go(slides.length-1);break;
    case ' ':e.preventDefault();togglePlayback();break;
    case 'f':case 'F':fullscreen();break;
    case 'm':case 'M':openContents();break;
    case 'n':case 'N':toggleNotes();break;
    case 'Escape':toggleNotes(false);break;
  }
});

window.addEventListener('hashchange',()=>go(indexFromHash()));
document.addEventListener('visibilitychange',startTimer);
render();
