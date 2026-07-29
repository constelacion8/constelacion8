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

/* Enlace discreto al panel privado y carga de la analítica propia. */
(() => {
  const footer = document.querySelector('footer');
  if (footer && !footer.querySelector('.c8-footer-admin')) {
    const link = document.createElement('a');
    link.className = 'c8-footer-admin';
    link.href = './admin/';
    link.rel = 'nofollow';
    link.textContent = 'Admin';
    footer.appendChild(link);
  }

  import('./analytics.js?v=20260727-2320').catch(() => {
    // La web debe seguir funcionando aunque la analítica no cargue.
  });
})();

/* Invitación a compartir el proyecto antes del bloque de instalación. */
(() => {
  const installSection = document.querySelector('.c8-install');
  if (!installSection || document.querySelector('.c8-share')) return;

  const shareUrl = 'https://constelacion8.com/';
  const shareTitle = 'Constelación 8 — El mapa humano de Canarias';
  const shareText = 'Descubre Constelación 8, un atlas biográfico para explorar las vidas y conexiones de personas relevantes de Canarias.';

  const section = document.createElement('section');
  section.className = 'c8-share';
  section.setAttribute('aria-labelledby', 'c8ShareTitle');
  section.innerHTML = `
    <div class="c8-share-inner">
      <div class="c8-share-card">
        <svg class="c8-share-constellation" viewBox="0 0 360 180" aria-hidden="true">
          <path d="M15 142 C72 104 114 128 158 79 S256 56 342 18"/>
          <path d="M73 37 C116 65 132 91 158 79 S214 110 278 92"/>
          <circle cx="15" cy="142" r="3"/><circle cx="73" cy="37" r="2"/><circle cx="158" cy="79" r="4"/><circle cx="278" cy="92" r="3"/><circle cx="342" cy="18" r="2"/>
        </svg>
        <div class="c8-share-copy">
          <p class="c8-share-kicker">Ayuda a que siga creciendo</p>
          <h2 id="c8ShareTitle">¿Te gusta Constelación 8? Compártela.</h2>
          <p>Cada vez que alguien la comparte, una nueva persona puede descubrir la historia de Canarias. Envíala a tus amigos, a tu familia o a tus grupos.</p>
          <div class="c8-share-apps" aria-label="Aplicaciones disponibles desde el menú de compartir">
            <span>WhatsApp</span><span>Telegram</span><span>Instagram</span><span>Correo</span>
          </div>
        </div>
        <div class="c8-share-actions">
          <div class="c8-share-symbol" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M18 8a3 3 0 1 0-2.83-4A3 3 0 0 0 15 5c0 .2.02.4.06.58L8.9 9.02a3 3 0 1 0 0 5.96l6.16 3.44A3 3 0 0 0 15 19a3 3 0 1 0 .9-2.14l-6.16-3.44c.08-.27.12-.55.12-.84 0-.3-.04-.58-.12-.85l6.16-3.43A3 3 0 0 0 18 8Z"/></svg>
          </div>
          <button class="c8-share-button" id="shareConstelacion8" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a3 3 0 1 0-2.83-4A3 3 0 0 0 15 5c0 .2.02.4.06.58L8.9 9.02a3 3 0 1 0 0 5.96l6.16 3.44A3 3 0 0 0 15 19a3 3 0 1 0 .9-2.14l-6.16-3.44c.08-.27.12-.55.12-.84 0-.3-.04-.58-.12-.85l6.16-3.43A3 3 0 0 0 18 8Z"/></svg>
            Compartir Constelación 8
          </button>
          <button class="c8-share-copy-button" id="copyConstelacion8" type="button">Copiar enlace</button>
          <p class="c8-share-hint">Se abrirá el menú de tu dispositivo con las aplicaciones que tengas instaladas.</p>
          <p class="c8-share-status" id="shareStatus" aria-live="polite"></p>
        </div>
      </div>
    </div>`;
  installSection.before(section);

  const shareButton = section.querySelector('#shareConstelacion8');
  const copyButton = section.querySelector('#copyConstelacion8');
  const status = section.querySelector('#shareStatus');

  const track = (eventType) => {
    window.C8Analytics?.track?.(eventType);
  };

  const setStatus = (message) => {
    if (!status) return;
    status.textContent = message || '';
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (_) {
      const input = document.createElement('textarea');
      input.value = shareUrl;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setStatus('Enlace copiado. Ya puedes pegarlo donde quieras.');
    track('share_copy');
  };

  const getFallbackDialog = () => {
    let dialog = document.getElementById('shareGuide');
    if (dialog) return dialog;

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    const encodedTogether = encodeURIComponent(`${shareText} ${shareUrl}`);
    const encodedTitle = encodeURIComponent(shareTitle);

    dialog = document.createElement('dialog');
    dialog.className = 'c8-share-dialog';
    dialog.id = 'shareGuide';
    dialog.setAttribute('aria-labelledby', 'shareGuideTitle');
    dialog.innerHTML = `
      <div class="c8-share-dialog-inner">
        <div class="c8-share-dialog-top">
          <div><h3 id="shareGuideTitle">Compartir Constelación 8</h3><p>Elige una aplicación o copia el enlace para enviárselo a quien quieras.</p></div>
          <button class="c8-share-dialog-close" type="button" aria-label="Cerrar">×</button>
        </div>
        <div class="c8-share-options">
          <a data-share-channel="whatsapp" href="https://wa.me/?text=${encodedTogether}" target="_blank" rel="noopener noreferrer nofollow"><strong>WhatsApp</strong><span>Enviar por chat o a un grupo</span></a>
          <a data-share-channel="telegram" href="https://t.me/share/url?url=${encodedUrl}&text=${encodedText}" target="_blank" rel="noopener noreferrer nofollow"><strong>Telegram</strong><span>Compartir con contactos o canales</span></a>
          <a data-share-channel="facebook" href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener noreferrer nofollow"><strong>Facebook</strong><span>Publicar el enlace</span></a>
          <a data-share-channel="x" href="https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}" target="_blank" rel="noopener noreferrer nofollow"><strong>X</strong><span>Compartir en tu perfil</span></a>
          <a data-share-channel="email" href="mailto:?subject=${encodedTitle}&body=${encodedTogether}"><strong>Correo</strong><span>Enviar por email</span></a>
          <button class="c8-share-option-copy" type="button"><strong>Copiar enlace</strong><span>Pegarlo en cualquier aplicación</span></button>
        </div>
      </div>`;
    document.body.appendChild(dialog);

    dialog.querySelector('.c8-share-dialog-close')?.addEventListener('click', () => dialog.close());
    dialog.querySelector('.c8-share-option-copy')?.addEventListener('click', async () => {
      await copyLink();
      dialog.close();
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.querySelectorAll('[data-share-channel]').forEach((link) => {
      link.addEventListener('click', () => track(`share_${link.dataset.shareChannel}`));
    });

    return dialog;
  };

  const openFallback = () => {
    const dialog = getFallbackDialog();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };

  shareButton?.addEventListener('click', async () => {
    if (typeof navigator.share !== 'function') {
      track('share_fallback_open');
      openFallback();
      return;
    }

    try {
      await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      setStatus('Gracias por compartir la constelación.');
      track('share_native');
    } catch (error) {
      if (error?.name === 'AbortError') return;
      track('share_fallback_open');
      openFallback();
    }
  });

  copyButton?.addEventListener('click', copyLink);
})();

/* Jerarquía editorial del directorio: los Antiguos Canarios se muestran tras la Z. */
import('./aborigenes-ordering.js?v=20260729-1012').catch(() => {
  // El directorio principal debe seguir operativo aunque este refinamiento no cargue.
});
