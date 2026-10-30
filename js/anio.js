// Páginas de año: ajusta la barra de meses al menú y marca el mes que se está viendo
(function () {
  var navbar = document.getElementById('navbar');

  // La barra de meses queda justo debajo del menú, sea cual sea su alto
  function ajustarMenu() {
    if (navbar) document.documentElement.style.setProperty('--nav-h', navbar.offsetHeight + 'px');
  }
  ajustarMenu();
  window.addEventListener('resize', ajustarMenu);
  window.addEventListener('load', ajustarMenu);

  var chips = [].slice.call(document.querySelectorAll('.mes-chip'));
  var meses = [].slice.call(document.querySelectorAll('.mes'));
  var barra = document.querySelector('.meses-nav-in');
  if (!chips.length || !meses.length || !('IntersectionObserver' in window)) return;

  var porId = {};
  chips.forEach(function (c) { porId[c.getAttribute('href').slice(1)] = c; });

  function marcar(chip) {
    chips.forEach(function (c) { c.classList.remove('activo'); });
    chip.classList.add('activo');
    if (barra) {   // en el celular, lleva el mes activo al centro de la barra
      barra.scrollTo({ left: chip.offsetLeft - barra.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' });
    }
  }

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting && porId[e.target.id]) marcar(porId[e.target.id]);
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  meses.forEach(function (m) { observador.observe(m); });
})();
