// Música de fondo: el himno de Chiclín en bucle, con botón para silenciarla.
// Va en TODAS las páginas (index.html, 2023.html ... 2026.html), antes de </body>:
//   <script src="js/musica.js"></script>
// Los estilos del botón están en css/musica.css (o pega ese bloque al final de estilos-chiclin.css).
//
// Busca el audio en este orden (usa el primero que exista):
//   1) audio/himno-chiclin.mp3
//   2) video/himno-chiclin.mp4   (si no tienes el mp3, toma el sonido del video)
(function () {
  var script = document.currentScript;
  var PERSONAL = script && script.getAttribute('data-src');
  var FUENTES = [
    { src: PERSONAL || 'audio/himno-chiclin.mp3', type: PERSONAL ? '' : 'audio/mpeg' },
    { src: 'video/himno-chiclin.mp4', type: 'video/mp4' }
  ];
  var VOLUMEN = 0.35;                       // 0 a 1: sube o baja este número
  var KEY = 'chiclin-musica';               // "off" si el usuario la silenció
  var KEY_T = 'chiclin-musica-t';           // segundo por el que iba (para seguir al cambiar de página)

  function leer(k, sesion) { try { return (sesion ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } }
  function guardar(k, v, sesion) { try { (sesion ? sessionStorage : localStorage).setItem(k, v); } catch (e) {} }

  var quiere = leer(KEY) !== 'off';         // ¿quiere el usuario música? (se acuerda de su elección)
  var pausadaPorVideo = false;
  var fallo = false;

  var audio = document.createElement('audio');
  audio.loop = true;                        // bucle
  audio.preload = 'auto';
  audio.volume = VOLUMEN;
  audio.style.display = 'none';
  var fallidas = 0;
  FUENTES.forEach(function (f) {
    var s = document.createElement('source');
    s.src = f.src;
    if (f.type) s.type = f.type;
    s.addEventListener('error', function () {
      fallidas++;
      if (fallidas >= FUENTES.length) noHayAudio();
    });
    audio.appendChild(s);
  });

  var t0 = parseFloat(leer(KEY_T, true));   // sigue por donde iba en la página anterior
  if (t0 > 0) {
    audio.addEventListener('loadedmetadata', function () {
      try { audio.currentTime = t0 % audio.duration; } catch (e) {}
    }, { once: true });
  }

  /* ---------- Botón y aviso ---------- */
  var ICONO_ON = '<svg class="ico-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  var ICONO_OFF = '<svg class="ico-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor"/><path d="m16 9 6 6"/><path d="m22 9-6 6"/></svg>';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'musica-btn';
  btn.innerHTML = ICONO_ON + ICONO_OFF;

  var aviso = document.createElement('div');
  aviso.className = 'musica-aviso';
  aviso.setAttribute('role', 'status');
  var avisoTimer = null;
  function mostrarAviso(texto, ms) {
    clearTimeout(avisoTimer);
    aviso.textContent = texto;
    aviso.classList.add('visible');
    if (ms) avisoTimer = setTimeout(function () { aviso.classList.remove('visible'); }, ms);
  }
  function ocultarAviso() { clearTimeout(avisoTimer); aviso.classList.remove('visible'); }

  function noHayAudio() {
    fallo = true;
    btn.classList.add('musica-fallo');
    mostrarAviso('No se encuentra el audio. Pon el archivo en audio/himno-chiclin.mp3', 9000);
    if (window.console) console.warn('[musica.js] No se encontró audio/himno-chiclin.mp3 ni video/himno-chiclin.mp4');
  }

  function pintar() {
    btn.classList.toggle('musica-off', !quiere);
    btn.classList.toggle('musica-espera', quiere && !fallo && audio.paused && !pausadaPorVideo);
    var txt = quiere ? 'Silenciar la música' : 'Activar la música';
    btn.setAttribute('aria-label', txt);
    btn.setAttribute('title', txt);
    btn.setAttribute('aria-pressed', quiere ? 'true' : 'false');
  }

  /* ---------- Reproducir ---------- */
  function reproducir() {
    if (!quiere || pausadaPorVideo || document.hidden || fallo) return;
    var p = audio.play();
    if (p && p.catch) p.catch(function (err) {
      if (err && err.name === 'NotAllowedError') esperarToque();   // el navegador exige un primer toque
    });
  }

  var esperando = false;
  function primerToque(e) {
    if (btn.contains(e.target)) return;        // si toca el botón, lo maneja el botón
    reproducir();
  }
  function esperarToque() {
    pintar();
    if (quiere && !fallo) mostrarAviso('Toca la pantalla para escuchar el himno de Chiclín', 0);
    if (esperando) return;
    esperando = true;
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
      document.addEventListener(ev, primerToque, true);
    });
  }
  function dejarDeEsperar() {
    esperando = false;
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
      document.removeEventListener(ev, primerToque, true);
    });
  }

  /* ---------- Botón: silenciar / activar ---------- */
  btn.addEventListener('click', function () {
    if (fallo) { noHayAudio(); return; }
    if (quiere && !audio.paused) {             // suena -> silenciar
      quiere = false;
      guardar(KEY, 'off');
      audio.pause();
      ocultarAviso();
    } else {                                   // silenciada (o esperando) -> activar
      quiere = true;
      guardar(KEY, 'on');
      pausadaPorVideo = false;
      ocultarAviso();
      reproducir();
    }
    pintar();
  });

  /* ---------- Eventos ---------- */
  audio.addEventListener('playing', function () {
    dejarDeEsperar();
    ocultarAviso();
    pintar();
    if (!leer('chiclin-musica-aviso', true)) {  // aviso corto, una sola vez por visita
      guardar('chiclin-musica-aviso', '1', true);
      mostrarAviso('Suena el himno de Chiclín. Toca el botón para silenciarlo.', 5000);
    }
  });
  audio.addEventListener('pause', pintar);

  var ultimo = 0;
  audio.addEventListener('timeupdate', function () {
    var ahora = Date.now();
    if (ahora - ultimo > 1000) { ultimo = ahora; guardar(KEY_T, String(audio.currentTime), true); }
  });
  window.addEventListener('pagehide', function () { guardar(KEY_T, String(audio.currentTime), true); });

  // Si se reproduce un video de la página, la música se calla; al terminar, vuelve
  document.addEventListener('play', function (e) {
    if (e.target && e.target.tagName === 'VIDEO') { pausadaPorVideo = true; audio.pause(); pintar(); }
  }, true);
  function videoTermino(e) {
    if (e.target && e.target.tagName === 'VIDEO') { pausadaPorVideo = false; reproducir(); }
  }
  document.addEventListener('pause', videoTermino, true);
  document.addEventListener('ended', videoTermino, true);

  // Si cambia de pestaña, se pausa; al volver, continúa
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) audio.pause(); else reproducir();
  });

  /* ---------- Arranque ---------- */
  function iniciar() {
    if (window.console) console.info('[musica.js] cargado, buscando', FUENTES.map(function (f) { return f.src; }).join(' o '));
    document.body.appendChild(audio);
    document.body.appendChild(btn);
    document.body.appendChild(aviso);
    pintar();
    reproducir();
  }
  if (document.body) iniciar(); else document.addEventListener('DOMContentLoaded', iniciar);
})();