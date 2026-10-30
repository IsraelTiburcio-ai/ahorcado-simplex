/* Ahorcado Simplex · lógica del juego (JavaScript vanilla, sin dependencias) */
(function () {
  'use strict';

  var CFG = window.AHORCADO_CONFIG;
  var BANCO = window.AHORCADO_BANCO;
  var LETRAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  var CLAVE_SILENCIO = 'ahorcado-simplex:silencio';
  var CLAVE_RONDAS = 'ahorcado-simplex:rondas';
  var NS_SVG = 'http://www.w3.org/2000/svg';

  // ---------- Utilidades ----------
  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }
  function plural(n, uno, varios) { return n === 1 ? uno : varios; }

  function movimientoPermitido() {
    return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Letra base sin acentos (Ó → O). La Ñ se conserva como letra propia.
  function baseDe(ch) {
    var mayus = ch.toLocaleUpperCase('es');
    if (mayus === 'Ñ') return 'Ñ';
    return mayus.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function barajar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function formatoTiempo(ms, redondeoArriba) {
    var seg = redondeoArriba ? Math.ceil(ms / 1000) : Math.floor(ms / 1000);
    if (seg < 0) seg = 0;
    var m = Math.floor(seg / 60);
    var s = seg % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function reanimar(nodo, clase) {
    nodo.classList.remove(clase);
    void nodo.offsetWidth; // fuerza un reflujo para reiniciar la animación
    nodo.classList.add(clase);
  }

  // ---------- Sonido (Web Audio sintetizado; no requiere archivos) ----------
  var Sonido = (function () {
    var silenciado = false;
    try { silenciado = localStorage.getItem(CLAVE_SILENCIO) === '1'; } catch (e) { silenciado = false; }
    var ctx = null;

    function contexto() {
      if (silenciado) return null;
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try { ctx = new AC(); } catch (e) { return null; }
      }
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      return ctx;
    }

    function nota(c, freq, t0, dur, tipo, vol, freqFinal) {
      var osc = c.createOscillator();
      var g = c.createGain();
      osc.type = tipo;
      osc.frequency.setValueAtTime(freq, t0);
      if (freqFinal) osc.frequency.exponentialRampToValueAtTime(freqFinal, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    }

    function reproducir(fn) {
      var c = contexto();
      if (!c) return;
      try { fn(c, c.currentTime + 0.01); } catch (e) { /* audio no disponible */ }
    }

    var api = {
      silenciado: function () { return silenciado; },
      alternar: function () {
        silenciado = !silenciado;
        try { localStorage.setItem(CLAVE_SILENCIO, silenciado ? '1' : '0'); } catch (e) { /* sin almacenamiento */ }
        if (!silenciado) api.tecla();
        return silenciado;
      },
      tecla: function () {
        reproducir(function (c, t) { nota(c, 1400, t, 0.035, 'triangle', 0.06, 900); });
      },
      acierto: function () {
        reproducir(function (c, t) {
          nota(c, 660, t, 0.12, 'sine', 0.13);
          nota(c, 990, t + 0.09, 0.16, 'sine', 0.12);
        });
      },
      error: function () {
        reproducir(function (c, t) { nota(c, 230, t, 0.24, 'sawtooth', 0.07, 120); });
      },
      completada: function () {
        reproducir(function (c, t) {
          var notas = [523.25, 659.25, 783.99, 1046.5];
          for (var i = 0; i < notas.length; i++) nota(c, notas[i], t + i * 0.09, 0.2, 'triangle', 0.12);
        });
      },
      fin: function () {
        reproducir(function (c, t) {
          nota(c, 392, t, 0.45, 'sine', 0.08);
          nota(c, 523.25, t, 0.45, 'sine', 0.08);
          nota(c, 659.25, t, 0.55, 'sine', 0.08);
        });
      }
    };
    return api;
  })();

  // ---------- Referencias del DOM ----------
  var el = {
    pantallas: {
      inicio: $('#pantalla-inicio'),
      juego: $('#pantalla-juego'),
      resultados: $('#pantalla-resultados')
    },
    btnMute: $('#btn-mute'),
    txtMute: $('#txt-mute'),
    iconoMute: $('#icono-mute'),
    btnSalir: $('#btn-salir'),
    opciones: $('#opciones-rondas'),
    btnEmpezar: $('#btn-empezar'),
    totalBanco: $('#total-banco'),
    hud: $('#hud'),
    rondaTxt: $('#txt-ronda'),
    progreso: $('#progreso'),
    tiempoTxt: $('#txt-tiempo'),
    barraTiempo: $('#barra-tiempo'),
    chipAciertos: $('#chip-aciertos'),
    chipFallos: $('#chip-fallos'),
    chipRacha: $('#chip-racha'),
    pistaTema: $('#pista-tema'),
    pistaTexto: $('#pista-texto'),
    palabra: $('#palabra'),
    maquinaWrap: $('#maquina-wrap'),
    maquina: $('#maquina'),
    intentos: $('#txt-intentos'),
    mensaje: $('#mensaje'),
    teclado: $('#teclado'),
    panel: $('#panel-ronda'),
    panelTitulo: $('#panel-titulo'),
    panelPista: $('#panel-pista'),
    panelTexto: $('#panel-texto'),
    btnSiguiente: $('#btn-siguiente'),
    resTitulo: $('#res-titulo'),
    stAciertos: $('#st-aciertos'),
    stLetras: $('#st-letras'),
    stTiempo: $('#st-tiempo'),
    stRacha: $('#st-racha'),
    recap: $('#recap'),
    recapNota: $('#recap-nota'),
    btnReplay: $('#btn-replay'),
    btnInicio: $('#btn-inicio')
  };

  var resultsBridge = window.OptiLabResults ? window.OptiLabResults.create('ahorcado-simplex') : { start: function () {}, complete: function () {}, cancel: function () {} };

  // ---------- Estado de la partida ----------
  var estado = {
    pantalla: 'inicio',
    rondasTotal: CFG.rondasPorDefecto,
    palabras: [],
    indice: -1,
    ronda: null,
    aciertos: 0,
    letrasFalladas: 0,
    letrasIntentadas: 0,
    racha: 0,
    mejorRacha: 0,
    inicioMs: 0,
    tiempoUsadoMs: 0,
    timer: null,
    recap: [],
    recientes: [],
    motivoFin: null
  };

  // ---------- Selección de palabras ----------
  function elegirPalabras(n) {
    var disponibles = BANCO.filter(function (p) { return estado.recientes.indexOf(p.id) === -1; });
    var pool = barajar(disponibles.length >= n ? disponibles : BANCO);
    var elegidas = [];
    var temas = {};

    function tomar(filtro) {
      for (var i = 0; i < pool.length; i++) {
        if (filtro(pool[i])) {
          elegidas.push(pool[i]);
          temas[pool[i].tema] = true;
          pool.splice(i, 1);
          return true;
        }
      }
      return false;
    }

    // Mezcla de niveles: al menos una fácil y una media cuando la partida tiene 2 o más palabras
    if (n >= 2) {
      tomar(function (p) { return p.nivel === 'facil'; });
      tomar(function (p) { return p.nivel === 'media'; });
    }
    // Procura temas distintos dentro de la partida
    while (elegidas.length < n && pool.length) {
      if (!tomar(function (p) { return !temas[p.tema]; })) {
        tomar(function () { return true; });
      }
    }
    return barajar(elegidas);
  }

  // ---------- Ronda: creación y render de la palabra ----------
  function crearRonda(entrada) {
    var caracteres = [];
    var letrasUnicas = {};
    for (var i = 0; i < entrada.palabra.length; i++) {
      var ch = entrada.palabra.charAt(i);
      if (ch === ' ') {
        caracteres.push({ ch: ' ', base: null, espacio: true });
      } else {
        var base = baseDe(ch);
        caracteres.push({ ch: ch, base: base, espacio: false });
        letrasUnicas[base] = true;
      }
    }
    return {
      entrada: entrada,
      caracteres: caracteres,
      letrasUnicas: letrasUnicas,
      acertadas: {},
      falladas: [],
      fichas: [],
      activa: true,
      resultado: null
    };
  }

  function renderPalabra(r) {
    var cont = el.palabra;
    cont.innerHTML = '';
    cont.classList.remove('is-completa');
    var letras = 0;
    var espacios = 0;
    r.caracteres.forEach(function (c) { if (c.espacio) espacios++; else letras++; });
    cont.setAttribute('data-n', String(letras + espacios * 0.5));
    cont.setAttribute('data-huecos', String(Math.max(0, r.caracteres.length - 1)));
    r.fichas = r.caracteres.map(function (c) {
      var nodo = document.createElement('span');
      if (c.espacio) {
        nodo.className = 'ficha ficha--espacio';
        nodo.setAttribute('aria-hidden', 'true');
        cont.appendChild(nodo);
        return null;
      }
      nodo.className = 'ficha';
      var letra = document.createElement('span');
      letra.className = 'ficha__letra';
      nodo.appendChild(letra);
      cont.appendChild(nodo);
      return { nodo: nodo, letra: letra };
    });
    ajustarPalabra();
    actualizarAriaPalabra(r);
  }

  // Calcula el tamaño de cada ficha para que la palabra quepa en una sola fila
  function ajustarPalabra() {
    var cont = el.palabra;
    if (!cont || !cont.clientWidth) return;
    var n = parseFloat(cont.getAttribute('data-n')) || 8;
    var huecos = parseFloat(cont.getAttribute('data-huecos')) || 0;
    var gap = parseFloat(window.getComputedStyle(cont).columnGap) || 5;
    var max = parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue('--tile-max')) || 54;
    var tile = Math.min(max, (cont.clientWidth - huecos * gap) / n);
    tile = Math.max(18, Math.floor(tile));
    cont.style.setProperty('--tile', tile + 'px');
  }

  var rafRedimension = 0;
  function alRedimensionar() {
    if (rafRedimension) return;
    rafRedimension = window.requestAnimationFrame(function () {
      rafRedimension = 0;
      ajustarPalabra();
    });
  }

  function revelarBase(r, base, clase) {
    r.caracteres.forEach(function (c, i) {
      if (c.espacio || c.base !== base) return;
      var f = r.fichas[i];
      f.letra.textContent = c.ch;
      f.nodo.classList.add(clase);
      if (movimientoPermitido()) reanimar(f.nodo, 'pop');
    });
  }

  // Al terminar sin acertar, muestra las letras que faltaban
  function revelarRestantes(r) {
    r.caracteres.forEach(function (c, i) {
      if (c.espacio) return;
      var f = r.fichas[i];
      if (!f.letra.textContent) {
        f.letra.textContent = c.ch;
        f.nodo.classList.add('is-final');
      }
    });
  }

  function totalLetras(r) {
    var n = 0;
    r.caracteres.forEach(function (c) { if (!c.espacio) n++; });
    return n;
  }

  function actualizarAriaPalabra(r) {
    var descubiertas = 0;
    r.caracteres.forEach(function (c) { if (!c.espacio && r.acertadas[c.base]) descubiertas++; });
    el.palabra.setAttribute('aria-label', 'Palabra oculta de ' + totalLetras(r) + ' letras. Letras descubiertas: ' + descubiertas + '.');
  }

  function todasDescubiertas(r) {
    for (var base in r.letrasUnicas) {
      if (Object.prototype.hasOwnProperty.call(r.letrasUnicas, base) && !r.acertadas[base]) return false;
    }
    return true;
  }

  // ---------- Teclado ----------
  function renderTeclado() {
    el.teclado.innerHTML = '';
    LETRAS.forEach(function (letra) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tecla';
      b.textContent = letra;
      b.setAttribute('data-letra', letra);
      b.setAttribute('aria-label', 'Letra ' + letra);
      b.addEventListener('click', function () { intentar(letra); });
      el.teclado.appendChild(b);
    });
  }

  function teclaDe(letra) {
    return $('.tecla[data-letra="' + letra + '"]', el.teclado);
  }

  function resetTeclado() {
    $$('.tecla', el.teclado).forEach(function (b) {
      var letra = b.getAttribute('data-letra');
      b.className = 'tecla';
      b.removeAttribute('aria-disabled');
      b.setAttribute('aria-label', 'Letra ' + letra);
    });
  }

  function marcarTecla(letra, acierto) {
    var b = teclaDe(letra);
    if (!b) return;
    b.classList.add(acierto ? 'is-acierto' : 'is-fallo');
    b.setAttribute('aria-disabled', 'true');
    b.setAttribute('aria-label', 'Letra ' + letra + (acierto ? ', acertada' : ', fallada'));
  }

  function mostrarTeclado(verTeclado) {
    el.teclado.hidden = !verTeclado;
    el.panel.hidden = verTeclado;
  }

  // ---------- Máquina de engranes (intentos) ----------
  function renderMaquina() {
    el.maquina.innerHTML = '';
    for (var i = 0; i < CFG.maxErrores; i++) {
      var svg = document.createElementNS(NS_SVG, 'svg');
      svg.setAttribute('class', 'engrane' + (i % 2 === 1 ? ' engrane--inv' : ''));
      svg.setAttribute('viewBox', '0 0 48 48');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      var use = document.createElementNS(NS_SVG, 'use');
      use.setAttribute('href', '#i-engrane');
      svg.appendChild(use);
      el.maquina.appendChild(svg);
    }
    el.maquinaWrap.classList.remove('is-ganada');
  }

  function pararEngrane(indice) {
    var gs = $$('.engrane', el.maquina);
    if (gs[indice]) gs[indice].classList.add('is-parado');
  }

  function sacudirMaquina() {
    if (movimientoPermitido()) reanimar(el.maquina, 'sacudida');
  }

  function actualizarIntentos() {
    var usados = estado.ronda ? estado.ronda.falladas.length : 0;
    var quedan = CFG.maxErrores - usados;
    el.intentos.textContent = 'Intentos: ' + quedan + ' / ' + CFG.maxErrores;
  }

  // ---------- Mensajes ----------
  function setMensaje(texto, tipo) {
    el.mensaje.textContent = texto;
    el.mensaje.className = 'mensaje mensaje--' + tipo;
  }

  // ---------- HUD y temporizador ----------
  function renderProgreso() {
    el.progreso.innerHTML = '';
    for (var i = 0; i < estado.rondasTotal; i++) {
      var s = document.createElement('span');
      s.className = 'progreso__seg';
      el.progreso.appendChild(s);
    }
  }

  function actualizarHud() {
    var total = estado.rondasTotal;
    var numero = Math.max(1, Math.min(estado.indice + 1, total));
    el.rondaTxt.textContent = 'Ronda ' + numero + ' de ' + total;
    var hechas = estado.recap.length;
    var activa = !!(estado.ronda && estado.ronda.activa);
    $$('.progreso__seg', el.progreso).forEach(function (seg, i) {
      seg.classList.toggle('is-hecha', i < hechas);
      seg.classList.toggle('is-actual', activa && i === estado.indice);
    });
    el.chipAciertos.textContent = estado.aciertos + ' de ' + total;
    el.chipFallos.textContent = String(estado.letrasFalladas);
    el.chipRacha.textContent = String(estado.racha);
  }

  function actualizarTiempo() {
    var total = CFG.duracionSeg * 1000;
    var restante = total - (Date.now() - estado.inicioMs);
    if (restante <= 0) {
      finPartida('tiempo');
      return;
    }
    var fraccion = restante / total;
    el.tiempoTxt.textContent = formatoTiempo(restante, true);
    el.barraTiempo.style.transform = 'scaleX(' + fraccion.toFixed(4) + ')';
    el.hud.setAttribute('data-zona', fraccion <= 0.15 ? 'critico' : (fraccion <= 0.33 ? 'alerta' : 'normal'));
  }

  function iniciarTemporizador() {
    detenerTemporizador();
    estado.inicioMs = Date.now();
    actualizarTiempo();
    estado.timer = window.setInterval(actualizarTiempo, 200);
  }

  function detenerTemporizador() {
    if (estado.timer !== null) {
      window.clearInterval(estado.timer);
      estado.timer = null;
    }
  }

  // ---------- Flujo de ronda ----------
  function iniciarRonda(entrada) {
    var r = crearRonda(entrada);
    estado.ronda = r;
    renderPalabra(r);
    el.pistaTema.textContent = entrada.tema + ' · ' + (entrada.nivel === 'facil' ? 'Nivel fácil' : 'Nivel medio');
    el.pistaTexto.textContent = entrada.pista;
    resetTeclado();
    renderMaquina();
    actualizarIntentos();
    setMensaje('Elige una letra. Tienes ' + CFG.maxErrores + ' intentos.', 'neutral');
    mostrarTeclado(true);
    actualizarHud();
    el.pistaTexto.focus({ preventScroll: true });
  }

  function intentar(letra) {
    var r = estado.ronda;
    if (estado.pantalla !== 'juego' || !r || !r.activa) return;
    Sonido.tecla();

    if (r.acertadas[letra] || r.falladas.indexOf(letra) !== -1) {
      setMensaje('Ya probaste la letra ' + letra + '. Elige otra.', 'aviso');
      return;
    }

    estado.letrasIntentadas++;
    if (r.letrasUnicas[letra]) {
      r.acertadas[letra] = true;
      var veces = 0;
      r.caracteres.forEach(function (c) { if (!c.espacio && c.base === letra) veces++; });
      revelarBase(r, letra, 'is-revelada');
      marcarTecla(letra, true);
      actualizarAriaPalabra(r);
      if (todasDescubiertas(r)) {
        finRonda('ok');
      } else {
        setMensaje('Bien: la letra ' + letra + ' aparece ' + veces + ' ' + plural(veces, 'vez', 'veces') + '.', 'ok');
        Sonido.acierto();
      }
    } else {
      r.falladas.push(letra);
      estado.letrasFalladas++;
      marcarTecla(letra, false);
      pararEngrane(r.falladas.length - 1);
      sacudirMaquina();
      actualizarIntentos();
      Sonido.error();
      var quedan = CFG.maxErrores - r.falladas.length;
      if (quedan <= 0) {
        finRonda('fallo');
      } else {
        setMensaje('No está: ' + letra + '. Te quedan ' + quedan + ' ' + plural(quedan, 'intento', 'intentos') + '.', 'error');
      }
    }
    actualizarHud();
  }

  function registrarRecap(r, resultado) {
    var e = r.entrada;
    estado.recap.push({
      id: e.id,
      palabra: e.palabra,
      tema: e.tema,
      pista: e.pista,
      cierre: e.cierre,
      refuerzo: e.refuerzo,
      resultado: resultado
    });
  }

  function finRonda(resultado) {
    var r = estado.ronda;
    if (!r || !r.activa) return;
    r.activa = false;
    r.resultado = resultado;
    var e = r.entrada;
    if (resultado === 'ok') {
      estado.aciertos++;
      estado.racha++;
      if (estado.racha > estado.mejorRacha) estado.mejorRacha = estado.racha;
      el.palabra.classList.add('is-completa');
      el.maquinaWrap.classList.add('is-ganada');
      setMensaje('¡Palabra completada!', 'ok');
      Sonido.completada();
    } else {
      estado.racha = 0;
      revelarRestantes(r);
      setMensaje('Se agotaron los intentos. La palabra era ' + e.palabra + '.', 'error');
    }
    registrarRecap(r, resultado);
    mostrarPanelRonda(resultado);
    actualizarHud();
  }

  function mostrarPanelRonda(resultado) {
    var e = estado.ronda.entrada;
    var esUltima = estado.indice >= estado.palabras.length - 1;
    el.panel.className = 'panel-ronda card is-' + (resultado === 'ok' ? 'ok' : 'fallo');
    if (resultado === 'ok') {
      el.panelTitulo.textContent = 'Palabra completada';
      el.panelPista.hidden = true;
      el.panelPista.textContent = '';
      el.panelTexto.textContent = e.cierre;
    } else {
      el.panelTitulo.textContent = 'La palabra era ' + e.palabra;
      el.panelPista.hidden = false;
      el.panelPista.textContent = 'Pista: ' + e.pista;
      el.panelTexto.textContent = e.refuerzo;
    }
    el.btnSiguiente.textContent = esUltima ? 'Ver resultados' : 'Siguiente palabra';
    mostrarTeclado(false);
    el.btnSiguiente.focus({ preventScroll: true });
  }

  function avanzarRonda() {
    var siguiente = estado.indice + 1;
    if (siguiente >= estado.palabras.length) {
      finPartida('completa');
      return;
    }
    estado.indice = siguiente;
    iniciarRonda(estado.palabras[siguiente]);
  }

  // ---------- Fin de partida ----------
  function finPartida(motivo) {
    if (estado.pantalla !== 'juego') return;
    detenerTemporizador();
    var r = estado.ronda;
    if (r && r.activa) {
      r.activa = false;
      r.resultado = 'tiempo';
      registrarRecap(r, 'tiempo');
    }
    estado.ronda = null;
    estado.motivoFin = motivo;
    estado.tiempoUsadoMs = Math.min(CFG.duracionSeg * 1000, Date.now() - estado.inicioMs);
    mostrarResultados();
    resultsBridge.complete({ reason: motivo === 'tiempo' ? 'time-limit' : 'completed', correct: estado.aciertos, total: estado.palabras.length, attempts: estado.letrasIntentadas, errors: estado.letrasFalladas, durationMs: Math.max(0, Math.round(estado.tiempoUsadoMs)) });
  }

  function crearIconoRecap(resultado) {
    var svg = document.createElementNS(NS_SVG, 'svg');
    svg.setAttribute('class', 'recap__icono');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var use = document.createElementNS(NS_SVG, 'use');
    use.setAttribute('href', resultado === 'ok' ? '#i-ok' : (resultado === 'fallo' ? '#i-no' : '#i-reloj'));
    svg.appendChild(use);
    return svg;
  }

  function mostrarResultados() {
    var total = estado.palabras.length;
    var sinJugar = total - estado.recap.length;
    el.resTitulo.textContent = estado.motivoFin === 'tiempo' ? '¡Se acabó el tiempo!' : 'Partida completa';
    el.stAciertos.textContent = estado.aciertos + ' de ' + total;
    el.stLetras.textContent = String(estado.letrasFalladas);
    el.stTiempo.textContent = formatoTiempo(estado.tiempoUsadoMs, false);
    el.stRacha.textContent = String(estado.mejorRacha);

    el.recap.innerHTML = '';
    estado.recap.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'recap__item recap__item--' + item.resultado;

      var cab = document.createElement('div');
      cab.className = 'recap__cab';
      cab.appendChild(crearIconoRecap(item.resultado));

      var nombre = document.createElement('strong');
      nombre.className = 'recap__palabra';
      nombre.textContent = item.palabra;
      cab.appendChild(nombre);

      var estadoTxt = document.createElement('span');
      estadoTxt.className = 'recap__estado';
      estadoTxt.textContent = item.resultado === 'ok' ? 'Acertada' : (item.resultado === 'fallo' ? 'Fallada' : 'Sin resolver');
      cab.appendChild(estadoTxt);

      var texto = document.createElement('p');
      texto.className = 'recap__texto';
      if (item.resultado === 'ok') {
        texto.textContent = item.cierre;
      } else if (item.resultado === 'fallo') {
        texto.textContent = item.refuerzo;
      } else {
        texto.textContent = 'Se acabó el tiempo antes de terminarla. Pista: ' + item.pista;
      }

      li.appendChild(cab);
      li.appendChild(texto);
      el.recap.appendChild(li);
    });

    if (sinJugar > 0) {
      el.recapNota.hidden = false;
      el.recapNota.textContent = sinJugar + ' ' + plural(sinJugar, 'palabra quedó', 'palabras quedaron') + ' sin jugar por el tiempo.';
    } else {
      el.recapNota.hidden = true;
      el.recapNota.textContent = '';
    }

    Sonido.fin();
    mostrarPantalla('resultados');
  }

  // ---------- Pantallas y partida ----------
  function mostrarPantalla(nombre, sinFoco) {
    Object.keys(el.pantallas).forEach(function (k) {
      el.pantallas[k].hidden = (k !== nombre);
    });
    estado.pantalla = nombre;
    el.btnSalir.hidden = (nombre !== 'juego');
    window.scrollTo(0, 0);
    if (!sinFoco) {
      var destino = el.pantallas[nombre].querySelector('[data-foco]');
      if (destino) destino.focus({ preventScroll: true });
    }
  }

  function nuevaPartida() {
    detenerTemporizador();
    var palabras = elegirPalabras(estado.rondasTotal);
    estado.palabras = palabras;
    estado.recientes = palabras.map(function (p) { return p.id; });
    estado.indice = -1;
    estado.aciertos = 0;
    estado.letrasFalladas = 0;
    estado.letrasIntentadas = 0;
    estado.racha = 0;
    estado.mejorRacha = 0;
    estado.recap = [];
    estado.ronda = null;
    estado.motivoFin = null;
    estado.tiempoUsadoMs = 0;
    resultsBridge.start();
    renderProgreso();
    mostrarPantalla('juego');
    iniciarTemporizador();
    avanzarRonda();
  }

  function renderOpciones() {
    el.opciones.innerHTML = '';
    CFG.rondasOpciones.forEach(function (n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opcion';
      b.textContent = String(n);
      b.setAttribute('data-rondas', String(n));
      b.setAttribute('aria-label', n + ' palabras por partida');
      b.setAttribute('aria-pressed', n === estado.rondasTotal ? 'true' : 'false');
      b.addEventListener('click', function () {
        estado.rondasTotal = n;
        try { localStorage.setItem(CLAVE_RONDAS, String(n)); } catch (e) { /* sin almacenamiento */ }
        $$('.opcion', el.opciones).forEach(function (o) {
          o.setAttribute('aria-pressed', o.getAttribute('data-rondas') === String(n) ? 'true' : 'false');
        });
      });
      el.opciones.appendChild(b);
    });
  }

  function actualizarMute() {
    var silencio = Sonido.silenciado();
    el.btnMute.setAttribute('aria-pressed', silencio ? 'true' : 'false');
    el.btnMute.setAttribute('aria-label', silencio ? 'Activar sonido' : 'Silenciar sonido');
    el.iconoMute.setAttribute('href', silencio ? '#i-sonido-off' : '#i-sonido-on');
  }

  function columnasTeclado() {
    var plantilla = window.getComputedStyle(el.teclado).gridTemplateColumns || '';
    var n = plantilla.split(' ').filter(Boolean).length;
    return n > 0 ? n : 7;
  }

  function enlazarEventos() {
    el.btnMute.addEventListener('click', function () {
      Sonido.alternar();
      actualizarMute();
    });

    el.btnEmpezar.addEventListener('click', nuevaPartida);
    el.btnSiguiente.addEventListener('click', avanzarRonda);
    el.btnReplay.addEventListener('click', nuevaPartida);
    el.btnInicio.addEventListener('click', function () { mostrarPantalla('inicio'); });

    el.btnSalir.addEventListener('click', function () {
      if (window.confirm('¿Salir de la partida? Se perderá el progreso de esta partida.')) {
        detenerTemporizador();
        resultsBridge.cancel();
        estado.ronda = null;
        mostrarPantalla('inicio');
      }
    });

    // Teclado físico: letras A–Z y Ñ
    document.addEventListener('keydown', function (e) {
      if (estado.pantalla !== 'juego' || e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key || '';
      if (k.length === 1 && /^[a-zñ]$/i.test(k)) {
        e.preventDefault();
        intentar(baseDe(k));
      }
    });

    // Navegación con flechas dentro del teclado en pantalla
    el.teclado.addEventListener('keydown', function (e) {
      var teclas = $$('.tecla', el.teclado);
      var i = teclas.indexOf(document.activeElement);
      if (i < 0) return;
      var cols = columnasTeclado();
      var j = null;
      if (e.key === 'ArrowRight') j = i + 1;
      else if (e.key === 'ArrowLeft') j = i - 1;
      else if (e.key === 'ArrowDown') j = i + cols;
      else if (e.key === 'ArrowUp') j = i - cols;
      if (j !== null && j >= 0 && j < teclas.length) {
        e.preventDefault();
        teclas[j].focus();
      }
    });

    window.addEventListener('resize', alRedimensionar);
    window.addEventListener('orientationchange', alRedimensionar);
  }

  function init() {
    try {
      var guardado = parseInt(localStorage.getItem(CLAVE_RONDAS), 10);
      if (CFG.rondasOpciones.indexOf(guardado) !== -1) estado.rondasTotal = guardado;
    } catch (e) { /* sin almacenamiento */ }

    renderOpciones();
    renderTeclado();
    actualizarMute();
    el.totalBanco.textContent = BANCO.length + ' conceptos del Gimnasio 3';
    enlazarEventos();
    mostrarPantalla('inicio', true);
  }

  init();
})();
