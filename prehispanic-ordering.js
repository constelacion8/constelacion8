/* Orden editorial: los perfiles prehispánicos aparecen después del directorio A–Z,
   salvo cuando el usuario entra expresamente en la categoría Aborígenes. */
(function installPrehispanicOrdering(){
  const SECTION_TITLE='Canarios prehispánicos';
  const SECTION_COPY='Sociedades indígenas de Canarias · orden alfabético';

  function normalize(value){
    return String(value??'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLocaleLowerCase('es')
      .trim();
  }

  function isPrehispanic(person){
    if(!person)return false;
    const categories=person.categories?.length?person.categories:[person.category].filter(Boolean);
    return categories.some(category=>{
      const value=normalize(category);
      return value==='aborigenes'||value.includes('prehispan');
    });
  }

  window.c8IsPrehispanicPerson=isPrehispanic;

  function ensureStyles(){
    if(document.getElementById('c8PrehispanicOrderingStyles'))return;
    const style=document.createElement('style');
    style.id='c8PrehispanicOrderingStyles';
    style.textContent=`
      .c8-prehispanic-block{
        margin-top:34px;padding-top:25px;border-top:1px solid rgba(255,205,0,.28)
      }
      .c8-prehispanic-heading{
        display:flex;align-items:flex-end;justify-content:space-between;gap:18px;
        margin:0 0 12px;padding:0 2px
      }
      .c8-prehispanic-heading strong{
        font-family:"Work Sans",Arial,sans-serif;font-size:clamp(20px,2.2vw,27px);
        line-height:1.05;font-weight:600;letter-spacing:-.035em;color:#FFCD00
      }
      .c8-prehispanic-heading small{
        font-size:10px;line-height:1.4;letter-spacing:.08em;text-transform:uppercase;
        color:#9F8FAE;text-align:right
      }
      .c8-prehispanic-block .people-list{
        border-color:rgba(255,205,0,.16)
      }
      @media(max-width:620px){
        .c8-prehispanic-block{margin-top:28px;padding-top:21px}
        .c8-prehispanic-heading{display:block;margin-bottom:10px}
        .c8-prehispanic-heading strong{display:block;font-size:21px}
        .c8-prehispanic-heading small{display:block;margin-top:6px;text-align:left;font-size:9px}
      }
    `;
    document.head.appendChild(style);
  }

  function personForRow(row){
    const id=row.dataset.person||row.dataset.areaPerson;
    if(!id||typeof people==='undefined')return null;
    return people.find(person=>String(person.id)===String(id))??null;
  }

  function separateRows(rowSelector){
    const directory=document.getElementById('directory');
    if(!directory||typeof people==='undefined')return;

    const rows=[...directory.querySelectorAll(rowSelector)];
    if(!rows.length)return;

    const prehispanicRows=rows.filter(row=>isPrehispanic(personForRow(row)));
    if(!prehispanicRows.length)return;

    const firstBlock=rows[0].closest('.alpha-block');
    const host=firstBlock?.parentElement;
    if(!host)return;

    host.querySelector('.c8-prehispanic-block')?.remove();

    const touchedBlocks=new Set(prehispanicRows.map(row=>row.closest('.alpha-block')).filter(Boolean));
    const block=document.createElement('div');
    block.className='c8-prehispanic-block';
    block.innerHTML=`
      <div class="c8-prehispanic-heading">
        <strong>${SECTION_TITLE}</strong>
        <small>${SECTION_COPY}</small>
      </div>
      <div class="people-list c8-prehispanic-list"></div>`;

    const list=block.querySelector('.c8-prehispanic-list');
    prehispanicRows.forEach(row=>list.appendChild(row));
    touchedBlocks.forEach(alphaBlock=>{
      if(!alphaBlock.querySelector('.person-row'))alphaBlock.remove();
    });
    host.appendChild(block);
  }

  function explicitPrehispanicFilter(){
    if(typeof currentCategory==='undefined')return false;
    const category=normalize(currentCategory);
    return category==='aborigenes'||category.includes('prehispan');
  }

  function wrapIslandDirectory(){
    if(window.__c8PrehispanicIslandWrapped||typeof window.renderIslandList!=='function')return false;
    const base=window.renderIslandList;
    window.renderIslandList=function(...args){
      const result=base.apply(this,args);
      if(!explicitPrehispanicFilter())separateRows('[data-person]');
      return result;
    };
    window.__c8PrehispanicIslandWrapped=true;
    return true;
  }

  function wrapCategoryDirectory(){
    if(window.__c8PrehispanicCategoryWrapped||typeof window.renderMainAreaDirectory!=='function')return false;
    const base=window.renderMainAreaDirectory;
    window.renderMainAreaDirectory=function(...args){
      const result=base.apply(this,args);
      separateRows('[data-area-person]');
      return result;
    };
    window.__c8PrehispanicCategoryWrapped=true;
    return true;
  }

  ensureStyles();
  let attempts=0;
  const timer=setInterval(()=>{
    attempts++;
    const islandReady=wrapIslandDirectory();
    const categoryReady=wrapCategoryDirectory();
    if((window.__c8PrehispanicIslandWrapped&&window.__c8PrehispanicCategoryWrapped)||attempts>160){
      clearInterval(timer);
    }
  },50);

  window.addEventListener('c8:data-ready',()=>{
    wrapIslandDirectory();
    wrapCategoryDirectory();
  });
})();
