# Mobile-First Tailwind Cleanup - Resumen de Cambios

## Archivos Modificados

### Componentes UI Base
1. **src/components/ui/Button.tsx**
   - ✅ Eliminado `min-h` fijo
   - ✅ Siempre `w-full` (full-width)
   - ✅ Solo padding vertical

2. **src/components/ui/Input.tsx**
   - ✅ Eliminado `min-h` fijo
   - ✅ `w-full` siempre
   - ✅ Solo padding

3. **src/components/ui/Select.tsx**
   - ✅ Eliminado `min-h` fijo
   - ✅ `w-full` siempre
   - ✅ Solo padding

4. **src/components/ui/NumberSelector.tsx**
   - ✅ Eliminados `w-*` fijos en botones
   - ✅ Botones con `min-w-[44px] min-h-[44px]` (área táctil mínima)
   - ✅ Campo central con `flex-1` para ocupar espacio disponible
   - ✅ Solo padding, sin width fijos

5. **src/components/ui/Stepper.tsx**
   - ✅ Círculos: `w-10 h-10` → `min-w-[44px] min-h-[44px]`
   - ✅ Texto: `max-w-[60px]` → `flex-1` con `truncate`
   - ✅ Línea conectora: `h-1` → `py-0.5` (padding vertical)

6. **src/components/ui/Toggle.tsx**
   - ✅ Eliminado `min-h-[64px]` fijo
   - ✅ Toggle switch: `h-7 w-12` → `min-w-[44px] min-h-[44px]`
   - ✅ Toggle circle: `h-5 w-5` → tamaño con flex
   - ✅ Card con `w-full` y padding

7. **src/components/ui/StickyFooter.tsx**
   - ✅ Cambiado de `sticky` a `fixed bottom-0 left-0 right-0`
   - ✅ `w-full` siempre
   - ✅ Padding `p-4`

### Componentes de Formulario
8. **src/components/form/MaterialCardCollapsable.tsx**
   - ✅ Card con `w-full` y `p-4`
   - ✅ Checkbox: `w-5 h-5` → `min-w-[44px] min-h-[44px]`
   - ✅ Botones de cantidad: `min-w-[44px] min-h-[44px]`
   - ✅ Campo central con `flex-1`
   - ✅ `max-h-[500px]` → `max-h-[60vh]`
   - ✅ Iconos SVG con tamaño inline style (20px)

### Pantallas
9. **src/screens/Wizard/Paso4Materiales.tsx**
   - ✅ Scroll container con `pb-36` para evitar solapamiento con footer fixed
   - ✅ Eliminados márgenes negativos

10. **src/screens/Wizard/Paso3DimensionesYMateriales.tsx**
    - ✅ Eliminados márgenes negativos
    - ✅ `max-h-[60vh]` (ya estaba correcto)

11. **src/screens/Wizard/WizardPresupuesto.tsx**
    - ✅ Eliminado `max-w-2xl mx-auto`
    - ✅ `w-full` en todos los contenedores
    - ✅ Solo padding horizontal

## Valores Fijos Mantenidos (Documentados)

### Áreas Táctiles Mínimas (Requisito de Accesibilidad)
- `min-w-[44px] min-h-[44px]` en:
  - Checkboxes
  - Botones interactivos (+/-)
  - Toggle switches
  - Círculos del Stepper

**Razón**: Cumple con las guías de accesibilidad (Apple HIG, Material Design) que requieren mínimo 44x44px para áreas táctiles.

### Alturas Máximas para Animaciones
- `max-h-[60vh]` en:
  - Panel colapsable de MaterialCard
  - Contenedores con scroll

**Razón**: Permite animaciones suaves de expand/collapse y limita el scroll a 60% del viewport height en móvil.

- `max-h-0` en:
  - Estado colapsado de paneles

**Razón**: Necesario para la animación CSS de colapso.

### Tamaños de Iconos SVG
- Iconos con `style={{ width: '20px', height: '20px' }}`

**Razón**: Los SVG necesitan un tamaño base para renderizar correctamente. Se usa inline style en lugar de clases Tailwind para evitar conflictos con flex.

## Mejoras Implementadas

1. ✅ Todos los botones son full-width por defecto
2. ✅ Cards usan `w-full` y padding consistente (`p-4`)
3. ✅ Footer sticky convertido a fixed fuera del scroll
4. ✅ Scroll container con `pb-36` para evitar solapamiento
5. ✅ Controles interactivos con área táctil mínima de 44px
6. ✅ Layouts usando flex-1 en lugar de width fijos
7. ✅ Eliminados todos los márgenes horizontales fijos
8. ✅ Solo padding y gap para espaciado

## Testing Recomendado

### Dispositivos
- iPhone SE (375x667)
- Pixel 4 (393x851)
- Tablet (768x1024)

### Estados a Verificar
1. MaterialCard colapsado
2. MaterialCard expandido
3. MaterialCard seleccionado

## Notas Adicionales

- **MaterialCard.tsx** (componente antiguo): Contiene valores fijos pero ya no se usa en producción. Se mantiene por compatibilidad pero debería eliminarse en futuras refactorizaciones.

