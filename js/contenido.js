// ============================================================
// contenido.js — QUÉ hay en cada grado: unidades, materiales y reto
// ============================================================
// Este es el archivo que vas a editar cuando definas los temas por
// grado y periodo (DBA y EBC). Por ahora tiene contenido DE EJEMPLO.
//
// Cada material tiene:
//   id     → nombre único, sin espacios ni tildes. Es el mismo que se usa en
//            guardarProgreso("id", {...}) para marcarlo como hecho.
//   tipo   → "guia", "video", "taller" o "reto" (define el ícono y la etiqueta)
//   titulo → lo que ve el estudiante
//   url    → a dónde lleva (un PDF, un video de YouTube, una lección).
//            Si es null, aparece como "Pronto".
// ============================================================

// Ayudante para no repetir: crea los 4 materiales típicos de una unidad.
// Si una unidad necesita otra cosa, escribe su lista de materiales a mano.
function materialesBasicos(id) {
  return [
    { id: `${id}-guia`,   tipo: "guia",   titulo: "Guía de la unidad", url: null },
    { id: `${id}-video`,  tipo: "video",  titulo: "Video explicativo", url: null },
    { id: `${id}-taller`, tipo: "taller", titulo: "Taller 1",          url: null },
    { id: `${id}-reto`,   tipo: "reto",   titulo: "Reto de práctica",  url: null },
  ];
}

export const GRADOS = {
  6: {
    reto: { id: "g6-reto-semana", titulo: "Números naturales y divisibilidad", preguntas: 3, xp: 80, url: null },
    unidades: [
      { id: "g6-u1", titulo: "Números naturales y divisibilidad", descripcion: "Múltiplos, divisores, MCM y MCD.",          materiales: materialesBasicos("g6-u1") },
      { id: "g6-u2", titulo: "Fracciones y decimales",            descripcion: "Operaciones y equivalencias.",              materiales: materialesBasicos("g6-u2") },
      { id: "g6-u3", titulo: "Geometría básica",                  descripcion: "Ángulos, polígonos y perímetros.",          materiales: materialesBasicos("g6-u3") },
      { id: "g6-u4", titulo: "Datos y gráficas",                  descripcion: "Tablas de frecuencia y diagramas de barras.", materiales: materialesBasicos("g6-u4") },
    ],
  },
  7: {
    reto: { id: "g7-reto-semana", titulo: "Operaciones con enteros", preguntas: 3, xp: 80, url: null },
    unidades: [
      { id: "g7-u1", titulo: "Números enteros",      descripcion: "Recta numérica, suma, resta, multiplicación y división.", materiales: materialesBasicos("g7-u1") },
      { id: "g7-u2", titulo: "Números racionales",   descripcion: "Fracciones y decimales con signo.",                        materiales: materialesBasicos("g7-u2") },
      { id: "g7-u3", titulo: "Proporcionalidad",     descripcion: "Razones, proporciones y regla de tres.",                   materiales: materialesBasicos("g7-u3") },
      { id: "g7-u4", titulo: "Ecuaciones sencillas", descripcion: "Ecuaciones de primer grado con la balanza.",               materiales: materialesBasicos("g7-u4") },
    ],
  },
  8: {
    reto: { id: "g8-reto-semana", titulo: "Productos notables", preguntas: 3, xp: 80, url: null },
    unidades: [
      { id: "g8-u1", titulo: "Expresiones algebraicas", descripcion: "Términos semejantes y operaciones.",    materiales: materialesBasicos("g8-u1") },
      { id: "g8-u2", titulo: "Productos notables",      descripcion: "Cuadrado de un binomio y más.",         materiales: materialesBasicos("g8-u2") },
      { id: "g8-u3", titulo: "Factorización",           descripcion: "Factor común, trinomios y diferencias.", materiales: materialesBasicos("g8-u3") },
      { id: "g8-u4", titulo: "Geometría y medición",    descripcion: "Teorema de Pitágoras y áreas.",         materiales: materialesBasicos("g8-u4") },
    ],
  },
  9: {
    reto: { id: "g9-reto-semana", titulo: "Sistemas de ecuaciones", preguntas: 3, xp: 80, url: null },
    unidades: [
      { id: "g9-u1", titulo: "Funciones lineales",     descripcion: "Pendiente, intercepto y gráficas.",  materiales: materialesBasicos("g9-u1") },
      { id: "g9-u2", titulo: "Sistemas de ecuaciones", descripcion: "Métodos de solución 2×2.",            materiales: materialesBasicos("g9-u2") },
      { id: "g9-u3", titulo: "Función cuadrática",     descripcion: "Parábolas y ecuaciones cuadráticas.", materiales: materialesBasicos("g9-u3") },
      { id: "g9-u4", titulo: "Estadística",            descripcion: "Medidas de tendencia central.",       materiales: materialesBasicos("g9-u4") },
    ],
  },
};

// Nombres que se muestran para cada tipo de material.
export const TIPOS = {
  guia:   "Guía",
  video:  "Video",
  taller: "Taller",
  reto:   "Reto",
};
