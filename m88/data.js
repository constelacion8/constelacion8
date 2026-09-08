export const islands = [
  { slug:'el-hierro', name:'El Hierro', municipalities:['El Pinar de El Hierro','Frontera','Valverde'] },
  { slug:'fuerteventura', name:'Fuerteventura', municipalities:['Antigua','Betancuria','La Oliva','Pájara','Puerto del Rosario','Tuineje'] },
  { slug:'gran-canaria', name:'Gran Canaria', municipalities:['Agaete','Agüimes','Artenara','Arucas','Firgas','Gáldar','Ingenio','La Aldea de San Nicolás','Las Palmas de Gran Canaria','Mogán','Moya','San Bartolomé de Tirajana','Santa Brígida','Santa Lucía de Tirajana','Santa María de Guía de Gran Canaria','Tejeda','Telde','Teror','Valleseco','Valsequillo de Gran Canaria','Vega de San Mateo'] },
  { slug:'la-gomera', name:'La Gomera', municipalities:['Agulo','Alajeró','Hermigua','San Sebastián de La Gomera','Valle Gran Rey','Vallehermoso'] },
  { slug:'la-graciosa', name:'La Graciosa', municipalities:[], note:'La Graciosa forma parte administrativamente del municipio de Teguise.' },
  { slug:'la-palma', name:'La Palma', municipalities:['Barlovento','Breña Alta','Breña Baja','El Paso','Fuencaliente de La Palma','Garafía','Los Llanos de Aridane','Puntagorda','Puntallana','San Andrés y Sauces','Santa Cruz de La Palma','Tazacorte','Tijarafe','Villa de Mazo'] },
  { slug:'lanzarote', name:'Lanzarote', municipalities:['Arrecife','Haría','San Bartolomé','Teguise','Tías','Tinajo','Yaiza'] },
  { slug:'tenerife', name:'Tenerife', municipalities:['Adeje','Arafo','Arico','Arona','Buenavista del Norte','Candelaria','El Rosario','El Sauzal','El Tanque','Fasnia','Garachico','Granadilla de Abona','Guía de Isora','Güímar','Icod de los Vinos','La Guancha','La Matanza de Acentejo','La Orotava','La Victoria de Acentejo','Los Realejos','Los Silos','Puerto de la Cruz','San Cristóbal de La Laguna','San Juan de la Rambla','San Miguel de Abona','Santa Cruz de Tenerife','Santa Úrsula','Santiago del Teide','Tacoronte','Tegueste','Vilaflor de Chasna'] }
];

export const totalMunicipalities = islands.reduce((sum, island)=>sum + island.municipalities.length, 0);
