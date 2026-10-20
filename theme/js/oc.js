/* OCEAN CEMENT TANKS — interaction layer (no dependencies) */
(function(){
  var d=document,root=d.documentElement,b=d.body;
  root.classList.add('oc-js');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- language: Arabic pages are wrapped in .oc-ar ---------- */
  var isAr=!!d.querySelector('.oc-ar');
  if(isAr){root.setAttribute('dir','rtl');root.setAttribute('lang','ar');b.classList.add('oc-is-ar');}
  /* counterpart URL: /about/ <-> /ar-about/ , / <-> /ar/ */
  function counterpart(){
    var u=new URL(location.href),p=u.pathname.replace(/\/+$/,'/');
    var parts=p.split('/').filter(Boolean),last=parts.pop()||'';
    var base=parts.length?'/'+parts.join('/')+'/':'/';
    var next;
    if(isAr){next=(last==='ar'||last==='')?'':last.replace(/^ar-/,'');}
    else{next=last===''?'ar':'ar-'+last;}
    return u.origin+base+(next?next+'/':'');
  }
  d.querySelectorAll('a.oc-lang-btn,a[href="#oc-lang"]').forEach(function(a){a.href=counterpart();});

  /* ---------- loader ---------- */
  var loader=d.querySelector('.oc-loader'),tank=loader&&loader.querySelector('.oc-tank'),count=loader&&loader.querySelector('.oc-loader-count');
  var start=performance.now(),minT=reduce?0:1300,lvl=0,loaded=false;
  window.addEventListener('load',function(){loaded=true;});
  setTimeout(function(){loaded=true;},2500);
  function tick(t){
    if(!loader)return ready();
    var target=loaded?100:Math.min(90,(t-start)/18);
    lvl+=(target-lvl)*0.08; if(loaded&&lvl>99.2)lvl=100;
    if(tank)tank.style.setProperty('--lvl',(100-lvl*0.92)+'%');
    if(count)count.textContent=Math.round(lvl)+'%';
    if(lvl>=100&&t-start>minT){setTimeout(function(){loader.classList.add('oc-done');ready();},180);}
    else requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  var isReady=false;
  function ready(){if(isReady)return;isReady=true;b.classList.add('oc-ready');setTimeout(observeAll,250);}

  /* ---------- page transitions: water curtain on internal links ---------- */
  d.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a');
    if(!a||!loader||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank'||a.hasAttribute('download'))return;
    var href=a.getAttribute('href')||'';
    if(!href||href.charAt(0)==='#'||/^(tel|mailto|javascript|whatsapp):/i.test(href))return;
    var u;try{u=new URL(a.href);}catch(x){return;}
    if(u.origin!==location.origin||u.pathname.indexOf('/wp-admin')===0||(u.pathname===location.pathname&&u.hash))return;
    e.preventDefault();
    loader.classList.remove('oc-done');loader.classList.add('oc-cover-start');
    if(count)count.textContent='';
    if(tank)tank.style.setProperty('--lvl','8%');
    void loader.offsetWidth;
    loader.classList.remove('oc-cover-start');loader.classList.add('oc-cover');
    setTimeout(function(){location.href=u.href;},reduce?0:650);
  });
  window.addEventListener('pageshow',function(ev){if(ev.persisted&&loader){loader.classList.remove('oc-cover');loader.classList.add('oc-done');}});

  /* ---------- split headings into words ---------- */
  d.querySelectorAll('.oc-split').forEach(function(h){
    if(h.dataset.ocSplit)return;h.dataset.ocSplit=1;
    var i=0;
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var frag=d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(w){
            if(!w)return;
            if(/^\s+$/.test(w)){frag.appendChild(d.createTextNode(w));return;}
            var o=d.createElement('span');o.className='oc-w';
            var s=d.createElement('span');s.textContent=w;s.style.setProperty('--i',i++);
            o.appendChild(s);frag.appendChild(o);
          });
          n.parentNode.replaceChild(frag,n);
        }else if(n.nodeType===1&&n.tagName!=='BR'){walk(n);}
      });
    })(h);
  });

  /* ---------- reveal on scroll ---------- */
  function observeAll(){
    var els=d.querySelectorAll('.oc-reveal,.oc-stagger,.oc-split,.oc-steps,.oc-count-wrap');
    if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('oc-in');});return;}
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('oc-in');countUp(en.target);io.unobserve(en.target);}});
    },{threshold:.15,rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(e){io.observe(e);});
  }

  /* ---------- counters ---------- */
  function countUp(scope){
    scope.querySelectorAll&&scope.querySelectorAll('[data-count]').forEach(function(el){
      if(el.dataset.done)return;el.dataset.done=1;
      var to=parseFloat(el.dataset.count),dur=1600,t0=performance.now();
      (function f(t){var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,4);el.textContent=Math.round(to*e).toLocaleString('en-US');if(k<1)requestAnimationFrame(f);})(t0);
    });
  }

  /* ---------- header: solid on scroll, hide on scroll down ---------- */
  var header=d.querySelector('.oc-header'),bar=d.querySelector('.oc-progress'),lastY=0,hasHero=!!d.querySelector('.oc-hero,.oc-page-hero');
  if(header&&!hasHero)header.classList.add('oc-light');
  function onScroll(){
    var y=window.scrollY,h=d.documentElement.scrollHeight-innerHeight;
    if(bar)bar.style.setProperty('--p',h>0?(y/h).toFixed(4):0);
    if(header){
      header.classList.toggle('oc-solid',y>60);
      header.classList.toggle('oc-hide',y>lastY&&y>400&&!d.querySelector('.is-menu-open'));
    }
    b.classList.toggle('oc-scrolled',y>500);
    lastY=y;
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* ---------- hero parallax ---------- */
  var heroImg=d.querySelector('.oc-hero .wp-block-cover__inner-container');
  if(heroImg&&!reduce){window.addEventListener('scroll',function(){var y=scrollY;if(y<innerHeight){heroImg.style.transform='translate3d(0,'+(y*.25)+'px,0)';heroImg.style.opacity=1-y/innerHeight*1.1;}},{passive:true});}

  /* ---------- click effects: water drop on every click + ripple on buttons ---------- */
  d.addEventListener('pointerdown',function(e){
    if(reduce)return;
    ['a','b'].forEach(function(c){var s=d.createElement('span');s.className='oc-drop '+c;s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';b.appendChild(s);setTimeout(function(){s.remove();},900);});
    var btn=e.target.closest&&e.target.closest('.wp-block-button__link,.oc-btn,.oc-fab a,.oc-lang-btn,button');
    if(btn){var r=btn.getBoundingClientRect(),size=Math.max(r.width,r.height)*2.2,rp=d.createElement('span');rp.className='oc-ripple';rp.style.width=rp.style.height=size+'px';rp.style.left=(e.clientX-r.left)+'px';rp.style.top=(e.clientY-r.top)+'px';btn.appendChild(rp);setTimeout(function(){rp.remove();},800);}
  });

  /* ---------- 3D tilt + spotlight on cards ---------- */
  if(!reduce&&matchMedia('(hover:hover)').matches){
    d.querySelectorAll('.oc-card,.oc-member,.oc-tile').forEach(function(c){
      if(c.classList.contains('oc-card')&&!c.querySelector('.oc-shine')){var s=d.createElement('span');s.className='oc-shine';c.appendChild(s);}
      c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
        c.style.transform='perspective(1000px) rotateX('+((.5-y)*7)+'deg) rotateY('+((x-.5)*9)+'deg) translateY(-8px)';
        c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%');});
      c.addEventListener('pointerleave',function(){c.style.transform='';});
    });
    /* magnetic buttons */
    d.querySelectorAll('.wp-block-button__link,.oc-fab a').forEach(function(m){
      m.addEventListener('pointermove',function(e){var r=m.getBoundingClientRect();m.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.28)+'px)';});
      m.addEventListener('pointerleave',function(){m.style.transform='';});
    });
    /* cursor ring */
    var cur=d.createElement('div');cur.className='oc-cursor';b.appendChild(cur);
    var cx=0,cy=0,tx=0,ty=0;
    d.addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;cur.classList.add('oc-on');var h=e.target.closest&&e.target.closest('a,button,summary,.oc-card,.oc-member,input,textarea,select');cur.classList.toggle('oc-big',!!h);});
    d.addEventListener('pointerleave',function(){cur.classList.remove('oc-on');});
    (function loop(){cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;cur.style.transform='translate3d('+cx+'px,'+cy+'px,0)';requestAnimationFrame(loop);})();
  }

  /* ---------- back to top ---------- */
  d.querySelectorAll('.oc-fab-top').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();scrollTo({top:0,behavior:reduce?'auto':'smooth'});});});

  /* ---------- contact form -> WhatsApp or Email (no plugin needed) ---------- */
  d.querySelectorAll('form.oc-wa-form').forEach(function(f){
    var waBtn=f.querySelector('button[type=submit],input[type=submit],.wp-block-button__link');
    if(waBtn&&!f.querySelector('.oc-mail-btn')){
      waBtn.dataset.via='wa';
      var row=d.createElement('div');row.className='oc-send-row';
      waBtn.parentNode.insertBefore(row,waBtn);row.appendChild(waBtn);
      var mb=d.createElement('button');mb.type='submit';mb.className='oc-mail-btn';mb.dataset.via='mail';
      mb.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>'+(isAr?'أرسل عبر الإيميل':'Send by Email')+'</span>';
      row.appendChild(mb);
    }
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var via=(e.submitter&&e.submitter.dataset.via)||'wa';
      var v=function(n){var el=f.querySelector('[name="'+n+'"]');return el?el.value.trim():'';};
      var lines=isAr?['طلب جديد من الموقع','الاسم: '+v('name'),'الهاتف: '+v('phone'),'الخدمة: '+v('service'),'الموقع: '+v('location'),'التفاصيل: '+v('message')]
                    :['New request from the website','Name: '+v('name'),'Phone: '+v('phone'),'Service: '+v('service'),'Location: '+v('location'),'Details: '+v('message')];
      var note=f.querySelector('.oc-form-note');
      if(via==='mail'){
        var subj=(isAr?'طلب عرض سعر – ':'Quote request – ')+(v('name')||'Website');
        location.href='mailto:oceanprecast@gmail.com?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(lines.join('\n'));
        if(note)note.textContent=isAr?'تم فتح تطبيق الإيميل برسالتك، اضغط إرسال هناك.':'Your email app opened with the message. Press send there.';
      }else{
        window.open('https://wa.me/971525050340?text='+encodeURIComponent(lines.join('\n')),'_blank','noopener');
        if(note)note.textContent=isAr?'تم فتح واتساب برسالتك، اضغط إرسال هناك.':'WhatsApp opened with your message. Press send there.';
      }
    });
  });

  /* breadcrumb label */
  d.querySelectorAll('.oc-crumb-here').forEach(function(c){var h=d.querySelector('.oc-page-hero h1');if(h)c.textContent=h.textContent.trim();});

  /* safety: never leave the loader up */
  setTimeout(function(){if(loader&&!loader.classList.contains('oc-done')){loader.classList.add('oc-done');ready();}},7000);
})();
