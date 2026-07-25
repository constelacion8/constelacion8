/* Norma editorial: el directorio muestra siempre el nombre civil/documental completo.
   El nombre habitual o alias se conserva únicamente para búsqueda y contexto biográfico. */
(function installFullNameDisplay(){
  function applyFullNames(){
    if(typeof people==='undefined')return;
    people.forEach(person=>{
      if(!person?.fullName)return;
      if(!person.alias&&person.name&&person.name!==person.fullName)person.alias=person.name;
      person.name=person.fullName;
    });
  }

  function rerenderCurrentView(){
    if(typeof renderIslandSelector==='function')renderIslandSelector();
    if(typeof c8ActiveMainArea!=='undefined'&&c8ActiveMainArea&&typeof renderMainAreaDirectory==='function'){
      renderMainAreaDirectory(c8ActiveMainArea);
      return;
    }
    if(typeof currentIsland!=='undefined'&&currentIsland&&typeof renderIslandList==='function'){
      renderIslandList();
      return;
    }
    if(typeof renderEmpty==='function')renderEmpty();
  }

  applyFullNames();
  window.addEventListener('c8:data-ready',()=>{
    applyFullNames();
    rerenderCurrentView();
  });
})();