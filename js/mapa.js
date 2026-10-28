(function () {
  var DESTINO = '-7.836449,-79.162634';

  var card = document.getElementById('mapa-card');
  if (!card) return; // si la página no tiene mapa, no hace nada

  var iframe = document.getElementById('mapa-iframe');
  var btnUbi = document.getElementById('btn-mi-ubicacion');
  var btnDestino = document.getElementById('btn-ver-destino');
  var btnGoogle = document.getElementById('btn-google-maps');
  var estado = document.getElementById('mapa-estado');

  var SRC_DESTINO = iframe.src;
  var HREF_DESTINO = btnGoogle.href;

  function mostrarRuta(pos) {
    var origen = pos.coords.latitude.toFixed(6) + ',' + pos.coords.longitude.toFixed(6);
    iframe.src = 'https://maps.google.com/maps?saddr=' + origen +
                 '&daddr=' + DESTINO + '&hl=es&output=embed';
    btnGoogle.href = 'https://www.google.com/maps/dir/?api=1&origin=' + origen +
                     '&destination=' + DESTINO;
    btnUbi.hidden = true;
    btnDestino.hidden = false;
    estado.textContent = 'Ruta desde tu ubicación actual hasta el coliseo.';
  }

  function falloUbicacion(err) {
    btnUbi.hidden = false;
    btnUbi.disabled = false;
    if (err.code === 1) estado.textContent = 'No diste permiso para usar tu ubicación. Actívalo en el navegador y pulsa el botón para intentarlo otra vez.';
    else if (err.code === 3) estado.textContent = 'Tardó demasiado en obtener tu ubicación. Inténtalo de nuevo.';
    else estado.textContent = 'No se pudo obtener tu ubicación.';
  }

  // Pide la ubicación sola, cuando el mapa aparece en pantalla (una vez)
  if ('IntersectionObserver' in window) {
    var observador = new IntersectionObserver(function (entradas) {
      if (entradas[0].isIntersecting) {
        observador.disconnect();
        pedirUbicacion();
      }
    }, { threshold: 0.3 });
    observador.observe(card);
  } else {
    pedirUbicacion();
  }

  btnUbi.addEventListener('click', pedirUbicacion);

  btnDestino.addEventListener('click', function () {
    iframe.src = SRC_DESTINO;
    btnGoogle.href = HREF_DESTINO;
    btnDestino.hidden = true;
    btnUbi.hidden = false;
    btnUbi.disabled = false;
    btnUbi.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Usar mi ubicación';
    estado.textContent = '';
  });
})();