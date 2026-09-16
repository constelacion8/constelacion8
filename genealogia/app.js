import { supabase } from '../supabase-client.js';
console.info('Archivo genealógico inicializado');
const status = document.getElementById('loginStatus');
if (status) status.textContent = 'Preparando acceso privado…';