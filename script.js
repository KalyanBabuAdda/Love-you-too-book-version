(() => {
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>t*t*(3-2*t);
  const camera=document.getElementById('camera');
  const scene=document.getElementById('scene');
  const stage=document.getElementById('stage');
  const light=document.getElementById('pageLight');
  const glass=document.getElementById('glassLight');
  const cue=document.getElementById('scrollCue');
  const petals=[...document.querySelectorAll('.petal')];
  const glows=[...document.querySelectorAll('.glow')];

  let mouseX=0,mouseY=0,targetX=0,targetY=0;
  let scrollP=0,renderP=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getProgress(){
    const max=document.documentElement.scrollHeight-innerHeight;
    return max>0?clamp(scrollY/max):0;
  }

  function scrollState(p){
    // 0–.18: exact full composition
    // .18–.48: push into the open book
    // .48–.76: orbit slightly around the page turn
    // .76–1: settle back into a slightly wider final composition
    let scale=1,rx=0,ry=0,tx=0,ty=0,tz=0,brightness=.98;
    if(p<.18){
      const t=smooth(p/.18);
      scale=lerp(.985,1,t); tz=lerp(-24,0,t); brightness=lerp(.86,.98,t);
    } else if(p<.48){
      const t=smooth((p-.18)/.30);
      scale=lerp(1,1.40,t);
      ty=lerp(0,1.5,t); tx=lerp(0,-1.0,t);
      rx=lerp(0,2.4,t); ry=lerp(0,-3.8,t); tz=lerp(0,70,t);
      brightness=lerp(.98,1.04,t);
    } else if(p<.76){
      const t=smooth((p-.48)/.28);
      scale=lerp(1.40,1.52,t);
      tx=lerp(-1.0,-4.0,t); ty=lerp(1.5,4.0,t);
      rx=lerp(2.4,-1.2,t); ry=lerp(-3.8,4.2,t); tz=lerp(70,95,t);
      brightness=1.04;
    } else {
      const t=smooth((p-.76)/.24);
      scale=lerp(1.52,1.12,t);
      tx=lerp(-4,0,t); ty=lerp(4,0,t);
      rx=lerp(-1.2,0,t); ry=lerp(4.2,0,t); tz=lerp(95,18,t);
      brightness=lerp(1.04,1,t);
    }
    return {scale,rx,ry,tx,ty,tz,brightness};
  }

  function frame(){
    scrollP=getProgress();
    renderP += (scrollP-renderP)*.075;
    mouseX += (targetX-mouseX)*.08;
    mouseY += (targetY-mouseY)*.08;

    if(!reduced){
      const s=scrollState(renderP);
      const mx=mouseX*1.3, my=mouseY*1.0;
      scene.style.transform=`translate3d(${s.tx}vw,${s.ty}vh,${s.tz}px) rotateX(${s.rx-my}deg) rotateY(${s.ry+mx}deg) scale(${s.scale})`;
      scene.style.filter=`brightness(${s.brightness}) saturate(${1+renderP*.035}) contrast(${1.015+renderP*.025})`;

      // Page-curl light exists only over the real raised-page area in the image.
      const curl=clamp((renderP-.37)/.34);
      const curlWave=Math.sin(curl*Math.PI);
      light.style.opacity=(curlWave*.72).toFixed(3);
      light.style.transform=`rotateY(${lerp(-4,-62,curl)}deg) skewY(${lerp(-1,-5,curlWave)}deg) translateX(${lerp(0,-8,curl)}%) scaleX(${lerp(1,.72,curlWave)})`;
      glass.style.opacity=(.03+.11*curlWave).toFixed(3);
      glass.style.transform=`translateX(${lerp(-42,54,renderP)}%) rotate(${lerp(-1.5,1.5,renderP)}deg)`;

      petals.forEach((el,i)=>{
        const d=(i+1)*.16;
        const y=(renderP*150*(.45+d));
        const x=Math.sin(renderP*8+i*1.7)*18;
        el.style.transform=`translate3d(${x}px,${y}px,${20+i*8}px) rotate(${renderP*130+i*23}deg)`;
      });
      glows[0].style.transform=`translate3d(${renderP*26}px,${renderP*18}px,0) scale(${1+renderP*.18})`;
      glows[1].style.transform=`translate3d(${-renderP*20}px,${-renderP*22}px,0) scale(${1+renderP*.22})`;
    }
    cue.style.opacity=String(clamp(1-renderP*8));
    requestAnimationFrame(frame);
  }

  addEventListener('pointermove',e=>{
    targetX=(e.clientX/innerWidth-.5)*2;
    targetY=(e.clientY/innerHeight-.5)*2;
  },{passive:true});
  addEventListener('pointerleave',()=>{targetX=0;targetY=0},{passive:true});
  addEventListener('orientationchange',()=>{targetX=0;targetY=0},{passive:true});

  frame();
})();
