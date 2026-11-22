// ============================================================
// sesion.js — Todo lo relacionado con iniciar sesión y guardar progreso
// ============================================================
// Las demás páginas del sitio importan funciones de aquí, por ejemplo:
//   import { usuarioActual, guardarProgreso } from "./js/sesion.js";
// Así el código de Firebase queda en un solo lugar.
// ============================================================

// Firebase se carga directo desde internet (CDN). No hay que instalar nada.
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, getDoc, setDoc, collection, getDocs, serverTimestamp, arrayUnion
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import { firebaseConfig, DOMINIO_ESTUDIANTES } from "./firebase-config.js";

// --- Arranque ------------------------------------------------
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Firestore con caché en el celular: si se va el internet, el progreso
// se guarda en el teléfono y se sube solo cuando vuelve la conexión.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// La sesión queda abierta en ese dispositivo hasta que el estudiante
// toque "Cerrar sesión" (es el comportamiento por defecto de Firebase).

// --- Convertir código a correo interno -----------------------
// "G7-014" -> "g7-014@est.gclemen.org"
// Si alguien escribe un correo real (tú, el docente), se usa tal cual.
export function codigoACorreo(codigo) {
  const limpio = codigo.trim().toLowerCase().replace(/\s+/g, "");
  return limpio.includes("@") ? limpio : `${limpio}@${DOMINIO_ESTUDIANTES}`;
}

// --- Iniciar y cerrar sesión ---------------------------------
export async function ingresar(codigo, pin) {
  try {
    await signInWithEmailAndPassword(auth, codigoACorreo(codigo), pin.trim());
    return { ok: true };
  } catch (error) {
    return { ok: false, mensaje: traducirError(error.code) };
  }
}

export function salir() {
  return signOut(auth);
}

// Mensajes de error en español y sin tecnicismos.
function traducirError(codigoError) {
  switch (codigoError) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "El código o el PIN no coinciden. Revisa e intenta de nuevo.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera unos minutos o pídele ayuda al profe.";
    case "auth/network-request-failed":
      return "No hay conexión a internet. Intenta cuando vuelva la señal.";
    default:
      return "No se pudo ingresar. Intenta de nuevo.";
  }
}

// --- Saber quién está conectado ------------------------------
// Llama a la función que le pases cada vez que cambia la sesión.
// Te entrega null si nadie ha iniciado sesión, o un objeto con
// los datos del estudiante (nombre, curso, código) o del docente.
export function alCambiarSesion(funcion) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return funcion(null);

    // ¿Es docente? Esa marca la pone el script de administración.
    const token = await user.getIdTokenResult();
    const esDocente = token.claims.docente === true;

    let perfil = {};
    try {
      const snap = await getDoc(doc(db, "estudiantes", user.uid));
      if (snap.exists()) perfil = snap.data();
    } catch (e) { /* sin conexión y sin caché: seguimos sin perfil */ }

    funcion({ uid: user.uid, esDocente, ...perfil });
  });
}

// Úsala al inicio de una página que exige sesión.
// Si no hay nadie conectado, manda a la página de ingreso.
export function exigirSesion(funcion) {
  return alCambiarSesion((usuario) => {
    if (!usuario) {
      // Guardamos la página (y su ?u=...) para volver después de ingresar.
      const volver = encodeURIComponent(location.pathname + location.search);
      location.href = `/ingresar.html?volver=${volver}`;
    } else {
      funcion(usuario);
    }
  });
}

// --- Progreso de las lecciones -------------------------------
// Cuántos XP se necesitan para subir de nivel (lo usan el menú y Mi cuenta).
export const XP_POR_NIVEL = 100;

// Ejemplo desde una lección:
//   guardarProgreso("ecuaciones-balanza", { xp: 30, completada: true });
export async function guardarProgreso(leccionId, datos) {
  const user = auth.currentUser;
  if (!user) return; // sin sesión: la lección funciona, pero no guarda nada
  const ref = doc(db, "progreso", user.uid, "lecciones", leccionId);
  // merge: true -> actualiza los campos sin borrar los demás
  await setDoc(ref, { ...datos, actualizado: serverTimestamp() }, { merge: true });
  await registrarDia();
}

// --- Racha: días seguidos practicando --------------------------
// Se guarda en un documento especial "_racha" dentro de la misma
// colección de lecciones (así las reglas de Firestore no cambian).
// Guarda una lista de fechas "2026-11-22"; arrayUnion no repite fechas.
function hoy() {
  return new Date().toLocaleDateString("en-CA");   // formato AAAA-MM-DD, hora local
}

async function registrarDia() {
  const user = auth.currentUser;
  if (!user) return;
  const ref = doc(db, "progreso", user.uid, "lecciones", "_racha");
  await setDoc(ref, { dias: arrayUnion(hoy()) }, { merge: true });
}

// Cuenta cuántos días seguidos hay, terminando hoy o ayer
// (si no ha practicado hoy, la racha de ayer todavía cuenta).
export function calcularRacha(dias = []) {
  const practicados = new Set(dias);
  const fecha = new Date();
  if (!practicados.has(hoy())) fecha.setDate(fecha.getDate() - 1);
  let racha = 0;
  while (practicados.has(fecha.toLocaleDateString("en-CA"))) {
    racha++;
    fecha.setDate(fecha.getDate() - 1);
  }
  return racha;
}

// Devuelve una lista con el progreso de todas las lecciones del estudiante.
export async function leerMiProgreso() {
  const user = auth.currentUser;
  if (!user) return [];
  const snaps = await getDocs(collection(db, "progreso", user.uid, "lecciones"));
  return snaps.docs
    .filter((d) => !d.id.startsWith("_"))         // "_racha" no es una lección
    .map((d) => ({ leccion: d.id, ...d.data() }));
}

// Devuelve la lista de días practicados (para la racha).
export async function leerMisDias() {
  const user = auth.currentUser;
  if (!user) return [];
  try {
    const snap = await getDoc(doc(db, "progreso", user.uid, "lecciones", "_racha"));
    return snap.exists() ? snap.data().dias || [] : [];
  } catch (e) {
    return [];                                    // sin conexión y sin caché
  }
}
