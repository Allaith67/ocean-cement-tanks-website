/* OCEAN CEMENT TANKS — v2 features: hero slideshows, image sliders, team profiles,
   project folders, YouTube video library, modals & lightbox. No dependencies. */
(function(){
  var d=document,b=d.body,root=d.documentElement;
  var isAr=!!d.querySelector('.oc-ar');
  var host=d.querySelector('.oc-ar')||b;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T=isAr?{photos:'صور',videos:'فيديو',all:'الكل',close:'إغلاق',next:'التالي',prev:'السابق',open:'افتح الملف',noVid:'ستتم إضافة الفيديوهات قريباً',noPh:'لا توجد صور بعد',view:'عرض الملف',slide:'الصورة',person:'الموظف',play:'تشغيل الفيديو'}
               :{photos:'Photos',videos:'Videos',all:'All',close:'Close',next:'Next',prev:'Previous',open:'Open folder',noVid:'Videos will be added soon',noPh:'No photos yet',view:'View profile',slide:'Image',person:'Team member',play:'Play video'};
  var ICON={
    x:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>',
    l:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    r:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    cam:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" fill="none"/><circle cx="12" cy="13.2" r="3.3" stroke="currentColor" stroke-width="1.9" fill="none"/></svg>',
    play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
    pin:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.5s7-6.1 7-11.8a7 7 0 1 0-14 0c0 5.7 7 11.8 7 11.8z" stroke="currentColor" stroke-width="1.9" fill="none"/><circle cx="12" cy="9.7" r="2.5" stroke="currentColor" stroke-width="1.9" fill="none"/></svg>',
    eye:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" stroke="currentColor" stroke-width="1.9" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.9" fill="none"/></svg>'
  };
  if(isAr){var t=ICON.l;ICON.l=ICON.r;ICON.r=t;}

  function el(tag,cls,html){var e=d.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function pad(n){return (n<10?'0':'')+n;}
  function bestSrc(i){
    var s=i.getAttribute('srcset'),best=i.getAttribute('src')||'',w=0;
    if(s)s.split(',').forEach(function(p){var m=p.trim().split(/\s+/),ww=parseInt(m[1],10)||0;if(ww>w&&ww<=2100){w=ww;best=m[0];}});
    return best;
  }
  function imgsOf(scope){
    if(!scope)return [];
    return [].slice.call(scope.querySelectorAll('img')).filter(function(i){return i.getAttribute('src');}).map(function(i){return {src:bestSrc(i),alt:i.alt||''};});
  }
  function pick(scope,sel){
    if(!scope)return '';
    var all=[].slice.call(scope.querySelectorAll(sel));
    var want=isAr?'oc-txt-ar':'oc-txt-en',other=isAr?'oc-txt-en':'oc-txt-ar';
    var a=all.filter(function(e){return e.classList.contains(want);})[0]||all.filter(function(e){return !e.classList.contains(other);})[0]||all[0];
    return a?a.textContent.trim():'';
  }
  function reanimate(node){node.classList.remove('oc-in');void node.offsetWidth;node.classList.add('oc-in');}

  /* ================= MODAL ================= */
  var stack=[];
  function openModal(content,opt){
    opt=opt||{};
    var m=el('div','oc-modal '+(opt.cls||''));
    m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
    if(opt.label)m.setAttribute('aria-label',opt.label);
    m.style.zIndex=99990+stack.length*3;
    var panel=el('div','oc-modal-panel');
    var sc=el('div','oc-modal-scroll');sc.appendChild(content);panel.appendChild(sc);
    var x=el('button','oc-modal-x',ICON.x);x.type='button';x.setAttribute('aria-label',T.close);
    m.appendChild(panel);m.appendChild(x);host.appendChild(m);
    root.classList.add('oc-lock');
    var r=opt.from,vw=innerWidth,vh=innerHeight;
    var clip0=r?'inset('+Math.max(0,r.top)+'px '+Math.max(0,vw-r.right)+'px '+Math.max(0,vh-r.bottom)+'px '+Math.max(0,r.left)+'px round 26px)':'inset(48% 48% 48% 48% round 26px)';
    if(!reduce){panel.style.clipPath=clip0;void panel.offsetWidth;}
    requestAnimationFrame(function(){m.classList.add('oc-open');panel.style.clipPath='inset(0px 0px 0px 0px round 0px)';});
    var prev=d.activeElement;
    setTimeout(function(){x.focus({preventScroll:true});},60);
    var api={el:m,scroll:sc,close:close,keys:opt.keys};
    stack.push(api);
    function close(){
      if(m.classList.contains('oc-closing'))return;
      m.classList.add('oc-closing');m.classList.remove('oc-open');
      if(!reduce)panel.style.clipPath=clip0;
      var i=stack.indexOf(api);if(i>-1)stack.splice(i,1);
      setTimeout(function(){
        m.remove();if(!stack.length)root.classList.remove('oc-lock');
        if(opt.onClose)opt.onClose();
        if(prev&&prev.focus)try{prev.focus({preventScroll:true});}catch(e){}
      },reduce?0:720);
    }
    x.addEventListener('click',close);
    return api;
  }
  d.addEventListener('keydown',function(e){
    var top=stack[stack.length-1];if(!top)return;
    if(e.key==='Escape'){e.preventDefault();top.close();}
    else if(top.keys&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){
      var fwd=(e.key==='ArrowRight')!==isAr;top.keys(fwd?1:-1);
    }
  });

  /* ================= SLIDER ================= */
  function buildSlider(list,o){
    o=o||{};
    var n=list.length,cur=o.start||0,timer=null;
    var w=el('div','oc-sl'+(o.cls?' '+o.cls:''));
    var st=el('div','oc-sl-stage');w.appendChild(st);
    var items=list.map(function(x,i){
      var f=el('div','oc-sl-item'+(i===cur?' oc-on':''));
      var im=el('img');im.alt=x.alt||'';im.decoding='async';im.draggable=false;
      var u=(o.full&&x.full)||x.src;if(Math.abs(i-cur)<=1||i===n-1)im.src=u;else im.setAttribute('data-src',u);
      f.appendChild(im);st.appendChild(f);return f;
    });
    function load(i){var im=items[(i+n)%n].firstChild;var s=im.getAttribute('data-src');if(s){im.src=s;im.removeAttribute('data-src');}}
    var ui=el('div','oc-sl-ui');
    var count=el('div','oc-sl-count');
    var dots=el('div','oc-sl-dots');
    var nav=el('div','oc-sl-nav');
    var pv=el('button','oc-sl-btn',ICON.l);pv.type='button';pv.setAttribute('aria-label',T.prev);
    var nx=el('button','oc-sl-btn',ICON.r);nx.type='button';nx.setAttribute('aria-label',T.next);
    nav.appendChild(pv);nav.appendChild(nx);
    var bar=el('div','oc-sl-bar','<i></i>');
    var dotEls=list.map(function(x,i){var bt=el('button','oc-sl-dot');bt.type='button';bt.setAttribute('aria-label',T.slide+' '+(i+1));bt.addEventListener('click',function(e){e.stopPropagation();go(i);});dots.appendChild(bt);return bt;});
    var thumbs=null,thumbEls=[];
    if(o.thumbs&&n>1){
      thumbs=el('div','oc-sl-thumbs');
      thumbEls=list.map(function(x,i){var bt=el('button','oc-sl-thumb');bt.type='button';bt.setAttribute('aria-label',T.slide+' '+(i+1));var ti=el('img');ti.loading='lazy';ti.alt='';ti.src=x.src;bt.appendChild(ti);bt.addEventListener('click',function(){go(i);});thumbs.appendChild(bt);return bt;});
    }
    if(n>1){ui.appendChild(count);ui.appendChild(dots);ui.appendChild(nav);w.appendChild(ui);if(o.interval)w.appendChild(bar);}
    if(thumbs)w.appendChild(thumbs);
    function update(){
      count.innerHTML='<b>'+pad(cur+1)+'</b><span>/ '+pad(n)+'</span>';
      dotEls.forEach(function(x,i){x.classList.toggle('oc-on',i===cur);x.setAttribute('aria-current',i===cur?'true':'false');});
      thumbEls.forEach(function(x,i){x.classList.toggle('oc-on',i===cur);if(i===cur&&thumbs){var L=x.offsetLeft-thumbs.clientWidth/2+x.clientWidth/2;thumbs.scrollTo({left:L,behavior:reduce?'auto':'smooth'});}});
      if(o.onChange)o.onChange(cur);
    }
    function go(i,dir){
      if(n<2)return;
      i=(i+n)%n;if(i===cur)return;
      if(!dir){dir=i>cur?1:-1;if(cur===n-1&&i===0)dir=1;if(cur===0&&i===n-1)dir=-1;}
      load(i);load(i+1);load(i-1);
      items.forEach(function(it){it.classList.remove('oc-was','oc-next','oc-prev');});
      var a=items[cur],bEl=items[i];
      a.classList.remove('oc-on');a.classList.add('oc-was');
      bEl.classList.add('oc-on',dir>0?'oc-next':'oc-prev');
      cur=i;update();restart();
    }
    function restart(){
      if(!o.interval||n<2)return;
      clearTimeout(timer);
      var bi=bar.firstChild;bi.style.animation='none';void bi.offsetWidth;bi.style.animation='ocBar '+o.interval+'ms linear forwards';
      timer=setTimeout(function(){go(cur+1,1);},o.interval);
    }
    function stop(){clearTimeout(timer);var bi=bar.firstChild;bi.style.animation='none';}
    pv.addEventListener('click',function(e){e.stopPropagation();go(cur-1,-1);});
    nx.addEventListener('click',function(e){e.stopPropagation();go(cur+1,1);});
    var sx=null,moved=false;
    st.addEventListener('pointerdown',function(e){sx=e.clientX;moved=false;});
    st.addEventListener('pointerup',function(e){if(sx==null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)>45){moved=true;var fwd=(dx<0)!==isAr;go(cur+(fwd?1:-1),fwd?1:-1);}});
    if(o.onTap)st.addEventListener('click',function(){if(!moved)o.onTap(cur);});
    if(o.interval){
      w.addEventListener('mouseenter',stop);w.addEventListener('mouseleave',restart);
      w.addEventListener('focusin',stop);w.addEventListener('focusout',restart);
      if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting)restart();else stop();});},{threshold:.2}).observe(w);}
      else restart();
    }
    update();
    return {el:w,go:go,step:function(s){go(cur+s,s);},cur:function(){return cur;}};
  }

  /* ================= LIGHTBOX ================= */
  function lightbox(list,i,from){
    var wrap=el('div','oc-lb-in');
    var s=buildSlider(list,{cls:'oc-sl-lb',thumbs:true,start:i,full:true});
    wrap.appendChild(s.el);
    openModal(wrap,{cls:'oc-lb',from:from,keys:s.step,label:T.photos});
  }

  /* ================= VIDEOS ================= */
  function ytId(u){var m=String(u||'').match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/);return m?m[1]:null;}
  function collectVideos(scope){
    var out=[],seen={};if(!scope)return out;
    function add(id,t){if(id&&!seen[id]){seen[id]=1;out.push({id:id,title:(t||'').trim()});}}
    scope.querySelectorAll('.wp-block-embed').forEach(function(f){
      var ifr=f.querySelector('iframe'),cap=f.querySelector('figcaption'),a=f.querySelector('a[href]');
      add(ytId(ifr&&ifr.src)||ytId(a&&a.href)||ytId(f.textContent),(cap&&cap.textContent)||(ifr&&ifr.title)||'');
    });
    scope.querySelectorAll('iframe,a[href]').forEach(function(x){add(ytId(x.src||x.href),x.title||'');});
    scope.querySelectorAll('p,li').forEach(function(p){add(ytId(p.textContent),'');});
    scope.querySelectorAll('iframe').forEach(function(f){f.removeAttribute('src');f.remove();});
    return out;
  }
  function vidTile(v,i){
    var bt=el('button','oc-vid');bt.type='button';bt.style.setProperty('--i',i||0);
    bt.setAttribute('aria-label',T.play+(v.title?': '+v.title:''));
    bt.innerHTML='<span class="oc-vid-img"><img loading="lazy" alt="" src="https://i.ytimg.com/vi/'+v.id+'/hqdefault.jpg"></span><span class="oc-vid-play">'+ICON.play+'</span>'+(v.title?'<span class="oc-vid-t">'+esc(v.title)+'</span>':'');
    bt.addEventListener('click',function(){playVideo(v,bt.getBoundingClientRect());});
    return bt;
  }
  function playVideo(v,from){
    var c=el('div','oc-theater-in','<div class="oc-theater-frame"><iframe src="https://www.youtube-nocookie.com/embed/'+v.id+'?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="'+esc(v.title||'YouTube')+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>'+(v.title?'<p class="oc-theater-t">'+esc(v.title)+'</p>':''));
    openModal(c,{cls:'oc-theater',from:from,label:v.title||'Video'});
  }
  function vidGrid(list){
    var g=el('div','oc-vgrid');
    list.forEach(function(v,i){g.appendChild(vidTile(v,i));});
    return g;
  }
  function emptyVideos(){return el('div','oc-vempty','<span class="oc-vempty-ic">'+ICON.play+'</span><p>'+T.noVid+'</p>');}

  /* ================= 1. HERO SLIDESHOW (videos first, then images 60s each) ================= */
  (function(){
    var hero=d.querySelector('.oc-hero,.oc-page-hero');
    var wrap=d.querySelector('.oc-hero-slides-wrap');
    var srcs=[].slice.call(d.querySelectorAll('.oc-hero-slides img')).map(bestSrc).filter(Boolean);
    var vsrc=wrap?[].slice.call(wrap.querySelectorAll('video')).map(function(v){var s=v.getAttribute('src');if(!s){var so=v.querySelector('source');s=so&&so.getAttribute('src');}v.removeAttribute('src');v.preload='none';return s;}).filter(Boolean):[];
    if(!hero||(!srcs.length&&!vsrc.length))return;
    var conn=navigator.connection||{};
    var allowVideo=vsrc.length&&!conn.saveData&&!/(^|-)2g$/.test(conn.effectiveType||'');
    if(!allowVideo)vsrc=[];
    var DUR=60000;
    var base=hero.querySelector('img.wp-block-cover__image-background');
    if(!base&&srcs.length){base=el('img','wp-block-cover__image-background');base.alt='';hero.insertBefore(base,hero.firstChild);}
    var items=[];
    vsrc.forEach(function(s){items.push({t:'v',s:s});});
    srcs.forEach(function(s,i){items.push({t:'i',s:s,base:i===0});});
    if(!items.length)return;
    var anchor=base||hero.querySelector('.wp-block-cover__background');
    var after=base;
    items.forEach(function(it){
      if(it.base&&base){base.removeAttribute('srcset');base.removeAttribute('sizes');if(base.getAttribute('src')!==it.s)base.src=it.s;base.classList.add('oc-slide');it.el=base;return;}
      var n;
      if(it.t==='v'){n=d.createElement('video');n.className='wp-block-cover__image-background oc-slide oc-vslide';n.muted=true;n.defaultMuted=true;n.setAttribute('muted','');n.setAttribute('playsinline','');n.setAttribute('webkit-playsinline','');n.preload='none';n.setAttribute('aria-hidden','true');n.disablePictureInPicture=true;}
      else{n=el('img','wp-block-cover__image-background oc-slide');n.alt='';n.setAttribute('aria-hidden','true');n.decoding='async';}
      it.el=n;
      if(after&&after.parentNode)after.parentNode.insertBefore(n,after.nextSibling);else hero.insertBefore(n,anchor||hero.firstChild);
      after=n;
    });
    var cur=-1,timer=null,showing=null;
    var startIdx=vsrc.length?vsrc.length:0;/* first paint = first image */
    if(!srcs.length)startIdx=0;
    function prep(i){var it=items[(i+items.length)%items.length];if(it.t==='i'&&!it.el.getAttribute('src'))it.el.src=it.s;if(it.t==='v'&&!it.el.getAttribute('src')){it.el.src=it.s;it.el.preload='auto';try{it.el.load();}catch(e){}}}
    var ui=null,dotEls=[];
    if(items.length>1){
      ui=el('div','oc-hs');var dots=el('div','oc-hs-dots');
      dotEls=items.map(function(x,i){var bt=el('button','oc-hs-dot'+(x.t==='v'?' oc-hs-v':''),'<i></i>');bt.type='button';bt.setAttribute('aria-label',(x.t==='v'?(isAr?'فيديو ':'Video '):T.slide+' ')+(i+1));bt.addEventListener('click',function(){go(i,true);});dots.appendChild(bt);return bt;});
      ui.appendChild(dots);hero.appendChild(ui);
    }
    function mark(ms){dotEls.forEach(function(x,i){x.classList.toggle('oc-on',i===cur);var bi=x.firstChild;bi.style.animation='none';void bi.offsetWidth;bi.style.animation=(i===cur&&ms)?'ocBar '+ms+'ms linear forwards':'none';});}
    function next(){go(cur+1);}
    function go(i,user){
      i=(i+items.length)%items.length;
      clearTimeout(timer);
      var it=items[i];prep(i);
      var shown=false;
      function show(){
        if(shown)return;shown=true;
        items.forEach(function(x){x.el.classList.remove('oc-was');});
        if(showing&&showing!==it.el){showing.classList.remove('oc-on');showing.classList.add('oc-was');var pv=showing;if(pv.tagName==='VIDEO')setTimeout(function(){try{pv.pause();}catch(e){}},1600);}
        it.el.style.animation='none';void it.el.offsetWidth;it.el.style.animation='';
        it.el.classList.add('oc-on');showing=it.el;cur=i;
        if(it.t==='v'){
          var dur=(it.el.duration&&isFinite(it.el.duration))?it.el.duration*1000:15000;mark(dur);
          it.el.onended=next;
          timer=setTimeout(next,dur+4000);/* safety */
        }else{mark(DUR);timer=setTimeout(next,DUR);setTimeout(function(){prep(cur+1);},4000);}
      }
      if(it.t==='v'){
        var v=it.el;v.onended=null;
        try{v.currentTime=0;}catch(e){}
        var late=false;
        /* slow network: keep the video loading in the background, show the next slide meanwhile, and switch back to the video as soon as it is ready */
        var fail=setTimeout(function(){if(!shown){late=true;if(items.length>1)go(i+1);}},12000);
        var start=function(){clearTimeout(fail);if(late){late=false;if(showing&&showing.tagName==='VIDEO')return;go(items.indexOf(it));return;}var p=v.play();if(p&&p.catch)p.catch(function(){setTimeout(function(){if(showing===v&&v.paused){clearTimeout(timer);next();}},1500);});show();};
        if(v.readyState>=3)start();else v.addEventListener('canplay',start,{once:true});
        var p=v.play();if(p&&p.catch)p.catch(function(){});
      }else{
        if(it.el.complete&&it.el.naturalWidth)show();else{it.el.addEventListener('load',show,{once:true});it.el.addEventListener('error',show,{once:true});}
      }
    }
    /* first paint: the first image (fast); videos start after the page has loaded */
    if(srcs.length){cur=startIdx;showing=items[startIdx].el;showing.classList.add('oc-on');mark(vsrc.length?0:DUR);}
    function kick(){
      if(vsrc.length)go(0);
      else if(items.length>1){timer=setTimeout(next,DUR);setTimeout(function(){prep(cur+1);},6000);}
    }
    if(d.readyState==='complete')setTimeout(kick,800);else window.addEventListener('load',function(){setTimeout(kick,800);});
    /* pause videos while the hero is off screen */
    if('IntersectionObserver' in window&&vsrc.length){
      new IntersectionObserver(function(es){es.forEach(function(en){if(showing&&showing.tagName==='VIDEO'){if(en.isIntersecting){var p=showing.play();if(p&&p.catch)p.catch(function(){});}else showing.pause();}});},{threshold:.05}).observe(hero);
    }
  })();

  /* ================= 5. IMAGE SLIDERS (.oc-slider galleries) ================= */
  d.querySelectorAll('.oc-slider').forEach(function(g){
    var list=imgsOf(g);if(!list.length)return;
    var s=buildSlider(list,{interval:5000,onTap:function(i){lightbox(list,i,g.parentNode.getBoundingClientRect());}});
    s.el.classList.add('oc-sl-card');
    g.style.display='none';g.parentNode.insertBefore(s.el,g.nextSibling);
  });

  /* ================= 2. TEAM ================= */
  (function(){
    var members=[].slice.call(d.querySelectorAll('.oc-member'));
    if(!members.length)return;
    var data=members.map(function(m){
      var photos=imgsOf(m.querySelector('.oc-member-photos'));
      if(!photos.length)photos=imgsOf(m);
      return {m:m,photos:photos,name:pick(m,'.oc-m-name'),role:pick(m,'.oc-m-role'),more:m.querySelector('.oc-member-more')};
    });
    data.forEach(function(x,idx){
      var m=x.m;
      m.setAttribute('tabindex','0');m.setAttribute('role','button');
      m.setAttribute('aria-label',T.view+': '+(x.name||T.person));
      var fig=m.querySelector('.oc-member-photos')||m.querySelector('.wp-block-image');
      if(fig){
        var chip=el('span','oc-m-cta',ICON.eye+'<span>'+T.view+'</span>');
        fig.appendChild(chip);
        if(x.photos.length>1)fig.appendChild(el('span','oc-m-count',ICON.cam+'<b>'+x.photos.length+'</b>'));
      }
      function open(){openProfile(idx,m.getBoundingClientRect());}
      m.addEventListener('click',function(e){if(e.target.closest('a'))return;open();});
      m.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
    });
    function profileContent(x,idx){
      var c=el('div','oc-pm');
      var media=el('div','oc-pm-media oc-anim');
      if(x.photos.length){var s=buildSlider(x.photos,{thumbs:true,interval:6000,onTap:function(i){lightbox(x.photos,i);}});media.appendChild(s.el);}
      var info=el('div','oc-pm-info');
      info.appendChild(el('p','oc-pm-role oc-anim',esc(x.role)));
      info.appendChild(el('h2','oc-pm-name oc-anim',esc(x.name||T.person)));
      var det=el('div','oc-pm-details oc-anim');
      if(x.more)[].slice.call(x.more.children).forEach(function(ch){det.appendChild(ch.cloneNode(true));});
      info.appendChild(det);
      if(data.length>1){
        var nav=el('div','oc-pm-nav oc-anim');
        var pv=el('button','oc-pm-btn',ICON.l+'<span>'+T.prev+'</span>');pv.type='button';
        var nx=el('button','oc-pm-btn',ICON.r+'<span>'+T.next+'</span>');nx.type='button';
        var ct=el('span','oc-pm-count','<b>'+pad(idx+1)+'</b> / '+pad(data.length));
        pv.addEventListener('click',function(){swap(idx-1,-1);});
        nx.addEventListener('click',function(){swap(idx+1,1);});
        nav.appendChild(pv);nav.appendChild(ct);nav.appendChild(nx);info.appendChild(nav);
      }
      c.appendChild(media);c.appendChild(info);
      return c;
    }
    var current=null;
    function openProfile(idx,from){
      var x=data[idx];
      var box=el('div','oc-pm-wrap');box.appendChild(profileContent(x,idx));
      current=openModal(box,{cls:'oc-profile',from:from,label:x.name,onClose:function(){current=null;}});
      current.idx=idx;current.box=box;
    }
    function swap(i,dir){
      if(!current)return;
      i=(i+data.length)%data.length;
      var box=current.box,old=box.firstChild;
      old.classList.add(dir>0?'oc-out-next':'oc-out-prev');
      setTimeout(function(){
        box.innerHTML='';var n=profileContent(data[i],i);n.classList.add(dir>0?'oc-in-next':'oc-in-prev');box.appendChild(n);
        current.idx=i;current.scroll.scrollTop=0;
      },reduce?0:320);
    }

    /* department filter tabs */
    var depts=[].slice.call(d.querySelectorAll('.oc-dept'));
    if(depts.length>1){
      var first=depts[0];
      var tabs=el('div','oc-tabs');tabs.setAttribute('role','tablist');
      var ind=el('span','oc-tabs-ind');tabs.appendChild(ind);
      var defs=[{label:T.all,n:members.length,show:null}].concat(depts.map(function(dp){return {label:pick(dp,'.oc-dept-title'),n:dp.querySelectorAll('.oc-member').length,show:dp};}));
      var btns=defs.map(function(df,i){
        var bt=el('button','oc-tab'+(i?'':' oc-on'),esc(df.label)+' <small>'+df.n+'</small>');bt.type='button';bt.setAttribute('role','tab');
        bt.addEventListener('click',function(){
          btns.forEach(function(x){x.classList.remove('oc-on');x.setAttribute('aria-selected','false');});bt.classList.add('oc-on');bt.setAttribute('aria-selected','true');moveInd();
          depts.forEach(function(dp){
            var on=!df.show||df.show===dp;
            if(on){dp.classList.remove('oc-gone');dp.querySelectorAll('.oc-stagger').forEach(reanimate);reanimate(dp);}
            else dp.classList.add('oc-gone');
          });
        });
        tabs.appendChild(bt);return bt;
      });
      function moveInd(){var a=tabs.querySelector('.oc-tab.oc-on');if(!a)return;ind.style.width=a.offsetWidth+'px';ind.style.transform='translateX('+(a.offsetLeft)+'px)';}
      first.parentNode.insertBefore(tabs,first);
      setTimeout(moveInd,50);window.addEventListener('resize',moveInd);
      if(d.fonts&&d.fonts.ready)d.fonts.ready.then(moveInd);
      depts.forEach(function(dp){var t=dp.querySelector('.oc-dept-title.'+(isAr?'oc-txt-ar':'oc-txt-en'))||dp.querySelector('.oc-dept-title');if(t)t.appendChild(el('span','oc-dept-n',' '+dp.querySelectorAll('.oc-member').length));});
    }
  })();

  /* ================= 3+4. PROJECT FOLDERS (static + dynamic portfolio) ================= */
  (function(){
    var cache={};
    function fetchProject(id){
      if(cache[id])return cache[id];
      cache[id]=fetch('/wp-json/oc/v1/project/'+id,{credentials:'same-origin'}).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){
        return {photos:(j.photos||[]).map(function(p){return {src:p.src,full:p.full,alt:p.alt||''};}),vids:j.videos||[]};
      }).catch(function(){delete cache[id];return {photos:[],vids:[]};});
      return cache[id];
    }
    function openFolder(info,from){
      var c=el('div','oc-fm');
      var head=el('header','oc-fm-head');
      head.innerHTML='<div class="oc-fm-bg" style="background-image:url(\''+String(info.cover||'').replace(/'/g,'%27')+'\')"></div><div class="oc-fm-head-in">'+(info.loc?'<p class="oc-fm-kicker oc-anim">'+ICON.pin+'<span>'+esc(info.loc)+'</span></p>':'')+'<h2 class="oc-fm-title oc-anim">'+esc(info.name)+'</h2>'+(info.date?'<p class="oc-fm-date oc-anim">'+esc(info.date)+'</p>':'')+(info.desc?'<p class="oc-fm-desc oc-anim">'+esc(info.desc)+'</p>':'')+'</div>';
      c.appendChild(head);
      var tabs=el('div','oc-fm-tabs oc-anim');
      var tP=el('button','oc-fm-tab oc-on',ICON.cam+T.photos+' <small>'+(info.nP!=null?info.nP:'')+'</small>');tP.type='button';
      var tV=el('button','oc-fm-tab',ICON.play+T.videos+' <small>'+(info.nV!=null?info.nV:'')+'</small>');tV.type='button';
      var ind=el('span','oc-fm-ind');
      tabs.appendChild(ind);tabs.appendChild(tP);tabs.appendChild(tV);
      c.appendChild(tabs);
      var pane=el('div','oc-fm-pane');c.appendChild(pane);
      var grid=null,vg=null,which='p',ready=false;
      function build(data){
        var photos=data.photos,vids=data.vids;
        tP.querySelector('small').textContent=photos.length;tV.querySelector('small').textContent=vids.length;
        grid=el('div','oc-pgrid');
        photos.forEach(function(ph,i){
          var bt=el('button','oc-ptile');bt.type='button';bt.style.setProperty('--i',i);bt.setAttribute('aria-label',T.slide+' '+(i+1));
          var im=el('img');im.loading='lazy';im.alt=ph.alt;im.src=ph.src;bt.appendChild(im);
          bt.addEventListener('click',function(){lightbox(photos,i,bt.getBoundingClientRect());});
          grid.appendChild(bt);
        });
        if(!photos.length)grid.appendChild(el('p','oc-fm-empty',T.noPh));
        vg=vids.length?vidGrid(vids):emptyVideos();
        ready=true;show(which);
      }
      function show(w){
        which=w;
        tP.classList.toggle('oc-on',w!=='v');tV.classList.toggle('oc-on',w==='v');
        var a=w==='v'?tV:tP;ind.style.width=a.offsetWidth+'px';ind.style.transform='translateX('+a.offsetLeft+'px)';
        if(!ready){pane.innerHTML='<div class="oc-fm-loading"><i></i><i></i><i></i></div>';return;}
        pane.innerHTML='';var node=w==='v'?vg:grid;pane.appendChild(node);
        node.classList.remove('oc-in');void node.offsetWidth;node.classList.add('oc-in');
      }
      tP.addEventListener('click',function(){show('p');});
      tV.addEventListener('click',function(){show('v');});
      openModal(c,{cls:'oc-folder',from:from,label:info.name,onClose:function(){if(location.hash==='#project-'+info.id&&history.replaceState)history.replaceState(null,'',location.pathname+location.search);}});
      setTimeout(function(){show('p');},30);
      if(info.data)build(info.data);
      else if(info.id)fetchProject(info.id).then(function(dt){setTimeout(function(){build(dt);},reduce?0:380);});
      else build({photos:[],vids:[]});
    }
    function wire(node,open){
      node.setAttribute('tabindex','0');node.setAttribute('role','button');
      node.addEventListener('click',function(e){if(e.target.closest('a'))return;open();});
      node.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
      if(node.dataset.id){var pre=function(){fetchProject(node.dataset.id);};node.addEventListener('pointerenter',pre,{once:true});node.addEventListener('focus',pre,{once:true});}
    }
    function metaRow(nP,nV){return el('div','oc-pmeta','<span>'+ICON.cam+'<b>'+nP+'</b> '+T.photos+'</span>'+(nV?'<span>'+ICON.play+'<b>'+nV+'</b> '+T.videos+'</span>':'')+'<em>'+T.open+'</em>');}
    function fanOf(srcs){var fan=el('div','oc-fan');fan.setAttribute('aria-hidden','true');srcs.slice(0,3).forEach(function(s,i){var im=el('img');im.loading='lazy';im.alt='';im.src=s;im.style.setProperty('--f',i);fan.appendChild(im);});return fan;}
    var byId={};
    function setupProject(p){
      if(p.dataset.ocReady)return;p.dataset.ocReady='1';
      var dyn=p.classList.contains('oc-pj');
      var coverImg=p.querySelector('.oc-project-cover img');
      var info={name:pick(p,'.oc-p-name'),loc:pick(p,'.oc-p-loc'),desc:pick(p,'.oc-p-desc'),date:pick(p,'.oc-p-date')};
      var fanSrc,nP,nV;
      if(dyn){
        info.id=p.dataset.id;nP=+p.dataset.photos||0;nV=+p.dataset.videos||0;info.nP=nP;info.nV=nV;
        fanSrc=(p.dataset.fan||'').split('|').filter(Boolean);
        info.cover=coverImg?bestSrc(coverImg):'';
      }else{
        var photos=imgsOf(p.querySelector('.oc-project-photos'));
        var vids=collectVideos(p.querySelector('.oc-project-videos'));
        info.data={photos:photos,vids:vids};nP=photos.length;nV=vids.length;info.nP=nP;info.nV=nV;
        fanSrc=photos.map(function(x){return x.src;});
        info.cover=coverImg?bestSrc(coverImg):(photos[0]&&photos[0].src)||'';
      }
      p.setAttribute('aria-label',T.open+': '+info.name);
      p.insertBefore(fanOf(fanSrc),p.firstChild);
      (p.querySelector('.oc-project-body')||p).appendChild(metaRow(nP,nV));
      wire(p,function(){openFolder(info,p.getBoundingClientRect());});
      if(info.id)byId[info.id]=function(){openFolder(info,p.getBoundingClientRect());};
    }
    d.querySelectorAll('.oc-project').forEach(setupProject);
    /* home-page mini mosaic */
    d.querySelectorAll('.oc-pj-mini').forEach(function(f){
      var im=f.querySelector('img');
      var info={id:f.dataset.id,name:pick(f,'.oc-p-name'),loc:f.dataset.place||'',desc:f.dataset.desc||'',cover:im?bestSrc(im):'',nP:+f.dataset.photos||0,nV:+f.dataset.videos||0};
      f.setAttribute('aria-label',T.open+': '+info.name);
      f.appendChild(el('span','oc-pj-badge',ICON.cam+'<b>'+info.nP+'</b>'+(info.nV?ICON.play+'<b>'+info.nV+'</b>':'')));
      wire(f,function(){openFolder(info,f.getBoundingClientRect());});
    });

    /* portfolio search + filters (server side, loads 6 at a time) */
    d.querySelectorAll('.oc-pf-wrap').forEach(function(w){
      var grid=w.querySelector('.oc-pj-grid');if(!grid)return;
      var api=w.dataset.api,lang=w.dataset.lang||(isAr?'ar':'en'),per=+w.dataset.per||6,all=+w.dataset.total||0;
      var q=w.querySelector('.oc-pf-search input');
      var sel={};w.querySelectorAll('select[data-f]').forEach(function(s){sel[s.dataset.f]=s;});
      var cnt=w.querySelector('.oc-pf-count'),empty=w.querySelector('.oc-pf-empty');
      var moreW=w.querySelector('.oc-pf-more-wrap'),more=w.querySelector('.oc-pf-more');
      var page=1,reqId=0,busy=false;
      function v(k){return sel[k]?sel[k].value:'';}
      function params(pg){var o={lang:lang,per:per,page:pg,q:q?q.value.trim():'',loc:v('loc'),y:v('year'),m:v('month'),sort:v('sort')||'new',_:Date.now()};return Object.keys(o).filter(function(k){return o[k]!==''&&o[k]!=null;}).map(function(k){return k+'='+encodeURIComponent(o[k]);}).join('&');}
      function addCards(html,startI){
        var tmp=el('div');tmp.innerHTML=html;var list=[].slice.call(tmp.children);
        list.forEach(function(c,i){c.style.setProperty('--i',Math.min(i,11));grid.appendChild(c);setupProject(c);void c.offsetWidth;c.classList.add('oc-pop');});
        return list.length;
      }
      function setCount(total){if(cnt)cnt.innerHTML=(cnt.dataset.tpl||'{n} / {t}').replace('{n}','<b>'+total+'</b>').replace('{t}',all);}
      function setMore(left){if(!moreW)return;moreW.hidden=left<=0;var sm=more&&more.querySelector('small');if(sm)sm.textContent='('+left+')';}
      function load(reset){
        if(busy&&!reset)return;
        var my=++reqId;busy=true;w.classList.add('oc-pf-loading');
        if(more)more.disabled=true;
        var pg=reset?1:page+1;
        fetch(api+(api.indexOf('?')>-1?'&':'?')+params(pg),{credentials:'same-origin'}).then(function(r){return r.json();}).then(function(j){
          if(my!==reqId)return;
          if(reset){grid.innerHTML='';}
          addCards(j.html||'');page=pg;
          if(j.all)all=j.all;
          setCount(j.total||0);
          if(empty)empty.hidden=(j.total||0)>0;
          setMore(j.more||0);
        }).catch(function(){}).then(function(){if(my===reqId){busy=false;w.classList.remove('oc-pf-loading');if(more)more.disabled=false;}});
      }
      var tm;
      if(q)q.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(function(){load(true);},350);});
      Object.keys(sel).forEach(function(k){sel[k].addEventListener('change',function(){load(true);});});
      if(more)more.addEventListener('click',function(){load(false);});
    });

    /* open a folder from #project-ID links */
    function fromHash(){var m=location.hash.match(/^#project-(\d+)$/);if(m&&byId[m[1]])setTimeout(byId[m[1]],600);}
    fromHash();window.addEventListener('hashchange',fromHash);
  })();

  /* ================= TEAM SEARCH ================= */
  (function(){
    var wrap=d.querySelector('.oc-team-dyn');if(!wrap)return;
    var cards=[].slice.call(wrap.querySelectorAll('.oc-member'));if(cards.length<7)return;
    var box=el('label','oc-tsearch','<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><input type="search">');
    var inp=box.querySelector('input');var ph=isAr?'ابحث باسم الموظف أو المنصب':'Search by name or role';inp.placeholder=ph;inp.setAttribute('aria-label',ph);
    var tabs=wrap.querySelector('.oc-tabs');wrap.insertBefore(box,tabs||wrap.firstChild);
    var none=el('p','oc-pf-empty',isAr?'لا يوجد موظف بهذا الاسم.':'No team member matches your search.');none.hidden=true;wrap.appendChild(none);
    inp.addEventListener('input',function(){
      var t=inp.value.toLowerCase().trim(),n=0;
      if(t&&tabs){var all=tabs.querySelector('.oc-tab');if(all&&!all.classList.contains('oc-on'))all.click();}
      cards.forEach(function(c){var ok=!t||(c.dataset.search+' '+c.textContent).toLowerCase().indexOf(t)>-1;c.classList.toggle('oc-hidden',!ok);if(ok)n++;});
      wrap.querySelectorAll('.oc-dept').forEach(function(dp){dp.classList.toggle('oc-gone-s',!dp.querySelector('.oc-member:not(.oc-hidden)'));});
      none.hidden=n>0;
    });
  })();

  /* ================= 4. VIDEO LIBRARY ================= */
  d.querySelectorAll('.oc-video-library').forEach(function(lib){
    var vids=collectVideos(lib);
    [].slice.call(lib.children).forEach(function(ch){ch.style.display='none';});
    var g=vids.length?vidGrid(vids):emptyVideos();
    
    lib.appendChild(g);
    if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){g.classList.add('oc-in');io.disconnect();}});},{threshold:.1});io.observe(g);}else g.classList.add('oc-in');
  });

  /* ================= CERTIFICATES STRIP ================= */
  d.querySelectorAll('.oc-certs').forEach(function(box){
    var track=box.querySelector('.oc-certs-track');if(!track)return;
    var orig=[].slice.call(track.children);if(!orig.length)return;
    var list=[];
    orig.forEach(function(li){var b=li.querySelector('.oc-cert-in');var f=b&&b.dataset.full;if(f){b.dataset.i=list.length;list.push({src:f,alt:b.dataset.name||''});}});
    function cloneSet(){orig.forEach(function(li){var c=li.cloneNode(true);c.setAttribute('aria-hidden','true');c.querySelectorAll('button').forEach(function(x){x.tabIndex=-1;});track.appendChild(c);});}
    /* fill at least one screen width, then double it for a seamless loop */
    var guard=0;while(track.scrollWidth<box.clientWidth+40&&guard++<12)cloneSet();
    var half=track.children.length;
    for(var i=0;i<half;i++){var c=track.children[i].cloneNode(true);c.setAttribute('aria-hidden','true');c.querySelectorAll('button').forEach(function(x){x.tabIndex=-1;});track.appendChild(c);}
    track.style.setProperty('--dur',Math.max(24,half*7)+'s');
    box.classList.add('oc-certs-on');
    track.addEventListener('click',function(e){
      var b=e.target.closest('.oc-cert-in');if(!b||!list.length)return;
      var i=+b.dataset.i;if(isNaN(i))return;
      lightbox(list,i,b.getBoundingClientRect());
    });
    if(reduce)box.classList.add('oc-certs-still');
  });

})();
