// ============================================================
// firebase-config.js — Conexión del sitio con tu proyecto Firebase
// ============================================================
// Estos datos NO son secretos: Firebase los pone en la página a
// propósito. Lo que protege tus datos son las reglas de seguridad
// (archivo firestore.rules), no esconder esta configuración.
//
// Proyecto Firebase: gclemen-3710c (plan Spark, gratuito).
// ============================================================

export const firebaseConfig = {
  apiKey: "AIzaSyDS6TO0iSgh4rYLrVWQa3cEmjfo2GBg8tU",
  authDomain: "gclemen-3710c.firebaseapp.com",
  projectId: "gclemen-3710c",
  storageBucket: "gclemen-3710c.firebasestorage.app",
  messagingSenderId: "459233808515",
  appId: "1:459233808515:web:ae388088d08c25315fcbb6"
};

// Dominio interno para los correos "invisibles" de los estudiantes.
// El estudiante escribe "G7-014" y el sitio lo convierte en
// "g7-014@est.gclemen.org". Ese correo no existe de verdad; solo es
// el identificador que usa Firebase por dentro.
export const DOMINIO_ESTUDIANTES = "est.gclemen.org";
