// Formulaire du prospect (en étapes) et personnalisation par #nom-du-prospect
(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const open=document.getElementById('open'),f=document.getElementById('f'),thanks=document.getElementById('thanks');
  const steps=[...f.querySelectorAll('.step')];let cur=0;
  const show=i=>{cur=i;steps.forEach((s,k)=>s.hidden=k!==i);const first=steps[i].querySelector('select,input,textarea');if(first)first.focus({preventScroll:true});steps[i].scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});};
  open.addEventListener('click',()=>{f.hidden=false;thanks.hidden=true;open.setAttribute('aria-expanded','true');show(0);});
  f.addEventListener('click',e=>{if(e.target.matches('[data-next]'))show(cur+1);if(e.target.matches('[data-prev]'))show(cur-1);});
  f.addEventListener('submit',e=>{e.preventDefault();
    const nom=f.nom.value.trim(),em=f.email.value.trim(),ok=nom&&/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em);
    document.getElementById('err').hidden=!!ok;if(!ok)return;
    f.hidden=true;thanks.hidden=false;open.setAttribute('aria-expanded','false');thanks.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});});
})();

// Personalised demo: the link can end with #nom-du-prospect (e.g. #boulangerie-marin)
(()=>{
  const raw=decodeURIComponent((location.hash||'').slice(1)).trim();
  const ok=/^[a-z0-9\u00C0-\u017F-]{2,60}$/i.test(raw)&&!/^(settings|sidebar|customize|upgrade|downloads|comment-.*|julien|meet)$/i.test(raw);
  const name=ok?raw.split('-').filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join(' '):'';
  const apply=()=>{
    document.querySelectorAll('.who').forEach(e=>e.textContent=name||e.dataset.who);
    const q=document.querySelector('.who-q');if(q)q.textContent=name?', '+name:'';
    const by=document.getElementById('byline');by.textContent=name?'Démo préparée par Julien pour '+name:by.dataset.defaut;
  };apply();
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const g=document.getElementById('g'),okb=document.getElementById('g-ok'),book=document.getElementById('book'),talk=document.getElementById('talk'),send=document.getElementById('g-send');
  const open=(label)=>{g.hidden=false;okb.hidden=true;book.setAttribute('aria-expanded','true');send.textContent=label;document.getElementById('g-nom').focus({preventScroll:true});g.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});};
  if(book.tagName==='BUTTON')book.addEventListener('click',()=>open('Demander mon diagnostic'));
  talk.addEventListener('click',()=>open('Proposer un échange'));
  g.addEventListener('submit',e=>{e.preventDefault();const n=g.nom.value.trim(),c=g.contact.value.trim();const good=n&&c.length>=6;
    document.getElementById('g-err').hidden=!!good;if(!good)return;g.hidden=true;okb.hidden=false;book.setAttribute('aria-expanded','false');});
})();
