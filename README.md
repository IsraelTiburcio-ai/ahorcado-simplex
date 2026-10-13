# Ahorcado Simplex · Adivina el concepto

Microjuego educativo web para reforzar el vocabulario del **Gimnasio 3 · Método Simplex**.
Se juega en el navegador (HTML, CSS y JavaScript vanilla, sin dependencias), con diseño pensado primero para móvil (390 × 844) y adaptado a iPad y escritorio.

**Demo:** https://israeltiburcio-ai.github.io/ahorcado-simplex/

## Cómo se juega

1. Elige cuántas palabras tendrá la partida: 3, 4 o 5.
2. Cada ronda muestra una **pista académica** y la palabra oculta.
3. Elige letras con el teclado en pantalla o con el teclado físico.
4. Cada letra incorrecta detiene un **engrane** (6 intentos por palabra).
5. Al acertar, aparece una definición breve. Al fallar, se muestra la palabra correcta y una pista reforzada.
6. La partida dura como máximo **90 segundos**. Al final se muestran palabras acertadas, letras falladas, tiempo, mejor racha y un repaso de conceptos.

## Contenido

- **Banco:** 26 conceptos de los temas 3.1 a 3.6 del Gimnasio 3 (forma canónica, equivalencias, método simplex, M grande, dos fases y simplex revisado).
- **Niveles:** fáciles y medios. Cada partida incluye al menos una de cada nivel cuando tiene dos o más palabras.
- **Selección:** aleatoria en cada partida, evitando repetir las palabras de la partida anterior cuando el banco lo permite.

Los datos viven en `data.js`:

| Clave | Función |
|---|---|
| `duracionSeg` | duración máxima de la partida (90 s) |
| `rondasOpciones` / `rondasPorDefecto` | opciones de palabras por partida (3, 4, 5) y valor inicial (4) |
| `maxErrores` | intentos por palabra (6) |
| `AHORCADO_BANCO` | lista de conceptos con `palabra`, `tema`, `nivel`, `pista`, `cierre` y `refuerzo` |

## Accesibilidad

- Texto con contraste AA sobre fondo oscuro, foco visible con anillo ámbar.
- Teclado en pantalla con `aria-label` por letra, estado de acierto o fallo y navegación con flechas.
- Teclado físico: letras A–Z y Ñ. Los acentos no importan al adivinar.
- Mensajes de retroalimentación en región `aria-live`.
- `prefers-reduced-motion`: desactiva animaciones y transiciones.
- Botón de sonido silenciar/activar con `aria-pressed`. La preferencia se guarda en el navegador.

## Audio

Los efectos (tecla, acierto, error, palabra completada y fin de partida) se generan con Web Audio, sin archivos de sonido.

## Estructura

```
index.html                 pantallas: inicio, juego y resultados
styles.css                 estilos (mobile-first, iPad y escritorio)
script.js                  lógica de la partida
data.js                    configuración y banco de palabras
assets/                    favicon e icono para pantalla de inicio
.github/workflows/pages.yml publicación automática en GitHub Pages
```

## Ejecutar en local

No requiere instalación. Abre `index.html` en el navegador, o sirve la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8000
# luego visita http://localhost:8000
```

## Publicación

Cada `push` a `main` ejecuta `.github/workflows/pages.yml`, que publica `index.html`, `styles.css`, `script.js`, `data.js` y `assets/` en GitHub Pages.

## Fuente académica

Gimnasio 3 · Método Simplex, secciones 3.1 a 3.6. Las pistas, cierres y refuerzos están redactados a partir de esas secciones y deben revisarse con el docente antes de usarse en clase.
