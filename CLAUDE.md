# Contexto del proyecto — mi-primera-web

Rodrigo está aprendiendo desarrollo web y quiere crear **juegos para el navegador**
(sobre todo juegos educativos para aprender inglés). Habla en **español**: responde y
explica siempre en español, con pasos sencillos y concretos, sin dar por sabido nada de Git.

## Enlaces

| Qué | Enlace |
|---|---|
| Repositorio | https://github.com/Rodrigorincon93/mi-primera-web |
| Web publicada (GitHub Pages) | https://rodrigorincon93.github.io/mi-primera-web/ |
| Juego «Crónicas de Lexara» | https://rodrigorincon93.github.io/mi-primera-web/juego/ |
| Ajustes de Pages | https://github.com/Rodrigorincon93/mi-primera-web/settings/pages |
| Despliegues (pestaña Actions) | https://github.com/Rodrigorincon93/mi-primera-web/actions |
| Permisos de la app de Claude en GitHub | https://github.com/settings/installations |
| Instalar la app de Claude en un repositorio | https://github.com/apps/claude/installations/select_target |
| Reconectar GitHub con Claude | https://claude.ai/connect-github |

No guardes aquí contraseñas, tokens ni claves: este archivo es público.

## Cómo se publica

- GitHub Pages publica la rama **`main`**, carpeta **`/ (root)`**. Todo lo que llega a `main`
  aparece en la web en 1–2 minutos.
- Flujo de trabajo: Claude trabaja en una rama `claude/...`, hace push, y Rodrigo la pasa a
  `main` con un pull request (*Compare & pull request → Create pull request → Merge pull request*).
  No hacer push directo a `main` sin que Rodrigo lo pida.
- Cada juego nuevo va en su **propia carpeta** (`juego/`, `juego2/`, …) con su `index.html`,
  y se enlaza desde el `index.html` de la raíz. Su URL será
  `https://rodrigorincon93.github.io/mi-primera-web/<carpeta>/`.
- Si `git push` da **403** («Claude doesn't have GitHub access»), no es un fallo de código:
  la app de Claude no tiene permiso de escritura en el repositorio. Rodrigo debe revisar
  https://github.com/settings/installations → *Configure* en «Claude» → marcar el
  repositorio (o *All repositories*) → *Save*, y aceptar cualquier solicitud de permisos pendiente.

## Estructura actual

- `index.html`, `styles.css`, `script.js`, `Alessa.jpeg`, `Audioalessa.mp3`: la primera página
  personal de Rodrigo (con foto y audio de su hija). No borrarlos ni cambiarlos sin pedirlo.
- `juego/`: **Crónicas de Lexara**, RPG de mundo abierto para aprender inglés.
  - `data.js`: contenido (5 mundos, vocabulario, misiones, preguntas del jefe, historia).
    Para añadir o cambiar textos, preguntas o misiones, se edita solo este archivo.
  - `engine.js`: utilidades, guardado (`localStorage`, clave `lexara-save-v1`), sonido
    (Web Audio), voz en inglés (`speechSynthesis`), diálogos y minijuegos en ventanas.
  - `game.js`: generación procedural de mapas, laberintos, misiones, dibujo en `<canvas>`,
    controles (teclado + mando táctil) y bucle principal. `window.LX` expone el estado para pruebas.
  - `style.css`, `index.html`: interfaz (HUD, diálogos, menús, pantalla de título).

## Cómo se hacen los juegos (convenciones)

- **HTML + CSS + JavaScript puro**, sin frameworks ni paso de compilación, para que funcione
  subiéndolo tal cual a GitHub Pages y abriendo `index.html` con doble clic.
- Tiene que funcionar en **móvil** (mando táctil, diseño adaptable, sin hover obligatorio)
  y en ordenador (flechas/WASD, espacio, teclas numéricas en preguntas).
- Gráficos: se dibujan por código en `<canvas>` (casillas, héroe, puertas) y se usan **emojis**
  para personajes y objetos. Si se añaden imágenes, guardarlas en `<juego>/assets/` en PNG
  y con nombres en minúsculas sin espacios.
- Juegos para aprender inglés: el texto del juego va en inglés, con traducción opcional
  al español (botón «ES» / tecla T) y botón 🔊 para escuchar la pronunciación.
- Guardar el progreso en `localStorage`.
- Antes de entregar, probar con Playwright (Chromium ya está instalado en la sesión):
  una partida automatizada de principio a fin, capturas en escritorio y en móvil
  (`devices['iPhone 13']`) y comprobar que no hay errores en consola.

## Herramientas para gráficos y sonido

- **Canva** (conector ya conectado en Claude): puede generar imágenes con IA (personajes,
  fondos, objetos, portadas) y exportarlas en PNG para guardarlas en `assets/`.
- Claude también puede crear sprites y animaciones por código (canvas o SVG), como el héroe de Lexara.
- Para que Rodrigo dibuje o descargue gráficos y los suba al repositorio:
  - Piskel (https://www.piskelapp.com): editor gratis de pixel art y animaciones en el navegador.
  - Aseprite (https://www.aseprite.org): editor de pixel art y spritesheets (de pago).
  - Kenney (https://kenney.nl/assets): miles de gráficos y sonidos gratis (licencia CC0).
  - OpenGameArt (https://opengameart.org) e itch.io (https://itch.io/game-assets/free): recursos
    gratis; revisar siempre la licencia de cada uno.
