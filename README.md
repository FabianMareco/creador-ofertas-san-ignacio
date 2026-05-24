# 🛒 Despensa San Ignacio — Generador de Publicaciones

Aplicación web para crear publicaciones profesionales de ofertas diarias para WhatsApp, Instagram y Facebook. Incluye 17 templates, soporte de moneda Gs. (Guaraní), búsqueda de imágenes con IA, editor de imagen, y asistente de marketing con Claude IA.

---

## Índice

1. [Funciones](#-funciones)
2. [Obtener API Keys](#-obtener-api-keys)
   - [Pexels (búsqueda de imágenes)](#1-pexels--búsqueda-de-imágenes-en-web)
   - [Anthropic (asistente IA)](#2-anthropic--asistente-ia--sugerencias)
3. [Instalación local](#-instalación-local)
4. [Deploy en Vercel](#-deploy-en-vercel-recomendado)
5. [Cómo usar](#-cómo-usar)
6. [Estructura del proyecto](#-estructura-del-proyecto)
7. [Templates disponibles](#-templates-disponibles)
8. [Personalización](#-personalización)

---

## ✨ Funciones

- **17 templates** — 5 Clásicos · 6 Neón · 6 Pasteles
- **Monedas** — Gs. (Guaraní) · R$ (Real) · US$ (Dólar) · $ (Peso)
- **Formato paraguayo** — Números con puntos de miles: 1.000.000
- **Precio auto-ajustable** — Ocupa siempre el 90% del ancho disponible
- **Leyenda editable** — "¡OFERTA!", "POR PEDIDO", "NOVEDAD", etc.
- **Búsqueda de imágenes** — Pexels (banco de fotos de alta calidad, sin costo)
- **Editor de imagen** — Recorte, zoom, brillo/contraste, quitar fondo
- **Asistente IA** — Genera textos para WhatsApp, Instagram y Facebook
- **Exportar en 3 formatos:**
  - 📱 Historia (1080×1920) — WhatsApp / Instagram Stories
  - ⬛ Cuadrado (1080×1080) — Instagram Feed / Facebook
  - 🖥️ Horizontal (1200×628) — Facebook / Web
- **Responsive** — Funciona en computadora y celular

---

## 🔑 Obtener API Keys

La app tiene dos funciones que requieren una clave API gratuita. **Sin ellas la app funciona igual**, solo que la búsqueda de imágenes y el asistente IA no estarán disponibles.

---

### 1. Pexels — Búsqueda de imágenes en web

Pexels es un banco de fotos gratuito con licencia libre para uso comercial.

**Plan gratuito incluye:** 200 requests/hora · 20.000 requests/mes · Sin costo

**Pasos para obtener la key:**

1. Entrá a **[pexels.com/api](https://www.pexels.com/api/)**

2. Hacé clic en **"Get Started"** o **"Empezar"**

3. Creá una cuenta gratuita con tu email (o entrá con Google)

4. Una vez dentro, completá el formulario de nueva API Key:
   - **App Name:** `Despensa San Ignacio`
   - **App URL:** podés poner `http://localhost:3000` si no tenés dominio aún
   - **App Description:** `Generador de publicaciones para despensa familiar`
   - **How will you use the API?** → seleccioná `Personal use` o `Other`

5. Hacé clic en **"Create Key"**

6. Copiá la clave que aparece (empieza con letras y números, tipo: `RDm7hXZ5j2...`)

7. Pegala en tu archivo `.env.local`:
   ```
   PEXELS_API_KEY=RDm7hXZ5j2xxxxxxxxxxxxxxxxxxxxx
   ```

> **Documentación oficial:** https://www.pexels.com/api/documentation/

---

### 2. Anthropic — Asistente IA + Sugerencias

Anthropic es la empresa creadora de Claude. La API se usa para:
- Generar textos de marketing (WhatsApp, Instagram, Facebook)
- Sugerir términos de búsqueda de imágenes según el producto

**Costo:** Anthropic tiene un modelo de pago por uso. El costo para una despensa familiar es prácticamente nulo — cada consulta al asistente cuesta aproximadamente **USD 0.001** (menos de un centavo). Con uso normal (10-20 publicaciones por día) el costo mensual sería de centavos de dólar.

**Pasos para obtener la key:**

1. Entrá a **[console.anthropic.com](https://console.anthropic.com)**

2. Hacé clic en **"Sign Up"** para crear una cuenta

3. Completá el registro con tu email y verificá tu cuenta

4. Una vez dentro del dashboard, hacé clic en **"API Keys"** en el menú izquierdo
   - O entrá directamente a: **[console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)**

5. Hacé clic en **"Create Key"**
   - **Name:** `Despensa San Ignacio`
   - Hacé clic en **"Create Key"**

6. **¡Importante!** Copiá la clave inmediatamente — solo se muestra una vez.
   Tiene este formato: `sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

7. Pegala en tu archivo `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxx
   ```

8. Para agregar crédito: **[console.anthropic.com/settings/billing](https://console.anthropic.com/settings/billing)**
   - Con USD 5 tenés para meses de uso normal en una despensa

> **Documentación oficial:** https://docs.anthropic.com/en/api/getting-started

---

## 💻 Instalación local

### Requisitos

- **Node.js 18 o superior** → [Descargar en nodejs.org](https://nodejs.org)
- Una terminal (CMD, PowerShell o Terminal de Mac/Linux)

### Pasos

```bash
# 1. Entrá a la carpeta del proyecto
cd despensa-san-ignacio

# 2. Instalá las dependencias
npm install

# 3. Copiá el archivo de configuración
cp .env.local.example .env.local
```

Abrí el archivo `.env.local` con cualquier editor de texto (Bloc de notas, VS Code, etc.) y completá tus claves:

```env
PEXELS_API_KEY=tu_clave_de_pexels_aqui
ANTHROPIC_API_KEY=tu_clave_de_anthropic_aqui
```

```bash
# 4. Iniciá la aplicación
npm run dev
```

Abrí **[http://localhost:3000](http://localhost:3000)** en tu navegador.

> **Sin las API keys** la app funciona igual — solo que la búsqueda de imágenes mostrará un error, y el asistente IA no responderá. Podés agregar las keys después.

---

## 🚀 Deploy en Vercel (recomendado)

Vercel es la plataforma oficial de Next.js. El plan gratuito cubre perfectamente el uso de una despensa familiar.

**Plan gratuito incluye:** 100 GB de ancho de banda · Dominio gratuito (`tu-app.vercel.app`) · Deploy automático desde GitHub · Sin límite de deploys

### Paso 1 — Subir el código a GitHub

Si no tenés Git instalado: [git-scm.com/downloads](https://git-scm.com/downloads)

```bash
# Dentro de la carpeta despensa-san-ignacio:

# Inicializá el repositorio
git init

# Añadí todos los archivos
git add .

# Hacé el primer commit
git commit -m "Despensa San Ignacio - versión inicial"
```

Ahora creá el repositorio en GitHub:

1. Entrá a **[github.com](https://github.com)** y creá una cuenta si no tenés
2. Hacé clic en **"New repository"** (botón verde)
3. **Repository name:** `despensa-san-ignacio`
4. Dejalo en **Private** (para que sea solo tuyo)
5. **NO** marques "Add a README file" (ya tenemos uno)
6. Hacé clic en **"Create repository"**

GitHub te mostrará comandos para conectar. Ejecutalos en tu terminal:

```bash
git remote add origin https://github.com/TU_USUARIO/despensa-san-ignacio.git
git branch -M main
git push -u origin main
```

### Paso 2 — Crear cuenta en Vercel

1. Entrá a **[vercel.com](https://vercel.com)**
2. Hacé clic en **"Sign Up"**
3. Elegí **"Continue with GitHub"** — así se conectan automáticamente

### Paso 3 — Importar el proyecto

1. En el dashboard de Vercel hacé clic en **"Add New… → Project"**
2. Buscá y seleccioná el repositorio `despensa-san-ignacio`
3. Hacé clic en **"Import"**

### Paso 4 — Configurar las variables de entorno

⚠️ **Este paso es importante** — las API keys no van en el código, van en Vercel.

Antes de hacer deploy, en la pantalla de configuración de Vercel:

1. Expandí la sección **"Environment Variables"**
2. Agregá cada variable:

   | Name | Value |
   |------|-------|
   | `PEXELS_API_KEY` | `tu_clave_de_pexels` |
   | `ANTHROPIC_API_KEY` | `tu_clave_de_anthropic` |

3. Hacé clic en **"Deploy"**

Vercel va a construir y deployar la app automáticamente. En 2-3 minutos tenés tu URL pública, algo como:

```
https://despensa-san-ignacio.vercel.app
```

### Paso 5 — Actualizaciones futuras

Cuando necesites hacer un cambio en la app, simplemente:

```bash
git add .
git commit -m "descripción del cambio"
git push
```

Vercel detecta el push automáticamente y redeploya en minutos.

---

## 📁 .gitignore

Creá un archivo llamado `.gitignore` en la raíz del proyecto con este contenido para no subir archivos privados a GitHub:

```gitignore
# Variables de entorno — NUNCA subir al repositorio
.env.local
.env.*.local

# Next.js
.next/
out/

# Dependencias
node_modules/

# Sistema operativo
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

---

## 📱 Cómo usar

### En computadora
1. Elegí un **template** (diseño) de las 3 categorías: Clásicos, Neón, Pasteles
2. Configurá la **posición del logo** (izquierda, centro, derecha)
3. **Subí una foto** del producto o buscá una en la web con IA
4. Usá el editor para **recortar, ajustar brillo** o **quitar el fondo**
5. Escribí el **nombre del producto** y los **precios** (se formatean solos con puntos)
6. Personalizá la **leyenda del badge** (ej: "POR PEDIDO", "NOVEDAD")
7. Elegí el **formato de exportación** (Historia, Cuadrado u Horizontal)
8. Hacé clic en **"Descargar en alta calidad"**

### En celular
La app tiene navegación por tabs en la parte inferior:
- 🎨 **Diseño** — elegí template y posición de logo
- 📷 **Imagen** — subí o buscá foto
- 💰 **Precio** — nombre, precios y leyenda
- ⬇️ **Exportar** — descargá la publicación

---

## 🏗️ Estructura del proyecto

```
despensa-san-ignacio/
├── app/
│   ├── layout.js              # Layout principal y fuentes
│   ├── page.js                # Página principal (responsive)
│   ├── globals.css            # Estilos globales + mobile
│   └── api/
│       └── search-images/     # Proxy servidor → Pexels API
│           └── route.js
├── components/
│   ├── TemplateSelector.jsx   # Grid de templates con categorías
│   ├── ImageSelector.jsx      # Subir archivo o buscar en Pexels
│   ├── ImageEditor.jsx        # Editor: encuadre, fondo, ajustes, IA
│   ├── PriceEditor.jsx        # Precios, moneda, leyenda editable
│   ├── CanvasPreview.jsx      # Vista previa dinámica (ResizeObserver)
│   └── ExportPanel.jsx        # Selector de formato y descarga
├── lib/
│   └── drawCanvas.js          # Motor Canvas: 17 templates + auto-fit
├── public/
│   └── logo.png               # Logo sin fondo
└── .env.local.example         # Plantilla de variables de entorno
```

---

## 🎨 Templates disponibles

### Clásicos
| Template | Estilo | Ideal para |
|---|---|---|
| Rojo Clásico | Vibrante, rojo y dorado | Ofertas del día, lácteos, fiambres |
| Verde Natural | Fresco, fondo oscuro verde | Verduras, frutas, orgánicos |
| Azul Premium | Elegante, oscuro con dorado | Productos importados, vinos |
| Naranja Energía | Dinámico, fondo naranja | Promos flash, bebidas |
| Minimalista | Limpio, blanco con rojo | Cualquier producto |

### Neón (6 templates)
Rosa · Cian · Púrpura · Naranja · Verde · Dorado

### Pasteles (6 templates)
Rosa · Menta · Lavanda · Durazno · Cielo · Limón

---

## 🔧 Personalización

### Cambiar el nombre del negocio
Editá `lib/drawCanvas.js` línea 4:
```js
const STORE_NAME = 'Despensa San Ignacio'; // ← cambiá esto
```

### Cambiar moneda predeterminada
Editá `app/page.js`:
```js
const [currency, setCurrency] = useState('Gs.'); // ← Gs. | R$ | US$ | $
```

### Agregar más monedas
Editá `lib/drawCanvas.js`, el array `CURRENCIES`:
```js
export const CURRENCIES = [
  { id: 'gs',  symbol: 'Gs.',  name: 'Guaraní', flag: '🇵🇾' },
  // agregá más aquí...
];
```

---

## ❓ Preguntas frecuentes

**¿Necesito MongoDB o Firebase?**
No. La app no guarda datos — cada sesión es independiente. No hay base de datos necesaria para el uso actual.

**¿Funciona sin las API keys?**
Sí. Podés subir tus propias fotos y el asistente IA simplemente no responderá. La generación de publicaciones funciona sin ninguna key.

**¿Cuánto cuesta en Vercel?**
El plan gratuito es suficiente para uso familiar. No necesitás tarjeta de crédito para empezar.

**¿Cómo actualizo la app después de un cambio?**
Con `git add . && git commit -m "cambio" && git push`. Vercel redeploya solo.

**¿Puedo usar el dominio propio (ej: despensasanignacio.com.py)?**
Sí. En el dashboard de Vercel → tu proyecto → Settings → Domains → agregás tu dominio. Vercel te da las instrucciones de DNS.

---

## 🛡️ Seguridad

- Las API keys **nunca** van en el código — solo en `.env.local` (local) o en Vercel (producción)
- El archivo `.env.local` está en `.gitignore` — nunca se sube a GitHub
- La clave de Pexels se usa server-side (el navegador nunca la ve)
- La clave de Anthropic se usa en el cliente para el asistente IA — considerá moverla a server-side si la app se hace pública

---

Hecho con ❤️ para **Despensa San Ignacio** · Paraguay 🇵🇾
