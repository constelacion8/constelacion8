/* Biografías extensas: hidrata full_bio desde Supabase y sustituye la semblanza breve cuando existe. */
(function installExtendedBiographies(){
  const biosById=new Map();
  let hydrationPromise=null;

  function esc(value){
    if(typeof escapeHtml==='function')return escapeHtml(value);
    return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function installStyles(){
    if(document.getElementById('c8ExtendedBioStyles'))return;
    const style=document.createElement('style');
    style.id='c8ExtendedBioStyles';
    style.textContent=`
      .c8-full-biography{margin:22px 0 26px;padding-top:20px;border-top:1px solid rgba(255,255,255,.1)}
      .c8-full-biography h4{margin:0 0 14px;font-family:"Work Sans",Arial,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#FFCD00}
      .c8-full-biography p{margin:0 0 15px;max-width:80ch;font-size:14px;line-height:1.78;color:#F3ECF7}
      .c8-full-biography p:last-child{margin-bottom:0}
      @media(max-width:620px){.c8-full-biography{margin-top:18px;padding-top:17px}.c8-full-biography p{font-size:13px;line-height:1.72}}
    `;
    document.head.appendChild(style);
  }

  function renderFullBiography(personId){
    const text=biosById.get(personId)||((typeof people!=='undefined'&&people.find(p=>p.id===personId))?.fullBio);
    if(!text)return;
    const profile=document.querySelector('#directory article.profile');
    if(!profile)return;
    const existing=profile.querySelector('.c8-full-biography');
    if(existing)existing.remove();
    const shortBio=profile.querySelector(':scope > .profile-bio');
    if(!shortBio)return;
    const section=document.createElement('section');
    section.className='c8-full-biography';
    const paragraphs=String(text).split(/\n\s*\n+/).map(p=>p.trim()).filter(Boolean);
    section.innerHTML=`<h4>Biografía</h4>${paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}`;
    shortBio.replaceWith(section);
  }

  function wrapOpenProfile(){
    if(window.__c8ExtendedBiographyWrapped||typeof openProfile!=='function')return;
    const original=openProfile;
    openProfile=function(id){
      original(id);
      renderFullBiography(id);
    };
    window.__c8ExtendedBiographyWrapped=true;
  }

  async function hydrate(){
    if(hydrationPromise)return hydrationPromise;
    hydrationPromise=(async()=>{
      try{
        if(typeof C8_API_URL==='undefined'||typeof C8_PUBLISHABLE_KEY==='undefined')return;
        const response=await fetch(C8_API_URL,{headers:{apikey:C8_PUBLISHABLE_KEY,Accept:'application/json'},cache:'no-store'});
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const payload=await response.json();
        for(const record of payload.people??[]){
          if(!record?.id||!record?.full_bio)continue;
          biosById.set(record.id,record.full_bio);
          if(typeof people!=='undefined'){
            const person=people.find(p=>p.id===record.id);
            if(person)person.fullBio=record.full_bio;
          }
        }
      }catch(error){
        console.error('Constelación 8: no se pudieron hidratar las biografías extensas.',error);
      }
    })();
    return hydrationPromise;
  }

  installStyles();
  wrapOpenProfile();
  hydrate().then(()=>wrapOpenProfile());
  window.addEventListener('c8:data-ready',()=>{hydrate().then(()=>wrapOpenProfile());});
})();

/* Pulido final de portada, ritmo móvil y accesos legales. */
(function loadSitePolish(){
  if(document.querySelector('script[data-c8-site-polish]'))return;
  const script=document.createElement('script');
  script.src='site-polish.js?v=20260726-0535';
  script.dataset.c8SitePolish='true';
  script.async=false;
  document.body.appendChild(script);
})();
