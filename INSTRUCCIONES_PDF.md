# Instrucciones para Ver el PDF Actualizado

## ⚠️ Importante: Limpiar Cache del Navegador

Si el PDF no muestra los cambios, es probable que el navegador esté usando una versión cacheada. Sigue estos pasos:

### Opción 1: Hard Refresh
1. Abre el proyecto en el navegador
2. Presiona `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
3. Esto fuerza la recarga sin cache

### Opción 2: Limpiar Cache Manualmente
1. Abre las herramientas de desarrollador (F12)
2. Click derecho en el botón de recargar
3. Selecciona "Vaciar caché y volver a cargar de forma forzada"

### Opción 3: Modo Incógnito
1. Abre una ventana de incógnito (Ctrl + Shift + N)
2. Ve a `http://localhost:3000` (o el puerto que muestre Vite)
3. Prueba generar el PDF

## 📋 Estructura del PDF Actualizada

El PDF ahora tiene **3 secciones principales**:

### 1. MATERIALES
- Tabla con: Descripción | Cantidad | Unidad | Precio Unitario | Total
- Subtotal de materiales al final

### 2. CONSTRUCCIÓN Y MANO DE OBRA
- Tabla con: Descripción | Cantidad (horas) | Unidad | Precio Unitario | Total
- Incluye información sobre dificultad de acceso
- Subtotal de construcción al final

### 3. COSTOS ADICIONALES
- Tabla con: Descripción | Cantidad | Unidad | Total
- Se muestra solo si se activó "Requiere permisos especiales"
- Incluye "Permisos y Licencias Municipales"

### 4. RESUMEN DE TOTALES
- Subtotal Materiales
- Subtotal Construcción y Mano de Obra
- Subtotal Costos Adicionales (si aplica)
- Subtotal General
- Margen de Ganancia
- IVA
- **TOTAL A PAGAR**

## 🧪 Cómo Probar

1. **Reinicia el servidor de desarrollo:**
   ```bash
   # Detén el servidor (Ctrl + C)
   npm run dev
   ```

2. **Limpia el cache del navegador** (ver arriba)

3. **Completa el wizard:**
   - Paso 1: Datos del cliente
   - Paso 2: Tipo de trabajo
   - Paso 3: Dimensiones
   - Paso 4: Activa algunos materiales
   - Paso 5: Configura mano de obra y **activa "Requiere permisos especiales"** para ver costos adicionales
   - Paso 6: Genera el PDF

4. **Verifica que el PDF tenga:**
   - ✅ Sección MATERIALES con tabla completa
   - ✅ Sección CONSTRUCCIÓN Y MANO DE OBRA con tabla
   - ✅ Sección COSTOS ADICIONALES (si activaste permisos)
   - ✅ Resumen de totales con todas las líneas

## 🔍 Verificar en Consola

Abre la consola del navegador (F12) y deberías ver:
```
Generando PDF con jsPDF (versión mejorada)...
```

Si ves esto, significa que está usando el fallback mejorado con las 3 secciones.

## 📝 Nota Técnica

El PDF se genera con **jsPDF** (fallback) porque no hay endpoint backend configurado. El código ya incluye las 3 secciones organizadas. Si en el futuro configuras un endpoint backend con Puppeteer, usará el template HTML que también tiene las 3 secciones.

## ❓ Si Aún No Funciona

1. Verifica que el código esté guardado
2. Reinicia el servidor de desarrollo
3. Limpia completamente el cache
4. Revisa la consola del navegador por errores
5. Intenta en modo incógnito


