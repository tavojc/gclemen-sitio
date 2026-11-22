// ============================================================
// menu-sesion.js — El botón de ingreso del encabezado
// ============================================================
// Se usa en cualquier página que tenga en el encabezado:
//   <a id="boton-sesion" class="boton-sesion" href="/ingresar.html">Ingresar</a>
// y al final del <body>:
//   <script type="module" src="js/menu-sesion.js"></script>
//
// Sin sesión: el botón dice "Ingresar" y lleva a ingresar.html.
// Con sesión: muestra la inicial y el primer nombre, y lleva a mi-cuenta.html.
// ============================================================

import { alCambiarSesion, leerMiProgreso, XP_POR_NIVEL } from "./sesion.js";

const boton = document.getElementById("boton-sesion");
const franja = document.getElementById("franja-progreso"); // solo existe en index.html

alCambiarSesion(async (usuario) => {
  if (!boton) return;

  if (!usuario) {
    boton.classList.remove("conectado");
    boton.href = "/ingresar.html";
    boton.textContent = "Ingresar";
    if (franja) franja.hidden = true;
    return;
  }

  // "Juan Pablo Pérez" -> "Juan"
  const nombreCompleto = usuario.nombre || (usuario.esDocente ? "Profe" : "Estudiante");
  const primerNombre = nombreCompleto.split(" ")[0];

  boton.classList.add("conectado");
  boton.href = "/mi-cuenta.html";
  boton.innerHTML = "";                       // vaciamos el botón…
  const inicial = document.createElement("span");
  inicial.className = "inicial";
  inicial.textContent = primerNombre[0].toUpperCase();
  boton.append(inicial, primerNombre);        // …y ponemos inicial + nombre

  // Franja "Tu progreso" en la página de inicio
  if (franja) {
    const progreso = await leerMiProgreso();
    const xp = progreso.reduce((suma, p) => suma + (p.xp || 0), 0);
    const nivel = Math.floor(xp / XP_POR_NIVEL) + 1;
    document.getElementById("franja-nombre").textContent = `Hola, ${primerNombre}`;
    document.getElementById("franja-nivel").textContent = `Nivel ${nivel} · toca para ver tu progreso`;
    document.getElementById("franja-xp").textContent = `${xp} XP`;
    franja.hidden = false;
  }
});
