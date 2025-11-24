# Presupuesto PoolSmart - MVP

Aplicación PWA para generar presupuestos profesionales de piletas. Diseñada para que asesores comerciales puedan crear, calcular y compartir presupuestos desde su celular.

## 🚀 Características

- **Wizard móvil-first**: Formulario paso a paso optimizado para móviles
- **Cálculos automáticos**: Motor de cálculo con fórmulas precisas
- **Generación de PDF**: PDFs profesionales con branding
- **Compartir fácil**: WhatsApp y email integrados
- **Offline-first**: Funciona sin conexión, sincroniza cuando hay red
- **Plantillas**: Guarda y reutiliza presupuestos comunes

## 📋 Requisitos

- Node.js 18+ 
- npm o yarn

## 🛠️ Instalación

1. Clonar el repositorio:
```bash
cd presupuesto-poolSmart
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_key_de_supabase
```

4. Iniciar servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🧪 Testing

Ejecutar tests unitarios:
```bash
npm test
```

Ejecutar tests en modo watch:
```bash
npm run test:watch
```

## 📦 Build

Generar build de producción:
```bash
npm run build
```

Preview del build:
```bash
npm run preview
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/            # Componentes UI base (Input, Button, etc.)
│   └── form/          # Componentes de formulario
├── screens/           # Pantallas de la aplicación
│   └── Wizard/        # Pantallas del wizard
├── hooks/             # Custom hooks
│   ├── useCalculadora.ts
│   └── usePresupuesto.ts
├── services/          # Servicios (API, PDF, etc.)
├── models/           # Tipos TypeScript
├── utils/            # Utilidades y funciones
│   └── calculations.ts  # Motor de cálculo
└── tests/            # Tests unitarios

api/                   # Endpoints serverless
├── generate-pdf.ts   # Endpoint para generar PDF
└── pdf-template.ts   # Template HTML del PDF
```

## 📐 Fórmulas de Cálculo

El motor de cálculo implementa las siguientes fórmulas:

- **Volumen (m³)**: `Largo × Ancho × ProfundidadPromedio`
- **Superficie Piso (m²)**: `Largo × Ancho`
- **Superficie Paredes (m²)**: `2 × (Largo × Profundidad) + 2 × (Ancho × Profundidad)`
- **Superficie Total (m²)**: `Piso + Paredes`
- **Superficie a Cotizar (m²)**: `Superficie Total × (1 + factorDesperdicio)`
- **Mano de Obra**: `Horas × TarifaHora` (o cálculo automático por productividad)
- **Total**: `Subtotal + Margen + IVA`

## 🔧 Configuración de Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Obtener URL y Anon Key
3. Configurar en `.env`
4. Ejecutar migraciones (ver `supabase/schema.sql`)

### Schema de Base de Datos

```sql
-- Tabla de presupuestos
CREATE TABLE presupuestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente JSONB NOT NULL,
  tipo_trabajo VARCHAR(50) NOT NULL,
  dimensiones JSONB NOT NULL,
  materiales JSONB NOT NULL,
  mano_obra JSONB NOT NULL,
  calculos JSONB,
  pdf_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de plantillas
CREATE TABLE plantillas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  configuracion JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 📱 Uso de la Aplicación

### Crear un Presupuesto

1. **Paso 1 - Datos del Cliente**: Completa nombre, teléfono, email y dirección
2. **Paso 2 - Tipo de Trabajo**: Selecciona construcción, reparación, revestimiento, etc.
3. **Paso 3 - Dimensiones**: Ingresa largo, ancho y profundidad promedio
4. **Paso 4 - Materiales**: Activa/desactiva materiales y sistemas
5. **Paso 5 - Mano de Obra**: Configura horas (manual o automático) y tarifa
6. **Paso 6 - Resumen**: Revisa y genera PDF, comparte o guarda

### Compartir por WhatsApp

1. Genera el PDF
2. Haz clic en "Compartir por WhatsApp"
3. Se abrirá WhatsApp con mensaje prearmado
4. Adjunta el PDF descargado

## 🚢 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

### Netlify

1. Conectar repositorio a Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configurar variables de entorno

### Backend (API Functions)

Los endpoints serverless se pueden desplegar en:
- Vercel Functions
- Netlify Functions
- AWS Lambda
- Supabase Edge Functions

## 🔐 Autenticación

La aplicación usa Supabase Auth con magic links (email). Para implementar:

1. Configurar Supabase Auth
2. Implementar pantalla de login
3. Proteger rutas según rol (asesor/admin)

## 📝 Próximas Mejoras

- [ ] Historial de presupuestos con búsqueda
- [ ] Plantillas predefinidas (estándar, premium, reparación)
- [ ] Sincronización offline mejorada
- [ ] Dashboard para dueño del negocio
- [ ] Integración con WhatsApp Business API
- [ ] Notificaciones push
- [ ] Exportación a Excel
- [ ] Firma digital de presupuestos

## 🐛 Troubleshooting

### Error al generar PDF
- Verificar que el endpoint `/api/generate-pdf` esté configurado
- En desarrollo, se usa fallback con jsPDF

### Error de conexión a Supabase
- Verificar variables de entorno
- La app funciona en modo offline usando localStorage

### Tests fallando
- Ejecutar `npm install` nuevamente
- Verificar que Jest esté configurado correctamente

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Soporte

Para soporte técnico, contactar al equipo de desarrollo.

---

**Versión MVP** - Desarrollado con React, TypeScript, Vite y Tailwind CSS
