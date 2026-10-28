(function () {
  var INTERVALO = 5000; // milisegundos
  var hero = document.querySelector('.muni-hero');
  var slides = document.querySelectorAll('.hero-slide');
  if (!hero || slides.length < 2) return;

  var actual = 0;
  var timer = null;

  // Crear los puntos
  var contenedor = document.createElement('div');
  contenedor.className = 'hero-dots';
  contenedor.setAttribute('role', 'tablist');
  contenedor.setAttribute('aria-label', 'Imágenes de portada');
  var puntos = [];
  slides.forEach(function (_, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'hero-dot' + (i === 0 ? ' activo' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Ver imagen ' + (i + 1) + ' de ' + slides.length);
    b.addEventListener('click', function () { mostrar(i); reiniciar(); });
    contenedor.appendChild(b);
    puntos.push(b);
  });
  hero.appendChild(contenedor);

  function mostrar(i) {
    slides[actual].classList.remove('activo');
    puntos[actual].classList.remove('activo');
    actual = (i + slides.length) % slides.length;
    slides[actual].classList.add('activo');
    puntos[actual].classList.add('activo');
  }
  function iniciar() { timer = setInterval(function () { mostrar(actual + 1); }, INTERVALO); }
  function reiniciar() { clearInterval(timer); iniciar(); }

  iniciar();
})();

const visor = document.getElementById('img-visor');
const visorImg = document.getElementById('img-visor-src');

function abrirImagen(src) {
  visorImg.src = src;
  visor.classList.add('activo');
  document.body.style.overflow = 'hidden'; // evita scroll de fondo
}

function cerrarImagen() {
  visor.classList.remove('activo');
  document.body.style.overflow = '';
  visorImg.src = '';
}

// Cerrar con la tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarImagen();
});

// Evita que al tocar la imagen se cierre; solo cierra al tocar el fondo o la ✕
visorImg.addEventListener('click', (e) => e.stopPropagation());