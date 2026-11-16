/* Pantalla de acceso con código de verificación — se activa añadiendo en el <head> de la web:
   <script src="acceso.js"></script>
   Foto opcional (imagen0): guarda imagen0.jpg (o .png, .webp...) en la misma carpeta. */
(function () {
  // ===== CÓDIGOS PERMITIDOS (aquí cambias el código) =====
  // Cada número es la huella de un código válido (no se guarda el código en texto legible).
  // Abre generar-clave.html, escribe el código nuevo y pega aquí el número que te da.
  // Puedes dejar varios, separados por comas, para tener varios códigos a la vez.
  var CODIGOS = [
    5832463380557608
  ];

  // Si ya entró en esta sesión, no hace nada (evita parpadeos)
  try { if (sessionStorage.getItem('acceso-ok') === '1') { return; } } catch (e) {}

  function hash(str, seed) {
    seed = seed || 0;
    var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (var i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  function norm(v) { return v.trim().toLowerCase(); } // ignora mayúsculas/minúsculas

  // Estilos (se aplican ya, antes de que se pinte la página)
  var css =
    'html.bloqueado body{overflow:hidden}' +
    'html.bloqueado body > *:not(#acceso){filter:blur(10px);pointer-events:none;user-select:none}' +
    '#acceso{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(128,128,128,.15);font-family:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.5}' +
    /* Tarjeta blanca con la barra degradada rojo → negro arriba */
    '#acceso .caja{width:100%;max-width:360px;background:#fff;color:#111;border:1px solid #d9dbe0;border-radius:6px;padding:0 24px 26px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.15)}' +
    '#acceso .caja::before{content:"";display:block;height:12px;margin:0 -24px 22px;background:linear-gradient(90deg,#d90921 0%,#100f0f 100%)}' +
    /* imagen0: hueco pequeño; con foto, toma su proporción */
    '#acceso .foto{width:96px;margin:0 auto 16px;border-radius:4px;overflow:hidden;background:#f1f2f4}' +
    '#acceso .foto:not(:has(img[src])){aspect-ratio:1/1}' +
    '#acceso .foto:has(img[src]){background:transparent}' +
    '#acceso .foto img{width:100%;height:auto;max-height:96px;object-fit:contain;display:block}' +
    '#acceso .foto img:not([src]){display:none}' +
    /* Título en negrita con la línea roja debajo */
    '#acceso h2{margin:0 0 14px;padding-bottom:10px;font-size:1.125rem;font-weight:700;color:#050505;text-align:left;border-bottom:2px solid #db0921}' +
    '#acceso label{display:block;margin:12px 0 4px;font-size:.85rem;color:#374151}' +
    '#acceso input{width:100%;box-sizing:border-box;font:inherit;font-size:1.15rem;letter-spacing:.15em;text-transform:uppercase;text-align:center;color:#111;background:#fff;border:1px solid #d9dbe0;border-radius:6px;padding:11px 12px}' +
    '#acceso input:focus{outline:2px solid rgba(219,9,33,.25);border-color:#db0921}' +
    '#acceso button[type=submit]{width:100%;margin-top:18px;font:inherit;font-weight:600;color:#fff;background:#db0921;border:0;border-radius:6px;padding:11px;cursor:pointer}' +
    '#acceso button[type=submit]:hover{background:#b80a1e}' +
    '#acceso .error{margin:12px 0 0;font-size:.85rem;color:#b80a1e}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
  document.documentElement.classList.add('bloqueado');

  function bloquearHijos(activo) {
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el.id === 'acceso') { return; }
      if (activo) { el.setAttribute('inert', ''); } else { el.removeAttribute('inert'); }
    });
  }

  function iniciar() {
    var cont = document.createElement('div');
    cont.id = 'acceso';
    cont.setAttribute('role', 'dialog');
    cont.setAttribute('aria-modal', 'true');
    cont.setAttribute('aria-labelledby', 'acceso-titulo');
    cont.innerHTML =
      '<form class="caja" autocomplete="off">' +
        /* imagen0: foto de la pantalla de acceso */
        '<div class="foto" id="imagen0"><img alt=""></div>' +
        '<label for="acc-codigo">Código de verificación</label>' +
        '<input id="acc-codigo" type="text" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" required>' +
        '<p class="error" role="alert" hidden>Código incorrecto.</p>' +
        '<button type="submit">Entrar</button>' +
      '</form>';
    document.body.appendChild(cont);
    bloquearHijos(true);

    // Foto: prueba varias extensiones de imagen0
    var img = cont.querySelector('img'), ext = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'JPG', 'JPEG', 'PNG'], i = 0;
    img.onerror = function () {
      i++;
      if (i < ext.length) { img.src = 'imagen0.' + ext[i]; }
      else { img.removeAttribute('src'); img.onerror = null; }
    };
    img.src = 'imagen0.' + ext[0];

    var codigo = cont.querySelector('#acc-codigo');
    var error = cont.querySelector('.error');
    codigo.focus();

    cont.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var h = hash(norm(codigo.value));
      if (CODIGOS.indexOf(h) !== -1) {
        try { sessionStorage.setItem('acceso-ok', '1'); } catch (e2) {}
        document.documentElement.classList.remove('bloqueado');
        bloquearHijos(false);
        cont.remove();
      } else {
        error.hidden = false;
        codigo.value = '';
        codigo.focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
