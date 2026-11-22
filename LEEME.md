# Inicio de sesión de estudiantes — gclemen.org

## Qué hay en esta carpeta

```
sitio/                 → se sube al repositorio gclemen-sitio (GitHub)
  ingresar.html        página de ingreso (código + PIN)
  mi-cuenta.html       saludo, puntos y lecciones del estudiante
  js/firebase-config.js  datos de tu proyecto Firebase (los pegas tú)
  js/sesion.js         funciones de sesión y progreso
firestore.rules        reglas de seguridad (se pegan en la consola)
admin/                 → se queda SOLO en tu computador, NO va a GitHub
  admin.js             crear cuentas, cambiar PIN, marcarte como docente
  estudiantes-ejemplo.csv
```

---

## Paso 1 — Crear el proyecto en Firebase (≈10 min)

1. Entra a https://console.firebase.google.com con tu cuenta de Google.
2. **Crear un proyecto** → nombre: `gclemen` → Google Analytics: puedes desactivarlo → Crear.
3. Menú izquierdo → **Compilación → Authentication** → Comenzar →
   pestaña *Método de acceso* → **Correo electrónico/contraseña** → Habilitar (solo el primer interruptor) → Guardar.
4. Authentication → pestaña **Configuración → Dominios autorizados** → Agregar dominio → `gclemen.org`
   (y también `gclemen-sitio.pages.dev`).
5. Menú → **Compilación → Firestore Database** → Crear base de datos →
   ubicación: `southamerica-east1` (São Paulo, la más cercana) → **modo de producción** → Crear.
6. Firestore → pestaña **Reglas** → borra lo que hay, pega el contenido de `firestore.rules` → **Publicar**.
7. Rueda ⚙️ (arriba a la izquierda) → **Configuración del proyecto** → bajar a *Tus apps* → ícono **</>** (web) →
   apodo `gclemen-sitio` → Registrar app (no marques Hosting).
   Te muestra un bloque `firebaseConfig = { ... }`. **Copia esos valores** en `sitio/js/firebase-config.js`.

## Paso 2 — Subir las páginas al sitio

En GitHub, repositorio `gclemen-sitio` → *Add file → Upload files*:
- arrastra `ingresar.html` y `mi-cuenta.html` a la raíz (junto a index.html)
- arrastra la carpeta `js` completa
- Commit changes → en ~1 minuto queda en `gclemen.org/ingresar.html`

## Paso 3 — Preparar la herramienta del docente (en tu computador)

1. Instala Node.js (versión LTS) desde https://nodejs.org si no lo tienes.
2. Firebase → ⚙️ Configuración del proyecto → pestaña **Cuentas de servicio** →
   **Generar nueva clave privada** → se descarga un .json.
   Renómbralo `clave-servicio.json` y ponlo dentro de la carpeta `admin`.
   ⚠️ Esa clave da control total del proyecto: **no la subas a GitHub ni la compartas.**
3. Abre una terminal en la carpeta `admin` y ejecuta una sola vez:
   ```
   npm install
   ```

## Paso 4 — Crear las cuentas

1. Haz la lista en Excel con tres columnas: `codigo`, `nombre`, `curso`
   (mira `estudiantes-ejemplo.csv`). Guárdala como **CSV**.
2. Ejecuta:
   ```
   node admin.js crear estudiantes.csv
   ```
3. Se crea `estudiantes-con-pin.csv` con el PIN de cada uno → imprime, recorta y entrega.
   Si corres el comando otra vez, los que ya existen se saltan (no se duplican).

## Otros comandos

```
node admin.js pin G7-014              # alguien olvidó su PIN → genera uno nuevo
node admin.js docente tu@correo.com   # marca tu cuenta como docente
```

Para tener cuenta de docente: Authentication → Usuarios → **Agregar usuario** con tu correo
y una contraseña, luego corre el comando `docente`. Entras en la misma página de ingreso,
escribiendo tu correo en lugar del código.

## Paso 5 — Probar

1. Crea las cuentas de `estudiantes-ejemplo.csv`.
2. En el celular abre `gclemen.org/ingresar.html`, entra con `G7-003` y su PIN.
3. Debe llevarte a *Mi cuenta* con "Hola, Prueba Profe".
4. Toca *No soy yo / Salir* y verifica que vuelve a pedir el código.

## Guardar progreso desde una lección

En cualquier página de lección:
```html
<script type="module">
  import { guardarProgreso } from "./js/sesion.js";
  // cuando el estudiante termina:
  guardarProgreso("ecuaciones-balanza", { xp: 30, completada: true });
</script>
```
Si el estudiante no ha iniciado sesión, la lección funciona igual y simplemente no se guarda nada.
