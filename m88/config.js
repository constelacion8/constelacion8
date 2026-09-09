export const SUPABASE_URL = 'https://kvoldyeinvjajsimxmyc.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_AjQQNYKbCwaGNv_o1GopAw_TzyLkHXh';

if (typeof document !== 'undefined') {
  import('./agenda.js?v=20260909-1').catch(error=>console.warn('Agenda no disponible',error));
  import('./municipal-map.js?v=20260909-municipios1').catch(error=>console.warn('Mapa municipal no disponible',error));
}
