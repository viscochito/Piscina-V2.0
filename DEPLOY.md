# Guía de Despliegue

Instrucciones para desplegar la aplicación en producción.

## Frontend (Vercel - Recomendado)

### 1. Preparar Repositorio

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <tu-repo-url>
git push -u origin main
```

### 2. Conectar a Vercel

1. Ir a [vercel.com](https://vercel.com)
2. Importar proyecto desde GitHub
3. Configurar:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3. Variables de Entorno

En Vercel Dashboard > Settings > Environment Variables:

```
VITE_API_BASE_URL=https://tu-api.vercel.app/api
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 4. Deploy

Vercel desplegará automáticamente en cada push a `main`.

## Backend API (Vercel Functions)

### 1. Estructura

Crear carpeta `api/` en la raíz con los endpoints:

```
api/
├── generate-pdf.ts
└── presupuestos.ts
```

### 2. Configurar vercel.json

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

### 3. Dependencias para PDF

En `package.json`, agregar para producción:

```json
{
  "dependencies": {
    "@sparticuz/chromium": "^119.0.0",
    "puppeteer-core": "^21.0.0"
  }
}
```

### 4. Deploy

El backend se desplegará junto con el frontend en Vercel.

## Alternativa: Netlify

### 1. Configurar netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 2. Netlify Functions

Crear carpeta `netlify/functions/`:

```
netlify/functions/
├── generate-pdf.ts
└── presupuestos.ts
```

### 3. Variables de Entorno

En Netlify Dashboard > Site settings > Environment variables

## Supabase

### 1. Configurar URLs de Producción

En Supabase Dashboard > Authentication > URL Configuration:

- Site URL: `https://tu-app.vercel.app`
- Redirect URLs: `https://tu-app.vercel.app/**`

### 2. Storage Policies

Asegurar que las políticas de storage permitan acceso público a PDFs.

## PWA Configuration

### 1. Manifest

Crear `public/manifest.json`:

```json
{
  "name": "Presupuesto PoolSmart",
  "short_name": "PoolSmart",
  "description": "Generador de presupuestos para piletas",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker

Vite PWA plugin puede generar automáticamente el service worker.

## Verificación Post-Deploy

1. ✅ Aplicación carga correctamente
2. ✅ Formulario wizard funciona
3. ✅ Cálculos son correctos
4. ✅ PDF se genera y descarga
5. ✅ Compartir por WhatsApp funciona
6. ✅ Guardar presupuesto funciona
7. ✅ Autenticación funciona (si está implementada)

## Monitoreo

Configurar:
- Sentry para error tracking
- Analytics (opcional)
- Uptime monitoring

## Rollback

Si hay problemas:

1. En Vercel: Ir a Deployments > seleccionar versión anterior > Promote to Production
2. En Netlify: Ir a Deploys > seleccionar deploy anterior > Publish deploy


