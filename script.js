const stage=document.getElementById('stage');
const root=document.documentElement;
const cover=document.getElementById('frontCover');
const sheet=document.getElementById('turningSheet');
const leftContent=document.getElementById('leftContent');
const rightContent=document.getElementById('rightContent');
const sheetFront=document.getElementById('sheetFront');
const sheetBack=document.getElementById('sheetBack');
const pageNow=document.getElementById('pageNow');
const barFill=document.getElementById('barFill');
const prevBtn=document.getElementById('prevBtn');
const nextBtn=document.getElementById('nextBtn');
const bg=document.querySelector('.scene-bg');
const copy=document.querySelector('.scene-copy');
const bokehs=[...document.querySelectorAll('.bokeh')];

const quotes=[
'With you, every ordinary day feels special.',
'You are my favourite place to come home to.',
'Same hearts, different days — always us.',
'Every little moment becomes a memory with you.',
'In every crowd, I would still look for you.',
'You make the simple days worth remembering.',
'Anywhere feels right when I am beside you.',
'Some stories are written quietly — ours is my favourite.',
'I would choose you in every version of this life.',
'Whatever the distance, my heart still knows the way to you.'
];
const captions=['You. Always.','My person.','Still us.','Little forever.','Favourite feeling.','Side by side.','Our kind of magic.','Home is you.','Again and always.','To many more.'];
const imgs=Array.from({length:10},(_,i)=>`assets/photos/product-${i+1}.png`);
let current=0;
const total=imgs.length;

function photoHTML(i){return `<div class="memory-photo"><img src="${imgs[i]}" alt="Memory ${i+1}"><div class="caption">${captions[i]}</div></div>`}
function quoteHTML(i){return `<div class="quote">${quotes[i]}</div><div class="flower">❧</div>`}
function renderBase(i){leftContent.innerHTML=photoHTML(i);rightContent.innerHTML=quoteHTML(i);pageNow.textContent=String(i+1).padStart(2,'0');barFill.style.width=`${((i+1)/total)*100}%`}
function renderTurn(i,next){
  if(next){sheetFront.innerHTML=quoteHTML(i);sheetBack.innerHTML=photoHTML(Math.min(i+1,total-1));}
  else{sheetFront.innerHTML=photoHTML(Math.max(i-1,0));sheetBack.innerHTML=quoteHTML(Math.max(i-1,0));}
}
renderBase(0);renderTurn(0,true);

function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function smoothstep(a,b,x){x=clamp((x-a)/(b-a),0,1);return x*x*(3-2*x)}

let lastY=0;
function update(){
  const max=document.documentElement.scrollHeight-innerHeight;
  const p=max?scrollY/max:0;
  // Phase 1: closed book reveal 0-.10
  const reveal=smoothstep(0,.07,p);
  bg.style.opacity=(reveal*.98).toFixed(3);
  copy.style.opacity=(smoothstep(.035,.09,p)).toFixed(3);
  bokehs.forEach((b,i)=>b.style.opacity=(reveal*(.12+i*.03)).toFixed(2));
  root.style.setProperty('--bookScale',(0.62 + smoothstep(0,.075,p)*0.24).toFixed(3));
  root.style.setProperty('--bookWide',(0.70 + smoothstep(.055,.16,p)*0.30).toFixed(3));
  root.style.setProperty('--bookY',`${(-35 + smoothstep(0,.09,p)*70).toFixed(1)}px`);
  root.style.setProperty('--bookRx',`${(14 - smoothstep(.02,.09,p)*8).toFixed(1)}deg`);
  // Phase 2: cover open .08-.18
  const open=smoothstep(.085,.18,p);
  root.style.setProperty('--coverAngle',`${(-178*open).toFixed(2)}deg`);
  root.style.setProperty('--insideOpacity', Math.min(1, smoothstep(.12,.19,p)).toFixed(3));
  stage.classList.toggle('open',open>.93);
  // pages phase .18-.98 -> 9 turns
  const pageP=clamp((p-.18)/.80,0,.99999);
  const turns=total-1;
  const raw=pageP*turns;
  const idx=Math.min(turns-1,Math.floor(raw));
  const local=raw-idx;
  const angle=-180*smoothstep(0,1,local);
  const forward=scrollY>=lastY; lastY=scrollY;
  if(idx!==current){ current=idx; renderBase(current); }
  renderTurn(current,true);
  root.style.setProperty('--sheetAngle',`${angle.toFixed(2)}deg`);
  root.style.setProperty('--sheetShade',(0.18 + Math.sin(local*Math.PI)*.45).toFixed(3));
  // when completing a turn, visually swap base at the very end
  if(local>.985 && current<total-1){renderBase(current+1)}
  else renderBase(current);
  const shown=Math.min(total-1,current+(local>.5?1:0));
  pageNow.textContent=String(shown+1).padStart(2,'0');barFill.style.width=`${((shown+1)/total)*100}%`;
  // camera parallax through the sequence
  root.style.setProperty('--bookRy',`${((.5-local)*1.5).toFixed(2)}deg`);
}
addEventListener('scroll',()=>requestAnimationFrame(update),{passive:true});update();

function targetForPage(n){
 const max=document.documentElement.scrollHeight-innerHeight;
 const pageP=n/(total-1);
 return max*(.18+.80*pageP);
}
prevBtn.addEventListener('click',()=>scrollTo({top:targetForPage(Math.max(0,Number(pageNow.textContent)-2)),behavior:'smooth'}));
nextBtn.addEventListener('click',()=>scrollTo({top:targetForPage(Math.min(total-1,Number(pageNow.textContent))),behavior:'smooth'}));

// gentle pointer parallax
let tx=0,ty=0,cx=0,cy=0;
addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*2;ty=(e.clientY/innerHeight-.5)*2},{passive:true});
(function loop(){cx+=(tx-cx)*.04;cy+=(ty-cy)*.04;document.getElementById('book').style.transform=`rotateX(calc(var(--bookRx) + ${-cy*1.3}deg)) rotateY(calc(var(--bookRy) + ${cx*1.8}deg))`;bg.style.transform=`scale(1.08) translate(${cx*-6}px,${cy*-4}px)`;requestAnimationFrame(loop)})();

// petals
const petals=document.getElementById('petals');
for(let i=0;i<14;i++){const e=document.createElement('i');e.className='petal';e.style.left=Math.random()*100+'%';e.style.top=Math.random()*100+'%';e.dataset.s=(.3+Math.random()*.8).toFixed(2);e.dataset.o=(Math.random()*360).toFixed(0);petals.appendChild(e)}
function petalLoop(t){[...petals.children].forEach((e,i)=>{const s=+e.dataset.s,o=+e.dataset.o;const y=((t*.012*s+i*90)% (innerHeight+180))-90;const x=Math.sin(t*.0006+i)*36; e.style.transform=`translate(${x}px,${y}px) rotate(${o+t*.02*s}deg)`});requestAnimationFrame(petalLoop)}requestAnimationFrame(petalLoop);
