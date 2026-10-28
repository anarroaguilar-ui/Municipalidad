// "Ver más / Ver menos" para los textos largos de la sección Gestión
(function () {
  var items = [];

  // Altura (px) que se ve antes de cortar el texto
  function limite() { return window.innerWidth <= 520 ? 140 : 150; }

  function preparar(info) {
    var parrafos = info.querySelectorAll('.gestion-desc');
    if (!parrafos.length) return;

    // Junta todos los párrafos de ese año en un solo contenedor
    var cont = document.createElement('div');
    cont.className = 'vm-contenido';
    parrafos[0].parentNode.insertBefore(cont, parrafos[0]);
    for (var i = 0; i < parrafos.length; i++) cont.appendChild(parrafos[i]);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'vm-btn';
    btn.textContent = 'Ver más';
    btn.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    cont.parentNode.insertBefore(btn, cont.nextSibling);

    var item = { cont: cont, btn: btn, card: info.closest('.gestion-card') || info };
    btn.addEventListener('click', function () { alternar(item); });
    items.push(item);
  }

  function abierto(item) { return item.cont.classList.contains('vm-abierto'); }

  // Decide si hace falta cortar el texto y muestra u oculta el botón
  function actualizar(item) {
    var cont = item.cont;
    var total = cont.scrollHeight;

    if (abierto(item)) {               // si está abierto, solo ajusta la altura
      cont.style.maxHeight = total + 'px';
      return;
    }
    if (total > limite() + 40) {
      cont.classList.add('vm-corto');
      cont.style.maxHeight = limite() + 'px';
      item.btn.hidden = false;
    } else {
      cont.classList.remove('vm-corto');
      cont.style.maxHeight = '';
      item.btn.hidden = true;
    }
  }

  function alternar(item) {
    var cont = item.cont;
    if (abierto(item)) {
      cont.classList.remove('vm-abierto');
      cont.classList.add('vm-corto');
      cont.style.maxHeight = limite() + 'px';
      item.btn.textContent = 'Ver más';
      item.btn.setAttribute('aria-expanded', 'false');
      // Si el inicio de la tarjeta quedó fuera de pantalla, vuelve a él
      if (item.card.getBoundingClientRect().top < 0) {
        item.card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      cont.classList.remove('vm-corto');
      cont.classList.add('vm-abierto');
      cont.style.maxHeight = cont.scrollHeight + 'px';
      item.btn.textContent = 'Ver menos';
      item.btn.setAttribute('aria-expanded', 'true');
    }
  }

  function actualizarTodo() { items.forEach(actualizar); }

  document.querySelectorAll('.gestion-info').forEach(preparar);
  if (!items.length) return;

  actualizarTodo();
  window.addEventListener('load', actualizarTodo);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(actualizarTodo);

  var temporizador;
  window.addEventListener('resize', function () {
    clearTimeout(temporizador);
    temporizador = setTimeout(actualizarTodo, 150);
  });
})();