import { supabase } from '../supabase-client.js';

const islandNames = {
  'el-hierro': 'El Hierro',
  'fuerteventura': 'Fuerteventura',
  'gran-canaria': 'Gran Canaria',
  'la-gomera': 'La Gomera',
  'la-graciosa': 'La Graciosa',
  'la-palma': 'La Palma',
  'lanzarote': 'Lanzarote',
  'tenerife': 'Tenerife'
};

const deviceNames = {
  desktop: 'Ordenador',
  tablet: 'Tablet',
  mobile: 'Móvil',
  unknown: 'Sin identificar'
};

const authScreen = document.getElementById('authScreen');
const claimScreen = document.getElementById('claimScreen');
const dashboard = document.getElementById('dashboard');
const setupPanel = document.getElementById('setupPanel');
const dashboardMessage = document.getElementById('dashboardMessage');
let periodDays = 30;
let activeUser = null;
let sessionRevision = 0;

const nf = new Intl.NumberFormat('es-ES');

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function formatNumber(value) {
  return nf.format(Number(value || 0));
}

function humanizeSlug(value) {
  if (!value) return 'Sin identificar';
  return String(value).split('-').map((part) => part ? part[0].toLocaleUpperCase('es') + part.slice(1) : '').join(' ');
}

function setMessage(element, message = '', isError = false) {
  element.textContent = message;
  element.classList.toggle('error', Boolean(isError));
}

function setView(name) {
  authScreen.hidden = name !== 'auth';
  claimScreen.hidden = name !== 'claim';
  dashboard.hidden = name !== 'dashboard';
}

function setBusy(form, busy) {
  form.querySelectorAll('button,input').forEach((element) => { element.disabled = busy; });
}

async function isCurrentUserAdmin(userId) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data?.user_id);
}

async function handleSession(session) {
  const revision = ++sessionRevision;
  activeUser = session?.user || null;

  if (!activeUser) {
    setView('auth');
    return;
  }

  try {
    const admin = await isCurrentUserAdmin(activeUser.id);
    if (revision !== sessionRevision) return;

    if (!admin) {
      document.getElementById('claimEmail').textContent = activeUser.email || '';
      setView('claim');
      return;
    }

    document.getElementById('adminEmail').textContent = activeUser.email || '';
    setView('dashboard');
    await loadDashboard();
  } catch (error) {
    if (revision !== sessionRevision) return;
    setView('auth');
    setMessage(document.getElementById('loginMessage'), 'No se pudo comprobar el acceso de administrador. Inténtalo de nuevo.', true);
    console.error(error);
  }
}

function renderSummary(summary) {
  document.getElementById('kpiVisitors').textContent = formatNumber(summary.unique_visitors);
  document.getElementById('kpiPageViews').textContent = formatNumber(summary.page_views);
  document.getElementById('kpiProfiles').textContent = formatNumber(summary.profile_views);
  document.getElementById('kpiConnections').textContent = formatNumber(summary.connection_opens);
  document.getElementById('kpiSessions').textContent = formatNumber(summary.sessions);
  document.getElementById('kpiIslands').textContent = formatNumber(summary.island_opens);
  document.getElementById('kpiSearches').textContent = `${formatNumber(summary.searches)} búsquedas`;
  document.getElementById('kpiTodayViews').textContent = `${formatNumber(summary.today_page_views)} hoy`;
  document.getElementById('kpiTodayVisitors').textContent = `${formatNumber(summary.today_unique_visitors)} visitantes hoy`;
  document.getElementById('kpiVisitorsPeriod').textContent = `últimos ${periodDays} días`;
  document.getElementById('todayVisitors').textContent = formatNumber(summary.today_unique_visitors);
  document.getElementById('todayViews').textContent = formatNumber(summary.today_page_views);
}

function renderDaily(rows) {
  const container = document.getElementById('dailyChart');
  if (!rows?.length || rows.every((row) => Number(row.page_views) === 0 && Number(row.unique_visitors) === 0)) {
    container.innerHTML = '<div class="empty-state">Todavía no hay tráfico registrado en este periodo.</div>';
    return;
  }

  const max = Math.max(1, ...rows.map((row) => Number(row.page_views || 0)));
  container.innerHTML = rows.map((row) => {
    const views = Number(row.page_views || 0);
    const visitors = Number(row.unique_visitors || 0);
    const profiles = Number(row.profile_views || 0);
    const percent = Math.max(views ? 3 : 1, Math.round((views / max) * 100));
    const label = new Date(`${row.day}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    return `<div class="traffic-day" aria-label="${escapeHtml(label)}: ${views} páginas vistas">
      <span class="traffic-tooltip"><strong>${escapeHtml(label)}</strong><br>${formatNumber(views)} vistas · ${formatNumber(visitors)} visitantes<br>${formatNumber(profiles)} perfiles</span>
      <i class="traffic-bar" style="height:${percent}%;--bar-height:${percent}%"></i>
    </div>`;
  }).join('');
}

function renderRankList(containerId, rows, config) {
  const container = document.getElementById(containerId);
  if (!rows?.length) {
    container.innerHTML = '<div class="empty-state">Sin datos todavía.</div>';
    return;
  }

  container.innerHTML = rows.map((row, index) => {
    const name = config.name(row);
    const subtitle = config.subtitle(row);
    const value = config.value(row);
    const valueLabel = config.valueLabel(row);
    return `<div class="rank-row">
      <span class="rank-number">${String(index + 1).padStart(2, '0')}</span>
      <span class="rank-name"><strong>${escapeHtml(name)}</strong><small>${escapeHtml(subtitle)}</small></span>
      <span class="rank-value"><strong>${escapeHtml(value)}</strong><small>${escapeHtml(valueLabel)}</small></span>
    </div>`;
  }).join('');
}

function renderProfiles(rows) {
  renderRankList('topProfiles', rows, {
    name: (row) => row.person_name || humanizeSlug(row.person_slug),
    subtitle: (row) => `${formatNumber(row.unique_visitors)} visitantes únicos`,
    value: (row) => formatNumber(row.views),
    valueLabel: () => 'aperturas'
  });
}

function renderIslands(rows) {
  renderRankList('topIslands', rows, {
    name: (row) => islandNames[row.island_slug] || humanizeSlug(row.island_slug),
    subtitle: (row) => `${formatNumber(row.unique_visitors)} visitantes únicos`,
    value: (row) => formatNumber(row.opens),
    valueLabel: () => 'aperturas'
  });
}

function renderConnections(rows) {
  const container = document.getElementById('topConnections');
  if (!rows?.length) {
    container.innerHTML = '<div class="empty-state">Las conexiones empezarán a aparecer cuando los visitantes salten de un perfil a otro.</div>';
    return;
  }

  container.innerHTML = rows.map((row) => {
    const source = row.source_person_name || humanizeSlug(row.source_person_slug);
    const target = row.person_name || humanizeSlug(row.person_slug);
    return `<div class="connection-row">
      <span class="connection-person"><strong>${escapeHtml(source)}</strong><small>origen</small></span>
      <i class="connection-arrow" aria-hidden="true"></i>
      <span class="connection-person"><strong>${escapeHtml(target)}</strong><small>descubrimiento</small></span>
      <strong class="connection-count">${formatNumber(row.opens)}</strong>
    </div>`;
  }).join('');
}

function renderBreakdown(containerId, rows, labelFormatter) {
  const container = document.getElementById(containerId);
  if (!rows?.length) {
    container.innerHTML = '<div class="empty-state">Sin datos todavía.</div>';
    return;
  }

  const max = Math.max(1, ...rows.map((row) => Number(row.events || 0)));
  container.innerHTML = rows.slice(0, 8).map((row) => {
    const percent = Math.max(2, Math.round((Number(row.events || 0) / max) * 100));
    return `<div class="breakdown-row">
      <span class="breakdown-label"><strong>${escapeHtml(labelFormatter(row.label))}</strong><span class="breakdown-meter"><i style="width:${percent}%"></i></span></span>
      <span class="breakdown-value">${formatNumber(row.events)}<small>${formatNumber(row.unique_visitors)} visitantes</small></span>
    </div>`;
  }).join('');
}

async function loadDashboard() {
  setMessage(dashboardMessage, 'Actualizando estadísticas…');
  document.getElementById('refreshButton').disabled = true;

  try {
    const [summaryResult, dailyResult, profilesResult, islandsResult, connectionsResult, breakdownResult] = await Promise.all([
      supabase.rpc('admin_analytics_summary', { days: periodDays }),
      supabase.rpc('admin_daily_traffic', { days: periodDays }),
      supabase.rpc('admin_top_profiles', { days: periodDays, limit_n: 10 }),
      supabase.rpc('admin_top_islands', { days: periodDays, limit_n: 8 }),
      supabase.rpc('admin_top_connections', { days: periodDays, limit_n: 10 }),
      supabase.rpc('admin_traffic_breakdown', { days: periodDays })
    ]);

    const results = [summaryResult, dailyResult, profilesResult, islandsResult, connectionsResult, breakdownResult];
    const failure = results.find((result) => result.error);
    if (failure) throw failure.error;

    renderSummary(summaryResult.data?.[0] || {});
    renderDaily(dailyResult.data || []);
    renderProfiles(profilesResult.data || []);
    renderIslands(islandsResult.data || []);
    renderConnections(connectionsResult.data || []);

    const breakdown = breakdownResult.data || [];
    renderBreakdown('deviceBreakdown', breakdown.filter((row) => row.dimension === 'device'), (label) => deviceNames[label] || humanizeSlug(label));
    renderBreakdown('referrerBreakdown', breakdown.filter((row) => row.dimension === 'referrer'), (label) => label === 'Directo' ? 'Acceso directo' : label);

    setMessage(dashboardMessage, `Datos actualizados · últimos ${periodDays} días`);
  } catch (error) {
    console.error(error);
    setMessage(dashboardMessage, 'No se pudieron cargar las estadísticas. Revisa la conexión y vuelve a intentarlo.', true);
  } finally {
    document.getElementById('refreshButton').disabled = false;
  }
}

const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setBusy(loginForm, true);
  const message = document.getElementById('loginMessage');
  setMessage(message, 'Comprobando acceso…');

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  setBusy(loginForm, false);
  if (error) {
    setMessage(message, 'Correo o contraseña incorrectos.', true);
    return;
  }
  setMessage(message, '');
  await handleSession(data.session);
});

const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setBusy(signupForm, true);
  const message = document.getElementById('signupMessage');
  setMessage(message, 'Creando usuario…');

  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const { data, error } = await supabase.auth.signUp({ email, password });

  setBusy(signupForm, false);
  if (error) {
    setMessage(message, error.message || 'No se pudo crear el usuario.', true);
    return;
  }

  if (data.session) {
    setMessage(message, 'Usuario creado. Ya puedes activar el acceso de administrador.');
    await handleSession(data.session);
  } else {
    setMessage(message, 'Usuario creado. Revisa el correo de confirmación y después vuelve aquí para iniciar sesión.');
  }
});

document.getElementById('showSetup').addEventListener('click', () => {
  setupPanel.hidden = false;
  document.getElementById('signupEmail').value = document.getElementById('loginEmail').value;
  setupPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.getElementById('hideSetup').addEventListener('click', () => {
  setupPanel.hidden = true;
});

const claimForm = document.getElementById('claimForm');
claimForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setBusy(claimForm, true);
  const message = document.getElementById('claimMessage');
  setMessage(message, 'Activando acceso…');

  const setupCode = document.getElementById('claimCode').value.trim();
  const { data, error } = await supabase.rpc('claim_admin', { setup_code: setupCode });

  setBusy(claimForm, false);
  if (error || data !== true) {
    setMessage(message, 'El código no es válido, ha caducado o ya fue utilizado.', true);
    return;
  }

  document.getElementById('claimCode').value = '';
  setMessage(message, 'Administrador activado.');
  const { data: sessionData } = await supabase.auth.getSession();
  await handleSession(sessionData.session);
});

async function logout() {
  await supabase.auth.signOut();
  activeUser = null;
  sessionRevision += 1;
  setView('auth');
  setMessage(document.getElementById('loginMessage'), 'Sesión cerrada.');
}

document.getElementById('claimLogout').addEventListener('click', logout);
document.getElementById('logoutButton').addEventListener('click', logout);
document.getElementById('refreshButton').addEventListener('click', loadDashboard);

document.querySelectorAll('[data-days]').forEach((button) => {
  button.addEventListener('click', () => {
    periodDays = Number(button.dataset.days) || 30;
    document.querySelectorAll('[data-days]').forEach((item) => item.classList.toggle('active', item === button));
    loadDashboard();
  });
});

supabase.auth.onAuthStateChange((_event, session) => {
  queueMicrotask(() => handleSession(session));
});

const { data: initialSession } = await supabase.auth.getSession();
await handleSession(initialSession.session);
