/* Builder: runs inside the WP block editor, produces valid block markup */
window.OC=(function(){
const C=(n,a,inner)=>wp.blocks.createBlock(n,a||{},inner||[]);
const clean=o=>{Object.keys(o).forEach(k=>o[k]===undefined&&delete o[k]);return o;};
const H=html=>C('core/html',{content:html});
const G=(cls,inner,x)=>C('core/group',clean(Object.assign({className:cls,layout:{type:'default'}},x||{})),inner);
const P=(t,cls)=>C('core/paragraph',clean({content:t,className:cls}));
const Hd=(l,t,cls,anchor)=>C('core/heading',clean({level:l,content:t,className:cls,anchor}));
const Img=(m,cls,cap,lb)=>C('core/image',clean({id:m.id,url:m.url,alt:m.alt||'',sizeSlug:'large',linkDestination:'none',className:cls,caption:cap,lightbox:lb?{enabled:true}:undefined}));
const Btn=(t,u,cls,blank)=>C('core/button',clean({text:t,url:u,className:cls,linkTarget:blank?'_blank':undefined,rel:blank?'noopener':undefined}));
const Btns=(arr,cls)=>C('core/buttons',clean({className:cls}),arr);
const List=(items,cls)=>C('core/list',clean({className:cls}),items.map(t=>C('core/list-item',{content:t})));
const Cols=(cols,cls,x)=>C('core/columns',clean(Object.assign({className:cls,verticalAlignment:'center'},x||{})),cols.map(c=>C('core/column',clean({width:c.w}),c.b)));
const Cover=(m,cls,inner,minH)=>C('core/cover',clean({url:m?m.url:undefined,id:m?m.id:undefined,dimRatio:80,customOverlayColor:'#0A1C40',minHeight:minH||520,isDark:true,className:cls,tagName:'section',layout:{type:'default'}}),inner);
const Part=(slug)=>C('core/template-part',{slug,theme:window.OC_THEME});
const ser=b=>wp.blocks.serialize(Array.isArray(b)?b:[b]);
const W=(cls)=>H(`<div class="oc-waves ${cls||''}" aria-hidden="true"><span></span><span></span><span></span></div>`);
const I={
 phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3.5h3.6l1.8 4.6-2.3 1.4a11.5 11.5 0 0 0 6.4 6.4l1.4-2.3 4.6 1.8V19a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.7 2 2 0 0 1 5 3.5z"/></svg>',
 phoneF:'<svg viewBox="0 0 24 24"><path d="M5 3.5h3.6l1.8 4.6-2.3 1.4a11.5 11.5 0 0 0 6.4 6.4l1.4-2.3 4.6 1.8V19a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.7 2 2 0 0 1 5 3.5z"/></svg>',
 wa:'<svg viewBox="0 0 24 24"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.5 5 5.2-1.4A9.9 9.9 0 1 0 12.04 2zm0 18.1a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3a8.2 8.2 0 1 1 7 3.9zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>',
 mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/></svg>',
 pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.5s7-6.1 7-11.8a7 7 0 1 0-14 0c0 5.7 7 11.8 7 11.8z"/><circle cx="12" cy="9.7" r="2.6"/></svg>',
 clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
 terrain:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 19.5l6.5-11 4 6.5 2.5-3.5 6 8z"/><path d="M2.5 19.5h19"/></svg>',
 shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.8l8 3v6c0 5-3.4 8.4-8 9.6-4.6-1.2-8-4.6-8-9.6v-6z"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/></svg>',
 layers:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
 drop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/></svg>',
 pump:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>',
 pipe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h9a4 4 0 0 1 4 4v10"/><path d="M3 11h9v10"/><path d="M3 5v8M14 21h4"/></svg>',
 box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="6" width="17" height="13" rx="2"/><path d="M3.5 10h17M9 6V4h6v2"/></svg>',
 soak:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v6a8 8 0 0 1-16 0z"/><path d="M8 20l-1 2M12 20v2M16 20l1 2"/></svg>',
 plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
 up:'<svg viewBox="0 0 24 24"><path d="M12 5l7 7-1.4 1.4L13 8.8V20h-2V8.8l-4.6 4.6L5 12z"/></svg>'
};
const PHONE='+971 52 505 0340',TEL='tel:+971525050340',WA='https://wa.me/971525050340',MAIL='mailto:oceanprecast@gmail.com',EMAIL='oceanprecast@gmail.com',MAPS='https://maps.app.goo.gl/HQGjVKbfUXrCjhjC7';
return {C,H,G,P,Hd,Img,Btn,Btns,List,Cols,Cover,Part,ser,W,I,PHONE,TEL,WA,MAIL,EMAIL,MAPS,clean};
})();
