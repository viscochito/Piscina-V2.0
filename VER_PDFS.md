# Cómo Ver los PDFs Guardados

## 📍 Ubicación de los PDFs

Los PDFs **ya NO se descargan automáticamente** al escritorio. Ahora se guardan en **Supabase Storage** y se muestran en el navegador.

## 🔍 Dónde Ver los PDFs

### 1. En el Dashboard de Supabase (Recomendado)

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Selecciona tu proyecto
3. Ve a **Storage** en el menú lateral
4. Haz clic en el bucket **`presupuestos`**
5. Verás todos los PDFs guardados organizados por usuario y fecha

**Ruta de los archivos:**
```
presupuestos/
  └── {userId}/
      └── {timestamp}_PRESUPUESTO_{nombreCliente}_{fecha}.pdf
```

### 2. En la Base de Datos de Supabase

1. Ve a **Table Editor** en el dashboard
2. Selecciona la tabla **`presupuestos`**
3. Cada registro tiene:
   - `pdf_url`: URL pública del PDF
   - `cliente`: Información del cliente
   - `created_at`: Fecha de creación

### 3. Desde la Aplicación

Cuando generas un PDF:
- Se muestra automáticamente en un **modal** en el navegador
- Puedes hacer clic en **"Descargar PDF"** para descargarlo manualmente
- La URL del PDF se guarda en Supabase

## 📥 Descargar PDFs Manualmente

### Opción 1: Desde el Modal
1. Genera un PDF
2. Se abre el modal automáticamente
3. Haz clic en **"Descargar PDF"**

### Opción 2: Desde Supabase Dashboard
1. Ve a Storage > presupuestos
2. Haz clic en el PDF que quieres descargar
3. Se descargará automáticamente

### Opción 3: Usando la URL Pública
Cada PDF tiene una URL pública que puedes:
- Abrir directamente en el navegador
- Compartir con otros usuarios
- Usar en otras aplicaciones

## 🔗 Obtener la URL de un PDF

La URL tiene este formato:
```
https://{tu-proyecto}.supabase.co/storage/v1/object/public/presupuestos/{userId}/{timestamp}_{nombreArchivo}.pdf
```

## 💡 Consejos

- **No se descargan automáticamente**: Los PDFs se guardan en la nube (Supabase)
- **Acceso desde cualquier lugar**: Puedes ver los PDFs desde cualquier dispositivo
- **Backup automático**: Todos los PDFs están respaldados en Supabase
- **Compartir fácilmente**: Usa la URL pública para compartir PDFs

## 🛠️ Funciones Disponibles

El código incluye funciones para:
- `listarPDFs()`: Lista todos los PDFs en Storage
- `obtenerPresupuestosGuardados()`: Obtiene todos los presupuestos con sus PDFs

Puedes usar estas funciones para crear una vista de historial de presupuestos si lo necesitas.

