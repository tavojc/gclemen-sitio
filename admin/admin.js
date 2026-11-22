// ============================================================
// admin.js — Herramienta del docente (corre en TU computador)
// ============================================================
// Usos:
//   node admin.js crear estudiantes.csv   → crea las cuentas de una lista
//   node admin.js pin G7-014              → genera un PIN nuevo para un estudiante
//   node admin.js docente tu@correo.com   → marca tu cuenta como docente
//
// Necesita el archivo clave-servicio.json (ver LEEME.md).
// ¡Ese archivo NUNCA se sube a GitHub!
// ============================================================

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomInt } from "node:crypto";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const DOMINIO_ESTUDIANTES = "est.gclemen.org"; // igual que en firebase-config.js
const ARCHIVO_CLAVE = "./clave-servicio.json";

if (!existsSync(ARCHIVO_CLAVE)) {
  console.error("❌ Falta clave-servicio.json en esta carpeta. Mira el LEEME.md.");
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(ARCHIVO_CLAVE, "utf8"))) });
const auth = getAuth();
const db = getFirestore();

// --- Utilidades ----------------------------------------------
const codigoACorreo = (codigo) => `${codigo.trim().toLowerCase()}@${DOMINIO_ESTUDIANTES}`;

// PIN de 6 dígitos (Firebase exige mínimo 6 caracteres en la contraseña).
const nuevoPin = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

// Lee un CSV sencillo: codigo,nombre,curso (acepta coma o punto y coma,
// porque Excel en español suele guardar con punto y coma).
function leerCsv(ruta) {
  const texto = readFileSync(ruta, "utf8").replace(/^﻿/, ""); // quita BOM de Excel
  const lineas = texto.split(/\r?\n/).filter((l) => l.trim() !== "");
  const separador = lineas[0].includes(";") ? ";" : ",";
  const encabezados = lineas[0].split(separador).map((h) => h.trim().toLowerCase());
  return lineas.slice(1).map((linea) => {
    const valores = linea.split(separador).map((v) => v.trim());
    return Object.fromEntries(encabezados.map((h, i) => [h, valores[i] ?? ""]));
  });
}

// --- Comando: crear ------------------------------------------
async function crear(rutaCsv) {
  const filas = leerCsv(rutaCsv);
  const salida = [["codigo", "nombre", "curso", "pin", "estado"]];

  for (const { codigo, nombre, curso } of filas) {
    if (!codigo || !nombre) { console.warn("⚠️  Fila sin código o nombre, se salta."); continue; }
    const pin = nuevoPin();
    try {
      const user = await auth.createUser({
        email: codigoACorreo(codigo),
        password: pin,
        displayName: nombre
      });
      await db.collection("estudiantes").doc(user.uid).set({
        codigo: codigo.toUpperCase(), nombre, curso
      });
      salida.push([codigo.toUpperCase(), nombre, curso, pin, "creado"]);
      console.log(`✅ ${codigo.toUpperCase()}  ${nombre}  PIN ${pin}`);
    } catch (e) {
      const estado = e.code === "auth/email-already-exists" ? "ya existía" : `error: ${e.message}`;
      salida.push([codigo.toUpperCase(), nombre, curso, "", estado]);
      console.log(`⏭️  ${codigo.toUpperCase()}  ${nombre}  (${estado})`);
    }
  }

  // Archivo para imprimir y recortar los papelitos con los PIN.
  const archivo = rutaCsv.replace(/\.csv$/i, "") + "-con-pin.csv";
  writeFileSync(archivo, "﻿" + salida.map((f) => f.join(";")).join("\n"), "utf8");
  console.log(`\n📄 Lista con los PIN guardada en: ${archivo}`);
  console.log("   Imprímela, entrega los PIN y luego guárdala en un lugar seguro o bórrala.");
}

// --- Comando: pin (restablecer) ------------------------------
async function restablecerPin(codigo) {
  const user = await auth.getUserByEmail(codigoACorreo(codigo));
  const pin = nuevoPin();
  await auth.updateUser(user.uid, { password: pin });
  console.log(`🔑 Nuevo PIN para ${codigo.toUpperCase()} (${user.displayName ?? ""}): ${pin}`);
}

// --- Comando: docente ----------------------------------------
async function marcarDocente(correo) {
  const user = await auth.getUserByEmail(correo);
  await auth.setCustomUserClaims(user.uid, { docente: true });
  console.log(`👨‍🏫 ${correo} ahora es docente. Cierra sesión y vuelve a entrar para que aplique.`);
}

// --- Menú ----------------------------------------------------
const [comando, argumento] = process.argv.slice(2);
try {
  if (comando === "crear" && argumento) await crear(argumento);
  else if (comando === "pin" && argumento) await restablecerPin(argumento);
  else if (comando === "docente" && argumento) await marcarDocente(argumento);
  else {
    console.log("Uso:\n  node admin.js crear estudiantes.csv\n  node admin.js pin G7-014\n  node admin.js docente tu@correo.com");
  }
} catch (e) {
  if (e.code === "auth/user-not-found") console.error("❌ No existe una cuenta con ese código o correo.");
  else console.error("❌ Error:", e.message);
  process.exit(1);
}
