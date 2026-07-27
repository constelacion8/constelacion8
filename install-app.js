/* Instalación de Constelación 8 como PWA en Android/iPhone. */
(() => {
  const androidButton = document.getElementById('installAndroid');
  const iosButton = document.getElementById('installIOS');
  const dialog = document.getElementById('installGuide');
  const dialogTitle = document.getElementById('installGuideTitle');
  const dialogLead = document.getElementById('installGuideLead');
  const dialogSteps = document.getElementById('installGuideSteps');
  const closeButton = document.getElementById('installGuideClose');
  const status = document.getElementById('installStatus');
  let deferredPrompt = null;

  if (!androidButton || !iosButton || !dialog) return;

  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  const setStatus = (message) => {
    if (!status) return;
    status.textContent = message || '';
  };

  const openGuide = (platform) => {
    if (platform === 'ios') {
      dialogTitle.textContent = 'Instalar en iPhone';
      dialogLead.textContent = 'En iPhone la instalación se termina desde Safari. Son tres toques y Constelación 8 queda en tu pantalla de inicio como una app.';
      dialogSteps.innerHTML = `
        <div class="c8-install-step"><b>1</b><span>Abre Constelación 8 en <strong>Safari</strong> y pulsa el botón <strong>Compartir</strong>.</span></div>
        <div class="c8-install-step"><b>2</b><span>Elige <strong>Añadir a pantalla de inicio</strong>.</span></div>
        <div class="c8-install-step"><b>3</b><span>Activa <strong>Abrir como app web</strong> y pulsa <strong>Añadir</strong>.</span></div>`;
    } else {
      dialogTitle.textContent = 'Instalar en Android';
      dialogLead.textContent = 'Tu navegador todavía no ha ofrecido la instalación directa. Puedes instalarla manualmente desde el menú del navegador.';
      dialogSteps.innerHTML = `
        <div class="c8-install-step"><b>1</b><span>Abre Constelación 8 en <strong>Chrome</strong> o un navegador compatible.</span></div>
        <div class="c8-install-step"><b>2</b><span>Pulsa el menú <strong>⋮</strong> del navegador.</span></div>
        <div class="c8-install-step"><b>3</b><span>Elige <strong>Instalar aplicación</strong> o <strong>Añadir a pantalla de inicio</strong>.</span></div>`;
    }

    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    androidButton.classList.add('ready');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    androidButton.classList.remove('ready');
    setStatus('Constelación 8 ya está instalada en este dispositivo.');
  });

  androidButton.addEventListener('click', async () => {
    if (isStandalone()) {
      setStatus('Ya estás usando Constelación 8 como una app.');
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') setStatus('Instalación iniciada.');
      deferredPrompt = null;
      androidButton.classList.remove('ready');
      return;
    }

    openGuide('android');
  });

  iosButton.addEventListener('click', () => {
    if (isStandalone()) {
      setStatus('Ya estás usando Constelación 8 como una app.');
      return;
    }
    openGuide('ios');
  });

  closeButton?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js', { scope: './' }).catch(() => {});
    });
  }
})();
