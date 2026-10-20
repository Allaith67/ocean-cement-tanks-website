window.OCB=(function(){
const {C,H,G,P,Hd,Img,Btn,Btns,List,Cols,Cover,Part,ser,W,I,PHONE,TEL,WA,MAIL,EMAIL,MAPS}=OC;
const M=()=>window.OCM;
const t=l=>OCT[l];
const U=(l,slug)=>l==='ar'?(slug?'/ar-'+slug+'/':'/ar/'):(slug?'/'+slug+'/':'/');
const kick=(x)=>P(x,'oc-kicker');
const head=(l,k,h,p,cls)=>G('oc-head oc-narrow '+(cls||''),[kick(k),Hd(2,h,'oc-h2 oc-split'),p?P(p,'oc-lead oc-reveal'):null].filter(Boolean),{style:{spacing:{margin:{bottom:'48px'}}}});

/* ---------- template parts ---------- */
function loader(l){
 return ser([H(`<div class="oc-loader" aria-hidden="true"><div class="oc-tank"><img src="${M().logo.url}" alt="" width="120" height="130"></div><div class="oc-loader-name">${t(l).loading}</div><div class="oc-loader-count">0%</div><div class="oc-waves oc-loader-waves"><span></span><span></span><span></span></div></div><div class="oc-progress" aria-hidden="true"></div>`)]);
}
function header(l){
 const T=t(l);
 const nav=C('core/navigation',{overlayMenu:'mobile',className:'oc-nav',layout:{type:'flex',justifyContent:'center'}},T.nav.map(([label,url])=>C('core/navigation-link',{label,url,kind:'custom',isTopLevelLink:true})));
 return ser([G('oc-header',[G('oc-header-row',[
   H(`<a class="oc-brand" href="${U(l)}" aria-label="${T.brand}"><img src="${M().logo.url}" alt="${T.brand} logo" width="46" height="50"><span class="oc-brand-name">${T.brand}<small>${T.brandSub}</small></span></a>`),
   nav,
   G('oc-head-actions',[H(`<a class="oc-lang-btn" href="${l==='ar'?'/':'/ar/'}" hreflang="${l==='ar'?'en':'ar'}"><span class="oc-globe" aria-hidden="true"></span>${T.lang}</a>`),Btns([Btn(T.call,TEL)],'oc-call-btn')])
 ],{layout:{type:'flex',flexWrap:'nowrap',justifyContent:'space-between'}})],{tagName:'header'})]);
}
function footer(l){
 const T=t(l),F=T.foot;
 const links=T.nav.map(([a,u])=>`<p><a href="${u}">${a}</a></p>`).join('');
 const tanks=T.svc.items.map(s=>`<p><a href="${U(l,'services')}#${s[0]}">${s[2]}</a></p>`).join('');
 return ser([G('oc-footer',[
   W(''),
   H(`<div class="oc-footer-grid">
<div><a class="oc-brand" href="${U(l)}"><img src="${M().logo.url}" alt="" width="46" height="50" style="filter:brightness(0) invert(1)"><span class="oc-brand-name">${T.brand}<small>${T.brandSub}</small></span></a><p style="margin-top:18px!important;max-width:34ch">${F.about}</p></div>
<div><h4>${F.explore}</h4>${links}</div>
<div><h4>${F.tanks}</h4>${tanks}</div>
<div><h4>${F.contact}</h4><p><a href="${TEL}" dir="ltr">${PHONE}</a></p><p><a href="${WA}" target="_blank" rel="noopener">WhatsApp</a></p><p><a href="${MAIL}">${EMAIL}</a></p><p><a href="${MAPS}" target="_blank" rel="noopener">${F.addr}</a></p></div>
</div>
<div class="oc-footer-bottom"><p>${F.copy}</p><p>${F.made}</p></div>`),
   H(`<div class="oc-fab"><a class="oc-fab-top" href="#top" aria-label="${l==='ar'?'إلى الأعلى':'Back to top'}">${I.up}</a><a class="oc-fab-call" href="${TEL}" aria-label="${T.call}">${I.phoneF}</a><a class="oc-fab-wa" href="${WA}" target="_blank" rel="noopener" aria-label="WhatsApp">${I.wa}</a></div>`)
 ],{tagName:'footer'})]);
}
function cta(l){
 const T=t(l).cta;
 return ser([G('oc-section oc-cta-wrap',[G('oc-inner oc-cta oc-reveal oc-zoom',[
   Hd(2,T.h,'oc-split'),P(T.p,'oc-lead'),
   H(`<a class="oc-phone-big" href="${TEL}"><i>${I.phoneF}</i>${PHONE}</a>`),
   Btns([Btn(T.b1,WA,'oc-btn-wa',true),Btn(T.b2,U(l,'contact'),'is-style-outline')])
 ])])]);
}
function scripts(){return ser([H('<script src="/wp-content/uploads/oc/oc.js?v=1" defer></script>')]);}

/* ---------- templates ---------- */
function tpl(l,kind){
 const ar=l==='ar',T=t(l);
 const p=s=>Part(s+(ar?'-ar':''));
 let hero=[];
 if(kind!=='home'){
  hero=[C('core/cover',{useFeaturedImage:true,dimRatio:80,customOverlayColor:'#0A1C40',minHeight:kind==='contact'?420:560,isDark:true,className:'oc-page-hero'+(kind==='services'?' oc-page-hero-svc':''),tagName:'section',layout:{type:'default'}},[
   H(`<p class="oc-crumb"><a href="${U(l)}">${T.nav[0][0]}</a> &nbsp;/&nbsp; <span class="oc-crumb-here"></span></p>`),
   C('core/post-title',{level:1,className:'oc-split'}),
   C('core/post-excerpt',{className:'oc-hero-sub',moreText:''})
  ]),W('oc-up')];
 }
 const main=G('oc-main',[C('core/post-content',{layout:{type:'default'}})],{tagName:'main'});
 const body=[p('oc-loader'),p('oc-header'),...hero,main,...(kind==='contact'?[]:[p('oc-cta')]),p('oc-footer'),Part('oc-scripts')];
 return ser(ar?[G('oc-ar',body)]:body);
}

/* ---------- reusable sections ---------- */
function stats(l){
 return G('oc-stats',[G('oc-stats-grid oc-stagger oc-count-wrap',t(l).stats.map(([n,u,d])=>G('oc-stat',[
  H(`<p class="oc-num">${/^\d+$/.test(n)?`<span data-count="${n}">0</span>`:n}${u?`<em>${u}</em>`:''}</p>`),P(d)])))]);
}
function marquee(l){const it=t(l).marquee;const s=it.concat(it).map(x=>`<span>${x}</span>`).join('');return H(`<div class="oc-marquee" aria-hidden="true"><div class="oc-marquee-track">${s}${s}</div></div>`);}
function svcCards(l,withCustom){
 const S=t(l).svc;const m=M();const img={water:m.pipeyard,'pump-rooms':m.mixer,septic:m.pipes,holding:m.blocks,soakaway:m.dig};
 const cards=S.items.map(([id,ic,h,p])=>G('oc-card',[Img(img[id],''),G('oc-card-body',[H(`<span class="oc-card-tag" aria-hidden="true">${I[ic].replace('<svg','<svg width="22" height="22"')}</span>`),Hd(3,h),P(p),P(`<a class="oc-more" href="${U(l,'services')}#${id}">${S.more}</a>`,'oc-more-p')])]));
 if(withCustom)cards.push(G('oc-card oc-card-cta oc-dark',[G('oc-card-body',[H(`<span class="oc-icon">${I.plus}</span>`),Hd(3,S.customH),P(S.customP),Btns([Btn(S.customB,U(l,'contact'))])],{style:{spacing:{padding:{top:'40px'}}}})]));
 return G('oc-cards oc-stagger',cards);
}
function steps(l){const S=t(l).steps;return [head(l,S.k,S.h,S.p),G('oc-steps oc-inner',S.items.map(([h,p],i)=>G('oc-step',[H(`<div class="oc-step-dot">${i+1}</div>`),Hd(3,h),P(p)])))];}
function why(l){const S=t(l).why;return [head(l,S.k,S.h,''),G('oc-tiles oc-inner oc-stagger',S.items.map(([ic,h,p])=>G('oc-tile',[H(`<span class="oc-icon">${I[ic]}</span>`),Hd(3,h),P(p)])))];}
function mosaic(l,caps){const m=M();const imgs=[m.excav,m.columns,m.crane,m.workers,m.wall];return G('oc-mosaic oc-inner oc-stagger',imgs.map((x,i)=>Img(x,'',caps?t(l).gal.caps[i]:undefined,true)));}
function splitAbout(l,btn){
 const A=t(l).about,m=M();
 return Cols([
  {w:'48%',b:[G('oc-split-media oc-reveal oc-left',[Img(m.workers2,''),Img(m.pipeyard,'oc-img-2'),G('oc-day-badge',[P(`<b>${A.badge1}</b>${A.badge2}`)])])]},
  {w:'52%',b:[kick(A.k),Hd(2,A.h,'oc-h2 oc-split'),P(A.p,'oc-lead oc-reveal'),List(A.checks,'oc-checks oc-stagger'),btn?Btns([Btn(A.btn,U(l,'about'))]):null].filter(Boolean)}
 ],'oc-inner',{style:{spacing:{blockGap:{left:'clamp(40px,6vw,96px)'}}}});
}

/* ---------- pages ---------- */
function home(l){
 const T=t(l),Hh=T.hero,m=M(),G2=T.gal,S=T.svc;
 const title=`${Hh.lines.map((x,i)=>`<span class="oc-line"><span${i===2?' class="oc-water"':''}>${x}</span></span>`).join('')}`;
 return ser([
  Cover(m.hero,'oc-hero alignfull',[
   P(Hh.chip,'oc-hero-chip'),
   Hd(1,title,'oc-hero-title'),
   P(Hh.sub,'oc-hero-sub'),
   Btns([Btn(Hh.b1,TEL),Btn(Hh.b2,WA,'oc-btn-wa',true),Btn(Hh.b3,U(l,'services'),'is-style-outline')]),
   H(`<div class="oc-hero-badge" aria-hidden="true"><div><b>${Hh.badgeN}</b><span>${Hh.badgeT}</span></div></div><div class="oc-scroll-cue" aria-hidden="true"><i></i>${Hh.scroll}</div>`)
  ],900),
  W('oc-up'),
  stats(l),
  marquee(l),
  G('oc-section',[splitAbout(l,true)],{style:{spacing:{padding:{top:'40px'}}}}),
  W('oc-to-foam'),
  G('oc-section oc-foam',[G('oc-inner',[head(l,S.k,S.h,S.p),svcCards(l,true)])]),
  W('oc-to-dark oc-foam-bg'),
  G('oc-section oc-dark',[...steps(l),H('<div style="height:clamp(70px,9vw,120px)"></div>'),...why(l)]),
  G('oc-section',[G('oc-inner',[head(l,G2.k,G2.h,G2.p),mosaic(l,true),Btns([Btn(G2.btn,U(l,'projects'))],'oc-center oc-reveal')])])
 ]);
}
function about(l){
 const A=t(l).pages.about,m=M();
 return ser([
  G('oc-section',[Cols([
   {w:'52%',b:[kick(A.k),Hd(2,A.h,'oc-h2 oc-split'),P(A.p1,'oc-lead oc-reveal'),P(A.p2,'oc-reveal'),List(t(l).about.checks,'oc-checks oc-stagger')]},
   {w:'48%',b:[G('oc-split-media oc-reveal oc-right',[Img(m.hardhat,''),Img(m.columns,'oc-img-2'),G('oc-day-badge',[P(`<b>${t(l).about.badge1}</b>${t(l).about.badge2}`)])])]}
  ],'oc-inner')]),
  stats(l),
  G('oc-section',[G('oc-inner',[head(l,A.vk,A.vh,''),G('oc-cards oc-stagger',A.values.map(([h,p],i)=>G('oc-tile oc-value',[H(`<span class="oc-icon">${[I.shield,I.terrain,I.clock][i]}</span>`),Hd(3,h),P(p)])))])],{className:'oc-section oc-dark'}),
  G('oc-section',[G('oc-inner',[...why(l)])])
 ]);
}
function services(l){
 const S=t(l).svc,Pg=t(l).pages.services,m=M();
 const img={water:m.pipeyard,'pump-rooms':m.mixer,septic:m.pipes,holding:m.blocks,soakaway:m.dig};
 const rows=S.items.map(([id,ic,h,p,bul],i)=>G('oc-section oc-svc-row'+(i%2?' oc-foam':''),[Cols(
   [{w:'50%',b:[G('oc-split-media oc-reveal '+(i%2?'oc-right':'oc-left'),[Img(img[id],'')])]},
    {w:'50%',b:[H(`<span class="oc-icon oc-reveal">${I[ic]}</span>`),Hd(2,h,'oc-h2 oc-split',id),P(p,'oc-lead oc-reveal'),List(bul,'oc-checks oc-stagger'),Btns([Btn(Pg.quote,U(l,'contact')),Btn(t(l).hero.b2,WA,'oc-btn-wa',true)])]}][i%2?'reverse':'slice'](),
   'oc-inner',{style:{spacing:{blockGap:{left:'clamp(40px,6vw,96px)'}}}})]));
 const faq=Pg.faq.map(([q,a],i)=>`<details${i===0?' open':''}><summary>${q}</summary><p>${a}</p></details>`).join('');
 return ser([
  G('oc-section',[G('oc-inner',[head(l,Pg.k,Pg.h,Pg.p),svcCards(l,false)])]),
  ...rows,
  G('oc-section oc-dark',steps(l)),
  G('oc-section',[G('oc-inner oc-narrow',[head(l,Pg.faqK,Pg.faqH,''),H(`<div class="oc-faq oc-reveal">${faq}</div>`)])])
 ]);
}
function projects(l){
 const Pg=t(l).pages.projects,m=M();
 const all=[m.excav,m.columns,m.crane,m.workers,m.wall,m.dig,m.pipeyard,m.mixer,m.hero,m.cranes,m.pipes,m.blocks,m.hardhat,m.workers2];
 const gal=C('core/gallery',{linkTo:'none',columns:3,imageCrop:true,className:'oc-gallery oc-stagger',sizeSlug:'large'},all.map(x=>C('core/image',{id:x.id,url:x.url,alt:x.alt||'',sizeSlug:'large',linkDestination:'none',lightbox:{enabled:true}})));
 return ser([
  G('oc-section',[G('oc-inner',[head(l,Pg.k,Pg.h,Pg.p),gal])]),
  G('oc-section oc-foam',[G('oc-inner oc-narrow',[head(l,Pg.vk,Pg.vh,''),G('oc-video-empty oc-reveal oc-zoom',[H('<div class="oc-play" aria-hidden="true"></div>'),P(Pg.vp)])])])
 ]);
}
function team(l){
 const Pg=t(l).pages.team,m=M();
 return ser([
  G('oc-section',[G('oc-inner',[head(l,Pg.k,Pg.h,Pg.p),G('oc-team oc-stagger',Pg.members.map(([im,h,r,p])=>G('oc-member',[Img(m[im],''),G('oc-member-body',[Hd(3,h),P(r,'oc-role'),P(p)])])))])]),
  G('oc-section oc-foam',[G('oc-inner oc-narrow oc-center',[Hd(2,Pg.jh,'oc-h2 oc-split'),P(`${Pg.jp} <a href="${MAIL}">${EMAIL}</a>.`,'oc-lead oc-reveal'),Btns([Btn(Pg.jb,MAIL)],'oc-center oc-reveal')])])
 ]);
}
function contact(l){
 const Pg=t(l).pages.contact,F=Pg.f,S=t(l).svc;
 const cards=Pg.cards.map(([ic,h,v,u])=>`<a class="oc-ccard" href="${u}"${/^http/.test(u)?' target="_blank" rel="noopener"':''}><span class="oc-icon">${I[ic==='wa'?'wa':ic].replace('<svg viewBox="0 0 24 24">','<svg viewBox="0 0 24 24" fill="currentColor">')}</span><h3>${h}</h3><p dir="auto">${v}</p></a>`).join('');
 const opts=S.items.map(s=>`<option>${s[2]}</option>`).join('')+`<option>${F.other}</option>`;
 const form=`<form class="oc-form oc-wa-form oc-reveal oc-left"><div class="oc-row"><div><label for="ocf-name">${F.name}</label><input id="ocf-name" name="name" required autocomplete="name"></div><div><label for="ocf-phone">${F.phone}</label><input id="ocf-phone" name="phone" type="tel" required autocomplete="tel" dir="ltr"></div></div><div class="oc-row"><div><label for="ocf-service">${F.service}</label><select id="ocf-service" name="service"><option value="">${F.choose}</option>${opts}</select></div><div><label for="ocf-loc">${F.loc}</label><input id="ocf-loc" name="location"></div></div><label for="ocf-msg">${F.msg}</label><textarea id="ocf-msg" name="message" rows="5"></textarea><div class="wp-block-buttons"><div class="wp-block-button oc-btn-wa"><button type="submit" class="wp-block-button__link wp-element-button">${F.send}</button></div></div><p class="oc-form-note">${F.note}</p></form>`;
 return ser([
  G('oc-section',[G('oc-inner',[H(`<div class="oc-contact-cards oc-stagger">${cards}</div>`)])],{style:{spacing:{padding:{top:'40px'}}}}),
  G('oc-section oc-foam',[Cols([
   {w:'55%',b:[kick(Pg.fk),Hd(2,Pg.fh,'oc-h2 oc-split'),P(Pg.fp,'oc-lead oc-reveal'),H(form)]},
   {w:'45%',b:[kick(Pg.mh),P(Pg.mp,'oc-reveal'),H(`<div class="oc-map oc-reveal oc-right"><iframe title="Map" loading="lazy" src="https://www.google.com/maps?q=Al+Sajaa+Industrial+Area,+Sharjah&output=embed" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`),Btns([Btn(Pg.mb,MAPS,'',true)],'oc-reveal')]}
  ],'oc-inner',{verticalAlignment:'top',style:{spacing:{blockGap:{left:'clamp(32px,5vw,72px)'}}}})])
 ]);
}
/* ---------- patterns (insertable blocks for the owner) ---------- */
function patterns(){
 const m=M();
 return [
  ['Ocean: Team member card',ser([G('oc-member',[Img(m.hardhat,''),G('oc-member-body',[Hd(3,'Employee name'),P('Job title','oc-role'),P('A short line about what this person does.')])])])],
  ['Ocean: Team grid (4 people)',ser([G('oc-team oc-stagger',[0,1,2,3].map(()=>G('oc-member',[Img(m.workers,''),G('oc-member-body',[Hd(3,'Employee name'),P('Job title','oc-role'),P('A short line about what this person does.')])])))])],
  ['Ocean: Service card',ser([G('oc-card',[Img(m.pipeyard,''),G('oc-card-body',[H(`<span class="oc-card-tag" aria-hidden="true">${I.drop.replace('<svg','<svg width="22" height="22"')}</span>`),Hd(3,'Service name'),P('Describe the service in one or two sentences.')])])])],
  ['Ocean: Video section',ser([G('oc-section',[G('oc-inner oc-narrow',[P('Videos','oc-kicker'),Hd(2,'Video title','oc-h2 oc-split'),G('oc-video oc-reveal oc-zoom',[C('core/video',{})])])])])],
  ['Ocean: YouTube video',ser([G('oc-video oc-reveal oc-zoom',[C('core/embed',{providerNameSlug:'youtube',type:'video',responsive:true})])])],
  ['Ocean: Photo gallery',ser([C('core/gallery',{linkTo:'none',columns:3,imageCrop:true,className:'oc-gallery oc-stagger'},[])])],
  ['Ocean: Text + image section',ser([G('oc-section',[Cols([{w:'50%',b:[P('Small label','oc-kicker'),Hd(2,'Section headline','oc-h2 oc-split'),P('Write your text here.','oc-lead oc-reveal'),Btns([Btn('Contact us','/contact/')])]},{w:'50%',b:[G('oc-split-media oc-reveal oc-right',[Img(m.excav,'')])]}],'oc-inner')])])],
  ['Ocean: Stats band',ser([stats('en')])],
  ['Ocean: Moving waves divider',ser([W('')])],
  ['Ocean: Services marquee',ser([marquee('en')])]
 ];
}
return {loader,header,footer,cta,scripts,tpl,home,about,services,projects,team,contact,patterns};
})();
