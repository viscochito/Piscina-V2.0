# Funcionalidades Faltantes para MVP 100% Funcional

## ✅ Lo que YA está implementado

1. ✅ **Wizard completo** (6 pasos) con validación
2. ✅ **Motor de cálculo** con todas las fórmulas del brief
3. ✅ **Componentes UI** base (Input, Select, Toggle, Button, etc.)
4. ✅ **Autosave en localStorage** (draft del presupuesto)
5. ✅ **Compartir por WhatsApp** (abre con mensaje prearmado)
6. ✅ **Generación de PDF básica** (fallback con jsPDF)
7. ✅ **Estructura de servicios** (API, PDF, Share)
8. ✅ **Tests unitarios** para cálculos
9. ✅ **TypeScript** estricto con tipos completos

---

## ❌ Funcionalidades CRÍTICAS faltantes

### 1. **Historial de Presupuestos** 🔴 PRIORIDAD ALTA
**Estado:** Estructura de API existe, pero NO hay pantalla UI

**Qué falta:**
- Pantalla `/historial` que muestre lista de presupuestos guardados
- Filtros por cliente, fecha, tipo de trabajo
- Ver PDF desde el historial
- Duplicar presupuesto desde historial
- Eliminar presupuesto
- Búsqueda de presupuestos

**Archivos a crear:**
```
src/screens/Historial/
  ├── HistorialPresupuestos.tsx  (lista principal)
  ├── PresupuestoCard.tsx        (card individual)
  └── FiltrosHistorial.tsx       (filtros y búsqueda)
```

**Integración necesaria:**
- Agregar ruta en `App.tsx`
- Botón "Ver Historial" en el wizard
- Navegación entre wizard e historial

---

### 2. **Plantillas/Presets** 🔴 PRIORIDAD ALTA
**Estado:** Modelos y API existen, pero NO hay UI

**Qué falta:**
- Pantalla para crear/editar plantillas
- 3 presets iniciales (estándar, premium, reparación simple)
- Selector de plantilla al iniciar wizard
- Botón "Guardar como plantilla" en paso 6
- Cargar plantilla en wizard

**Archivos a crear:**
```
src/screens/Plantillas/
  ├── ListaPlantillas.tsx
  ├── CrearPlantilla.tsx
  └── PresetCard.tsx
```

**Presets iniciales a crear:**
- **Estándar:** Cerámico estándar + bomba + filtro
- **Premium:** Cerámico premium + todos los sistemas
- **Reparación simple:** Solo mano de obra + materiales básicos

---

### 3. **Endpoint Backend Real para PDF** 🟡 PRIORIDAD MEDIA
**Estado:** Template HTML existe, pero endpoint no está funcional

**Qué falta:**
- Configurar Puppeteer en el endpoint `/api/generate-pdf`
- Deploy del endpoint en Vercel/Netlify Functions
- Subir PDF a Supabase Storage
- Retornar URL pública del PDF

**Archivos a modificar:**
- `api/generate-pdf.ts` - Agregar Puppeteer real
- Configurar variables de entorno para Chromium

**Dependencias a agregar:**
```json
{
  "@sparticuz/chromium": "^119.0.0",
  "puppeteer-core": "^21.0.0"
}
```

---

### 4. **Autenticación Completa** 🟡 PRIORIDAD MEDIA
**Estado:** Servicio Supabase existe, pero NO hay UI de login

**Qué falta:**
- Pantalla de login con email + magic link
- Pantalla de verificación de email
- Protección de rutas (solo usuarios autenticados)
- Manejo de sesión (logout, refresh token)
- Roles (asesor/admin) - diferenciación de permisos

**Archivos a crear:**
```
src/screens/Auth/
  ├── Login.tsx
  ├── VerificarEmail.tsx
  └── useAuth.ts (hook)
```

**Integración:**
- Wrapper de autenticación en `App.tsx`
- Guardar userId en presupuestos
- Filtrar presupuestos por usuario

---

### 5. **Sincronización Offline → Online** 🟡 PRIORIDAD MEDIA
**Estado:** Solo guarda en localStorage, no sincroniza

**Qué falta:**
- Detectar cuando hay conexión
- Sincronizar presupuestos guardados localmente con backend
- Manejar conflictos (último guardado gana)
- Indicador visual de estado de sincronización
- Queue de operaciones pendientes

**Archivos a crear:**
```
src/services/
  └── syncService.ts
```

**Funcionalidad:**
- Service Worker para detectar conexión
- Sincronizar en background cuando hay red
- Mostrar badge "Sincronizando..." / "Sincronizado"

---

### 6. **Mejoras en Compartir PDF** 🟢 PRIORIDAD BAJA
**Estado:** Funciona básico, pero falta adjuntar PDF real

**Qué falta:**
- Adjuntar PDF descargado al mensaje de WhatsApp (requiere API Business)
- Enviar PDF por email con adjunto real
- Opción de descargar PDF directamente
- Compartir link del PDF (si está en Supabase Storage)

**Mejoras:**
- Usar `navigator.share()` API cuando esté disponible
- Integración con WhatsApp Business API (futuro)

---

## 🟢 Mejoras de UX/UI (Opcionales pero recomendadas)

### 7. **Pantalla de Inicio/Dashboard**
- Botón grande "Nuevo Presupuesto"
- Acceso rápido a últimos 3 presupuestos
- Estadísticas básicas (total presupuestos, monto total)

### 8. **Validaciones Mejoradas**
- Validar email con regex más estricto
- Validar teléfono con formato internacional
- Mensajes de error más claros y visibles
- Validación en tiempo real (no solo al submit)

### 9. **Feedback Visual**
- Loading states en todos los botones
- Toasts/notificaciones de éxito/error
- Confirmación antes de eliminar
- Animaciones de transición entre pasos

### 10. **PWA Completa**
- Service Worker configurado
- Manifest.json completo
- Iconos para instalación
- Funciona offline completamente

### 11. **Exportación Adicional**
- Exportar a Excel/CSV
- Imprimir presupuesto directamente
- Compartir link público (si se implementa)

---

## 📊 Resumen de Prioridades

### 🔴 CRÍTICO (MVP no funcional sin esto):
1. Historial de presupuestos
2. Plantillas/presets básicos

### 🟡 IMPORTANTE (MVP funcional pero incompleto):
3. Endpoint PDF real con Puppeteer
4. Autenticación básica
5. Sincronización offline

### 🟢 MEJORAS (Nice to have):
6. Mejoras en compartir
7. Dashboard
8. Validaciones mejoradas
9. Feedback visual
10. PWA completa

---

## 🎯 Plan de Implementación Sugerido

### Sprint 1 (1 semana) - MVP Mínimo
- [ ] Historial de presupuestos (lista + ver PDF)
- [ ] 3 presets iniciales hardcodeados
- [ ] Cargar preset en wizard

### Sprint 2 (1 semana) - Funcionalidad Core
- [ ] Endpoint PDF con Puppeteer
- [ ] Subir PDF a Supabase Storage
- [ ] Autenticación básica (login + magic link)

### Sprint 3 (1 semana) - Sincronización
- [ ] Sincronización offline → online
- [ ] Manejo de conflictos
- [ ] Indicadores de estado

### Sprint 4 (1 semana) - Pulido
- [ ] Dashboard de inicio
- [ ] Mejoras de UX/UI
- [ ] PWA completa
- [ ] Testing E2E

---

## 🔧 Configuración Necesaria

### Variables de Entorno Faltantes:
```env
# Backend API
VITE_API_BASE_URL=https://tu-api.vercel.app/api

# Supabase (ya configurado)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Para Puppeteer en producción
CHROMIUM_PATH=... (si se usa en servidor)
```

### Dependencias Adicionales:
```bash
npm install @sparticuz/chromium puppeteer-core
```

---

## 📝 Notas Técnicas

1. **PDF Generation:** El fallback actual con jsPDF funciona, pero el PDF no tiene el mismo diseño que el template HTML. Para producción, es crítico usar Puppeteer.

2. **Offline Sync:** Considerar usar IndexedDB en lugar de solo localStorage para mejor performance con muchos presupuestos.

3. **Autenticación:** Magic link es suficiente para MVP, pero considerar agregar password opcional para usuarios que lo prefieran.

4. **Historial:** Implementar paginación si hay muchos presupuestos (más de 50).

5. **Plantillas:** Las plantillas pueden ser compartidas entre usuarios (opcional, para futuro).


