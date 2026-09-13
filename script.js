const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];

// Mobile menu
const nav=$('#nav'),menuBtn=$('#menuBtn');menuBtn?.addEventListener('click',()=>nav.classList.toggle('open'));$$('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

// Cursor glow + restrained hero parallax
const glow=$('#cursorGlow'),scene=$('#heroScene');
addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;glow.style.opacity='1';glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';if(scene){const r=scene.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;scene.style.transform=`rotateX(${(-ny*2.2).toFixed(2)}deg) rotateY(${(nx*3.2).toFixed(2)}deg)`;$$('[data-depth]',scene).forEach(el=>{const d=+el.dataset.depth||1;el.style.marginLeft=`${nx*10*d}px`;el.style.marginTop=`${ny*8*d}px`;});}});
addEventListener('pointerout',e=>{if(!e.relatedTarget){glow.style.opacity='0';if(scene)scene.style.transform='';}});

// Relationship duration from 16 Nov 2023
function relationshipDuration(){const start=new Date(2023,10,16,0,0,0);const now=new Date();let years=now.getFullYear()-start.getFullYear();let anchor=new Date(start);anchor.setFullYear(start.getFullYear()+years);if(anchor>now){years--;anchor.setFullYear(start.getFullYear()+years);}let months=0;while(months<11){const next=new Date(anchor);next.setMonth(next.getMonth()+1);if(next<=now){anchor=next;months++;}else break;}const days=Math.max(0,Math.floor((now-anchor)/86400000));$('#years').textContent=years;$('#months').textContent=months;$('#days').textContent=days;}
relationshipDuration();setInterval(relationshipDuration,3600000);

// Reunion countdown: 19 Nov 2026, local time
const reunion=new Date(2026,10,19,0,0,0);
function tickCountdown(){let ms=Math.max(0,reunion-new Date());const d=Math.floor(ms/86400000);ms%=86400000;const h=Math.floor(ms/3600000);ms%=3600000;const m=Math.floor(ms/60000);const s=Math.floor((ms%60000)/1000);$('#cdDays').textContent=String(d).padStart(2,'0');$('#cdHours').textContent=String(h).padStart(2,'0');$('#cdMinutes').textContent=String(m).padStart(2,'0');$('#cdSeconds').textContent=String(s).padStart(2,'0');}
tickCountdown();setInterval(tickCountdown,1000);

// Calendar Sep/Oct/Nov 2026
const calRoot=$('#calendars');const monthNames=['September','October','November'];const months=[8,9,10];const today=new Date();
months.forEach((month,i)=>{const wrap=document.createElement('div');wrap.className='calendar';const h=document.createElement('h3');h.textContent=monthNames[i]+' 2026';wrap.appendChild(h);const week=document.createElement('div');week.className='week';['S','M','T','W','T','F','S'].forEach(x=>{const s=document.createElement('span');s.textContent=x;week.appendChild(s)});wrap.appendChild(week);const days=document.createElement('div');days.className='days';const first=new Date(2026,month,1).getDay(),last=new Date(2026,month+1,0).getDate();for(let j=0;j<first;j++){const e=document.createElement('span');e.className='day empty';e.textContent='·';days.appendChild(e)}for(let day=1;day<=last;day++){const el=document.createElement('span');el.className='day';el.textContent=day;const date=new Date(2026,month,day);if(date<new Date(today.getFullYear(),today.getMonth(),today.getDate()))el.classList.add('passed');if(date>=new Date(2026,8,19)&&date<reunion)el.classList.add('apart');if(month===10&&day===16){el.classList.add('anniversary');el.title='Our anniversary'}if(month===10&&day===19){el.classList.add('reunion');el.title='Reunion day'}days.appendChild(el)}wrap.appendChild(days);calRoot.appendChild(wrap)});

// Reveal on scroll
const revealObs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObs.unobserve(e.target)}}),{threshold:.13});$$('.reveal').forEach(el=>revealObs.observe(el));

// Scroll spy
const sections=$$('main .section[id]');const navLinks=$$('.nav-links a[href^="#"]');const spy=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));}})},{rootMargin:'-40% 0px -52% 0px',threshold:0});sections.forEach(s=>spy.observe(s));

// Polaroid base rotations
$$('.polaroid').forEach(p=>p.style.setProperty('--rot',(p.dataset.tilt||0)+'deg'));
