# 🔍 Cómo Ver los PDFs Guardados

## ⚠️ IMPORTANTE: Los PDFs NO se descargan al escritorio

Los PDFs ahora se guardan en **Supabase Storage** y se muestran en el navegador. No se descargan automáticamente.

## 🔧 Paso 1: Verificar Configuración

### Abre la consola del navegador (F12)

1. Abre tu aplicación en el navegador
2. Presiona **F12** para abrir las herramientas de desarrollador
3. Ve a la pestaña **Console**
4. Escribe y ejecuta:
```javascript
verificarPDFs()
```

Esto te mostrará:
- ✅ Si Supabase está configurado
- ✅ Si el bucket existe
- ✅ Lista de PDFs guardados
- ❌ Cualquier error de configuración

## 📍 Paso 2: Ver PDFs en Supabase Dashboard

### Si Supabase está configurado:

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión
3. Selecciona tu proyecto
4. Ve a **Storage** (menú lateral izquierdo)
5. Haz clic en el bucket **`presupuestos`**
6. Verás todos los PDFs guardados

**Ruta de los archivos:**
```
presupuestos/
  └── anonymous/  (o el ID del usuario)
      └── {timestamp}_PRESUPUESTO_{nombreCliente}_{fecha}.pdf
```

## 🗄️ Paso 3: Ver en la Base de Datos

1. En Supabase Dashboard, ve a **Table Editor**
2. Selecciona la tabla **`presupuestos`**
3. Cada fila tiene:
   - `pdf_url`: URL pública del PDF (haz clic para abrir)
   - `cliente`: Información del cliente
   - `created_at`: Fecha de creación

## 🐛 Si NO encuentras los PDFs

### Verificar Variables de Entorno

Crea o edita el archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

**Para obtener estas credenciales:**
1. Ve a Supabase Dashboard
2. Settings > API
3. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Verificar que el Bucket Existe

1. En Supabase Dashboard, ve a **Storage**
2. Si NO ves el bucket `presupuestos`:
   - Haz clic en **"New bucket"**
   - Nombre: `presupuestos`
   - Marca **"Public bucket"** (para acceso público)
   - Haz clic en **"Create bucket"**

### Verificar Políticas de Storage

En Supabase Dashboard > Storage > Policies:

Debe haber una política que permita:
- **SELECT** (lectura) para todos
- **INSERT** (escritura) para usuarios autenticados o anónimos

## 📱 Ver PDFs desde la Aplicación

Cuando generas un PDF:
1. Se muestra automáticamente en un **modal** en el navegador
2. Puedes hacer clic en **"Descargar PDF"** para descargarlo manualmente
3. La URL se guarda en Supabase

## 🔗 Obtener URL Directa

Cada PDF tiene una URL pública con este formato:
```
https://{tu-proyecto}.supabase.co/storage/v1/object/public/presupuestos/{userId}/{timestamp}_{nombreArchivo}.pdf
```

Puedes:
- Abrirla directamente en el navegador
- Compartirla con otros usuarios
- Usarla en otras aplicaciones

## 💡 Consejos

- **Reinicia el servidor** después de cambiar `.env`:
  ```bash
  # Detén el servidor (Ctrl + C)
  npm run dev
  ```

- **Limpia la caché** del navegador si no ves cambios

- **Revisa la consola** del navegador para ver errores

- **Usa `verificarPDFs()`** en la consola para diagnosticar problemas

