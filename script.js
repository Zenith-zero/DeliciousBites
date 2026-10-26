function mostrarError(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = 'block';
}
function limpiarError(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// ── WHATSAPP FLOTANTE ──
var WHATSAPP_NUMERO = '50374044263'; // código de país + número, sin + ni espacios

function abrirWhatsApp(e, textoInicial) {
  if (e && e.preventDefault) e.preventDefault();
  var panel = document.getElementById('waPanel');
  var fab = document.getElementById('waFab');
  var input = document.getElementById('wa-texto');
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  fab.classList.add('open');
  if (textoInicial) input.value = textoInicial;
  setTimeout(function () { input.focus(); }, 250);
}

function cerrarWhatsApp() {
  document.getElementById('waPanel').classList.remove('open');
  document.getElementById('waPanel').setAttribute('aria-hidden', 'true');
  document.getElementById('waFab').classList.remove('open');
}

function toggleWhatsApp() {
  if (document.getElementById('waPanel').classList.contains('open')) cerrarWhatsApp();
  else abrirWhatsApp();
}

function enviarWhatsApp() {
  var input = document.getElementById('wa-texto');
  var texto = input.value.trim() || 'Hola, quiero hacer un pedido.';
  var url = 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(texto);
  window.open(url, '_blank', 'noopener');
  input.value = '';
  cerrarWhatsApp();
}

// "Pedir" desde la tarjeta o el hero: abre el chat con el mensaje listo
function pedirProducto(e) {
  abrirWhatsApp(e, 'Hola, quiero pedir una Crepa Mixta ($1.75). ');
}

// Cerrar con Escape; Enter envía (Shift+Enter = salto de línea)
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') cerrarWhatsApp();
});
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('wa-texto').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarWhatsApp(); }
  });
});

// ── MENÚ HAMBURGUESA ──
function toggleMenu() {
  document.getElementById('hamburger').classList.toggle('open');
  document.getElementById('mobileMenu').classList.toggle('open');
  document.body.style.overflow = document.getElementById('mobileMenu').classList.contains('open') ? 'hidden' : '';
}
function cerrarMenu() {
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('mobileMenu').classList.remove('open');
  document.body.style.overflow = '';
}
// ── IR A UNA SECCIÓN (botón Ver Crepa) ──
function irA(e, id) {
  var el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  var y = el.getBoundingClientRect().top + window.pageYOffset - 70;
  try { window.scrollTo({ top: y, behavior: 'smooth' }); }
  catch (err) { window.scrollTo(0, y); }
}

// ── SCROLL ANIMATIONS ──
(function () {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  function initObserver() {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(function (el) {
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();

// ── RESEÑAS (compartidas con Firebase) ──
const firebaseConfig = {
  apiKey: "AIzaSyDCshMagZX5sMUbkumi2CQVenp6O-_5394",
  authDomain: "deliciousbites-1f4b0.firebaseapp.com",
  projectId: "deliciousbites-1f4b0",
  storageBucket: "deliciousbites-1f4b0.firebasestorage.app",
  messagingSenderId: "515997752512",
  appId: "1:515997752512:web:60fe3864d79915136fe125"
};
var db = null;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
} catch (e) { console.error('Firebase no cargó:', e); }

var estrellasSeleccionadas = 0;

function abrirModalResena() {
  var modal = document.getElementById('modal-resena');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('r-nombre').value = '';
  document.getElementById('r-producto').selectedIndex = 0;
  document.getElementById('r-texto').value = '';
  estrellasSeleccionadas = 0;
  actualizarEstrellas(0);
  ['r-error-nombre', 'r-error-producto', 'r-error-estrellas', 'r-error-texto'].forEach(limpiarError);
}

function cerrarModalResena() {
  document.getElementById('modal-resena').style.display = 'none';
  document.body.style.overflow = '';
}

function seleccionarEstrellas(val) {
  estrellasSeleccionadas = val;
  actualizarEstrellas(val);

  limpiarError('r-error-estrellas');
}

function actualizarEstrellas(val) {
  document.querySelectorAll('.estrella').forEach(function (el) {
    el.classList.toggle('activa', parseInt(el.dataset.val, 10) <= val);
  });
}

function publicarResena() {
  var nombre = document.getElementById('r-nombre').value.trim();
  var producto = document.getElementById('r-producto').value.trim();
  var texto = document.getElementById('r-texto').value.trim();

  ['r-error-nombre', 'r-error-producto', 'r-error-estrellas', 'r-error-texto'].forEach(limpiarError);
  var hayError = false;
  if (!nombre) { mostrarError('r-error-nombre'); hayError = true; }
  if (!producto) { mostrarError('r-error-producto'); hayError = true; }
  if (!estrellasSeleccionadas) { mostrarError('r-error-estrellas'); hayError = true; }
  if (!texto) { mostrarError('r-error-texto'); hayError = true; }
  if (hayError) return;

  if (!db) { alert('No se pudo conectar. Intenta de nuevo en un momento.'); return; }

  var btn = document.querySelector('#modal-resena .btn-primary');
  btn.textContent = 'Publicando...';
  btn.disabled = true;

  db.collection('resenas').add({
    nombre: nombre.slice(0, 40),
    producto: producto,
    estrellas: estrellasSeleccionadas,

    texto: texto.slice(0, 500),
    fecha: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function () {
    cerrarModalResena();
  }).catch(function (err) {
    console.error(err);
    alert('No se pudo publicar tu reseña. Intenta de nuevo.');
  }).then(function () {
    btn.textContent = '✦ Publicar Reseña';
    btn.disabled = false;
  });
}

function crearTarjetaResena(resena, indice) {
  var estrellas = '';
  for (var i = 1; i <= 5; i++) estrellas += i <= resena.estrellas ? '★' : '☆';
  var delays = ['reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3'];

  var card = document.createElement('div');
  card.className = 'resena-card reveal visible ' + delays[indice % 3];

  var stars = document.createElement('div');
  stars.className = 'resena-stars';
  stars.textContent = estrellas;

  var texto = document.createElement('p');
  texto.className = 'resena-texto';
  texto.textContent = '"' + resena.texto + '"';

  var footer = document.createElement('div');
  footer.className = 'resena-footer';


  var avatar = document.createElement('div');
  avatar.className = 'resena-avatar';
  avatar.textContent = (resena.nombre || '?').charAt(0).toUpperCase();

  var datos = document.createElement('div');
  var nombre = document.createElement('p');
  nombre.className = 'resena-nombre';
  nombre.textContent = resena.nombre;
  var producto = document.createElement('p');
  producto.className = 'resena-producto';
  producto.textContent = resena.producto;
  datos.appendChild(nombre);
  datos.appendChild(producto);

  footer.appendChild(avatar);
  footer.appendChild(datos);
  card.appendChild(stars);
  card.appendChild(texto);
  card.appendChild(footer);
  return card;
}

function cargarResenas() {
  if (!db) return;
  var grid = document.getElementById('resenas-grid');
  var empty = document.getElementById('resenas-empty');

  db.collection('resenas').orderBy('fecha', 'desc').limit(50)
    .onSnapshot(function (snap) {
      grid.querySelectorAll('.resena-card').forEach(function (c) { c.remove(); });
      empty.style.display = snap.empty ? 'block' : 'none';
      var i = 0;

      snap.forEach(function (doc) {
        grid.appendChild(crearTarjetaResena(doc.data(), i++));
      });
    }, function (err) { console.error(err); });
}

document.addEventListener('DOMContentLoaded', cargarResenas);