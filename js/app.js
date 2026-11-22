// ============================================================
// app.js — Lo que comparten todas las pantallas del estudiante
// ============================================================
// - Exige la sesión (si no hay, manda a ingresar.html).
// - Dibuja la barra de abajo (Inicio, Progreso, Perfil).
// - Calcula XP, nivel, racha e insignias a partir del progreso.
//
// Cada pantalla lo usa así:
//   import { iniciarPantalla } from "./js/app.js";
//   iniciarPantalla("inicio", (usuario, resumen) => { ...pintar... });
// ============================================================

import { exigirSesion, leerMiProgreso, leerMisDias, calcularRacha, XP_POR_NIVEL } from "./sesion.js";
import { GRADOS } from "./contenido.js";

// --- Íconos (dibujos SVG de línea, sin descargar nada) ----------
const svg = (trazos, tam = 22) =>
  `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${trazos}</svg>`;

export const ICONOS = {
  inicio:   svg('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>'),
  progreso: svg('<path d="M4 20V4"/><path d="M4 20h16"/><path d="M9 16v-5"/><path d="M13 16V8"/><path d="M17 16v-3"/>'),
  perfil:   svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
  flecha:   svg('<path d="m9 6 6 6-6 6"/>', 20),
  atras:    svg('<path d="m15 6-6 6 6 6"/>', 20),
  fuego:    svg('<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 1 1.5 1.5 2 2.5 2C11.5 8 11 5.5 12 3Z"/>', 18),
  guia:     svg('<rect x="5" y="4" width="14" height="17"/><path d="M9 4V2.5h6V4"/><path d="M9 10h6"/><path d="M9 14h6"/><path d="M9 18h3"/>', 20),
  video:    svg('<rect x="3" y="5" width="18" height="14"/><path d="m10 9 5 3-5 3Z"/>', 20),
  taller:   svg('<path d="M14 3H6v18h12V7Z"/><path d="M14 3v4h4"/><path d="m9 14 2 2 4-4"/>', 20),
  reto:     svg('<path d="M12 3 3 8l9 5 9-5Z"/><path d="M7 10.5V16c0 1.5 2.5 3 5 3s5-1.5 5-3v-5.5"/>', 20),
  hecho:    svg('<path d="m5 12 5 5 9-10"/>', 20),
};

// --- Niveles -----------------------------------------------------
// Nivel 1: 0-99 XP, nivel 2: 100-199 XP, etc.
const NOMBRES_NIVEL = ["Principiante", "Explorador", "Aprendiz", "Resolutor", "Experto", "Maestro"];

export function datosNivel(xp) {
  const nivel = Math.floor(xp / XP_POR_NIVEL) + 1;
  const meta = nivel * XP_POR_NIVEL;                 // XP para pasar al siguiente
  return {
    nivel,
    meta,
    faltan: meta - xp,
    porcentaje: ((xp % XP_POR_NIVEL) / XP_POR_NIVEL) * 100,
    nombre: NOMBRES_NIVEL[Math.min(nivel, NOMBRES_NIVEL.length) - 1],
  };
}

// --- Insignias ---------------------------------------------------
// Para agregar una, copia una línea y cambia la condición.
export const INSIGNIAS = [
  { emoji: "👣", nombre: "Primer paso",    gana: (r) => r.hechos.size >= 1 },
  { emoji: "💯", nombre: "100 XP",         gana: (r) => r.xp >= 100 },
  { emoji: "🔥", nombre: "Racha de 3",     gana: (r) => r.racha >= 3 },
  { emoji: "📚", nombre: "Unidad completa", gana: (r) => r.unidadesCompletas >= 1 },
  { emoji: "⚡", nombre: "Racha de 7",     gana: (r) => r.racha >= 7 },
  { emoji: "🏆", nombre: "500 XP",         gana: (r) => r.xp >= 500 },
];

// --- Grado del usuario -------------------------------------------
// Estudiante: sale de su perfil ("7", "7A", "701" → 7).
// Docente: el grado que eligió por última vez (se guarda en el celular).
export function gradoDe(usuario) {
  if (!usuario.esDocente) {
    const numero = parseInt(String(usuario.curso || "").match(/\d+/)?.[0] || "", 10);
    // "701" → 7 (los cursos a veces se escriben con el grupo pegado)
    const grado = numero > 11 ? Math.floor(numero / 100) : numero;
    if (GRADOS[grado]) return grado;
  }
  const guardado = Number(localStorage.getItem("grado-docente"));
  return GRADOS[guardado] ? guardado : 6;
}

export function cambiarGradoDocente(grado) {
  localStorage.setItem("grado-docente", grado);
  location.reload();
}

// --- Resumen: todo lo que necesitan las pantallas ----------------
export async function cargarResumen(usuario) {
  // Si falla la lectura (sin internet y sin caché), seguimos con listas vacías.
  const [progreso, dias] = await Promise.all([
    leerMiProgreso().catch(() => []),
    leerMisDias(),
  ]);
  const grado = gradoDe(usuario);
  const contenido = GRADOS[grado];

  const xp = progreso.reduce((suma, p) => suma + (p.xp || 0), 0);
  const hechos = new Set(progreso.filter((p) => p.completada).map((p) => p.leccion));

  // Cuántos materiales lleva cada unidad
  const unidades = contenido.unidades.map((u) => ({
    ...u,
    hechos: u.materiales.filter((m) => hechos.has(m.id)).length,
  }));
  const unidadesCompletas = unidades.filter((u) => u.hechos === u.materiales.length).length;

  // "Continúa donde ibas": lo último que tocó; si no ha hecho nada, lo primero.
  const todos = unidades.flatMap((u, i) => u.materiales.map((m) => ({ ...m, unidad: u, numUnidad: i + 1 })));
  const ultimo = [...progreso].sort((a, b) => (b.actualizado?.seconds || 0) - (a.actualizado?.seconds || 0))[0];
  const continuar =
    (ultimo && todos.find((m) => m.id === ultimo.leccion)) ||
    todos.find((m) => !hechos.has(m.id)) ||
    todos[0];

  const resumen = {
    grado, contenido, progreso, xp, hechos, unidades, unidadesCompletas, continuar,
    racha: calcularRacha(dias),
    ...datosNivel(xp),
  };
  resumen.insignias = INSIGNIAS.map((i) => ({ ...i, ganada: i.gana(resumen) }));
  return resumen;
}

// --- Barra de abajo ----------------------------------------------
function pintarNav(activo) {
  const pestañas = [
    { id: "inicio",   texto: "Inicio",   href: "/" },
    { id: "progreso", texto: "Progreso", href: "/progreso.html" },
    { id: "perfil",   texto: "Perfil",   href: "/mi-cuenta.html" },
  ];
  const nav = document.createElement("nav");
  nav.className = "nav-inferior";
  nav.innerHTML = `<div class="contenedor">${pestañas
    .map((p) => `<a href="${p.href}" class="${p.id === activo ? "activo" : ""}">${ICONOS[p.id]}${p.texto}</a>`)
    .join("")}</div>`;
  document.body.append(nav);
}

// Aviso pequeño cuando se va el internet
function vigilarConexion() {
  const aviso = document.createElement("div");
  aviso.className = "sin-conexion";
  aviso.textContent = "Sin conexión · tu avance se guarda en el celular";
  const actualizar = () => (navigator.onLine ? aviso.remove() : document.body.append(aviso));
  addEventListener("online", actualizar);
  addEventListener("offline", actualizar);
  actualizar();
}

// --- Arranque de cada pantalla -----------------------------------
export function iniciarPantalla(activo, pintar) {
  if (activo) pintarNav(activo);
  vigilarConexion();
  exigirSesion(async (usuario) => {
    const resumen = await cargarResumen(usuario);
    await pintar(usuario, resumen);
    document.body.classList.remove("cargando");   // ya se puede mostrar todo
  });
}

// Primer nombre: "Juan Pablo Pérez" → "Juan"
export function primerNombre(usuario) {
  const nombre = usuario.nombre || (usuario.esDocente ? "Profe" : "Estudiante");
  return nombre.split(" ")[0];
}
