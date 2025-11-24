# Configuración de Supabase

Guía paso a paso para configurar Supabase en el proyecto.

## 1. Crear Proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear cuenta o iniciar sesión
3. Crear nuevo proyecto
4. Anotar:
   - Project URL
   - Anon/Public Key

## 2. Configurar Variables de Entorno

Agregar al archivo `.env`:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## 3. Ejecutar Migraciones

Conectarse al SQL Editor en Supabase Dashboard y ejecutar:

```sql
-- Habilitar UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de presupuestos
CREATE TABLE presupuestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero SERIAL,
  cliente JSONB NOT NULL,
  tipo_trabajo VARCHAR(50) NOT NULL,
  dimensiones JSONB NOT NULL,
  materiales JSONB NOT NULL,
  mano_obra JSONB NOT NULL,
  factor_desperdicio DECIMAL(5,2) DEFAULT 0.10,
  margen DECIMAL(5,2) DEFAULT 0.20,
  iva DECIMAL(5,2) DEFAULT 0.21,
  calculos JSONB,
  pdf_url TEXT,
  estado VARCHAR(20) DEFAULT 'borrador',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de plantillas
CREATE TABLE plantillas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo_trabajo VARCHAR(50),
  dimensiones JSONB,
  materiales JSONB NOT NULL,
  mano_obra JSONB NOT NULL,
  factor_desperdicio DECIMAL(5,2) DEFAULT 0.10,
  margen DECIMAL(5,2) DEFAULT 0.20,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX idx_presupuestos_user_id ON presupuestos(user_id);
CREATE INDEX idx_presupuestos_created_at ON presupuestos(created_at DESC);
CREATE INDEX idx_plantillas_user_id ON plantillas(user_id);

-- RLS (Row Level Security)
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios solo pueden ver/editar sus propios presupuestos
CREATE POLICY "Users can view own presupuestos"
  ON presupuestos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presupuestos"
  ON presupuestos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presupuestos"
  ON presupuestos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own plantillas"
  ON plantillas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plantillas"
  ON plantillas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plantillas"
  ON plantillas FOR UPDATE
  USING (auth.uid() = user_id);
```

## 4. Configurar Storage para PDFs

En Supabase Dashboard > Storage:

1. Crear bucket llamado `presupuestos`
2. Configurar políticas:
   - Public read para PDFs
   - Authenticated write

```sql
-- Política de storage
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'presupuestos');
```

## 5. Configurar Autenticación

1. Ir a Authentication > Settings
2. Habilitar "Email" provider
3. Configurar email templates (opcional)
4. Configurar redirect URLs para desarrollo:
   - `http://localhost:3000`
   - `http://localhost:3000/auth/callback`

## 6. Probar Conexión

En la aplicación, verificar que:
- Se puede conectar a Supabase
- Se pueden crear presupuestos
- Se pueden subir PDFs al storage

## Troubleshooting

### Error: "Invalid API key"
- Verificar que la key sea la "anon/public" key, no la "service_role" key

### Error: "Row Level Security"
- Verificar que las políticas RLS estén creadas correctamente
- Verificar que el usuario esté autenticado

### Error: "Storage bucket not found"
- Verificar que el bucket `presupuestos` exista
- Verificar permisos del bucket


