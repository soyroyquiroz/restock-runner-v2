# RESTOCK RUNNER V2 ✅

## SETUP COMPLETO - YA LISTO PARA USAR

### 📋 Archivos Creados:
- ✅ `package.json` - Dependencias de npm
- ✅ `.env.local` - Credenciales Supabase
- ✅ `sql/schema.sql` - Base de datos completa
- ✅ `lib/supabase.ts` - Cliente Supabase
- ✅ `lib/data.ts` - Configuración de datos
- ✅ `hooks/useRestock.ts` - Estado global (Zustand)
- ✅ `pages/index.tsx` - Página principal con workflow
- ✅ `pages/_app.tsx` - App wrapper
- ✅ `styles/globals.css` - Estilos
- ✅ `next.config.js` - Configuración Next.js
- ✅ `tsconfig.json` - TypeScript config

---

## PASOS FINALES - 5 MINUTOS

### 1️⃣ CREAR TABLAS EN SUPABASE (PRIMERO)

```bash
# Copia TODO el contenido de /root/restock-runner-v2/sql/schema.sql
# Pégalo en: https://app.supabase.com/project/wzbyeilknoxzrddhzavm/sql/new
# Presiona "Run" o Cmd+Enter
```

**⚠️ IMPORTANTE**: Haz esto ANTES de instalar npm

### 2️⃣ INSTALAR DEPENDENCIAS

```bash
cd /root/restock-runner-v2
npm install
```

Tarda ~2-3 minutos (descarga React, Next, Supabase, Zustand, etc.)

### 3️⃣ CORRER EN DESARROLLO

```bash
npm run dev
```

Abre: http://localhost:3000

---

## ESTRUCTURA DEL APP

### Flujo de Usuario:
1. **Selecciona tipo**: Outside (Lodges) o Main Hotel
2. **Elige ubicación**: Lodge/Bridge o Piso
3. **Elige tipo restock**: Profundidad (todos items) o Urgente (críticos)
4. **Ajusta niveles**: Sliders con gradiente rojo→amarillo→verde
5. **Envía**: Guarda reporte en Supabase

### Estado (Zustand):
- `entity` - Outside o Main
- `lodge`, `bridge`, `piso` - Ubicación
- `restockType` - Tipo de restock
- `itemFill` - Niveles de cada item (0-100%)

---

## CREDENCIALES

```
Supabase URL: https://wzbyeilknoxzrddhzavm.supabase.co
Anon Key: sb_publishable_OkDHvv4P5OBl7y8DALgBwQ_uXyGrQ0T
```

Están en `.env.local` (ya configuradas)

---

## PRÓXIMOS PASOS

### V2 Features a agregar:
- ✅ Autenticación (Supabase Auth)
- ✅ Sliders con steps lógicos (casos, sleeves, cajas verdes)
- ✅ Delivery logic (piezas vs cajas)
- ✅ Real-time sync (Supabase Realtime)
- ✅ Admin dashboard (Rodrigo - inventario isla-wide)
- ✅ User hierarchy (runners vs supervisors)
- ✅ Historial de reportes

---

## TROUBLESHOOTING

### Error: "Cannot find module '@supabase/supabase-js'"
→ Ejecuta: `npm install`

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"
→ Verifica `.env.local` está en la raíz del proyecto

### Puerto 3000 ya en uso
→ Ejecuta: `npm run dev -- -p 3001`

---

## DEPLOYED?

Para deployar a producción:
```bash
npm run build
npm start
```

O en Vercel:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <tu-repo-github>
git push -u origin main
# Luego conecta en vercel.com
```

---

**Rodrigo, ¡listo para usar!** 🚀
