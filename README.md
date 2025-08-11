# 🛍️ Marketplace Básico - Next.js Monolith

Aplicación de marketplace desarrollada con Next.js 14, TypeScript, Prisma y PostgreSQL. Soporta dos tipos de usuarios: Business (vendedores) y Customers (compradores).

## 🚀 Características

### Para Usuarios Públicos
- ✅ Navegación por todas las tiendas disponibles
- ✅ Visualización de productos por tienda
- ✅ Sin necesidad de registro para explorar

### Para Clientes (Customers)
- ✅ Registro y autenticación
- ✅ Compra de productos
- ✅ Historial de pedidos
- ✅ Perfil personalizado

### Para Negocios (Business)
- ✅ Registro y autenticación
- ✅ Creación de múltiples tiendas
- ✅ Gestión de productos por tienda
- ✅ Panel de control con pedidos recibidos
- ✅ Estadísticas de ventas

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js v5
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** React Hook Form + Zod
- **State Management:** Zustand

## 📦 Instalación

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm/yarn/pnpm

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/[tu-usuario]/marketplace-nextjs.git
cd marketplace-nextjs
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
# o
pnpm install
```

3. **Configurar variables de entorno**

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/marketplace_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-key-super-segura-aqui" # Generar con: openssl rand -base64 32

# Optional: Para imágenes (si usas uploadthing o similar)
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

4. **Configurar la base de datos**

```bash
# Crear la base de datos (si no existe)
createdb marketplace_db

# Ejecutar migraciones
npx prisma migrate dev

# Opcional: Ver la base de datos en Prisma Studio
npx prisma studio
```

5. **Cargar datos de prueba**

```bash
npm run db:seed
# o
npx tsx prisma/seed.ts
```

6. **Iniciar el servidor de desarrollo**

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 👥 Usuarios de Prueba

Después de ejecutar el seed, tendrás disponibles los siguientes usuarios:

### Cuentas Business (Vendedores)
| Email | Contraseña | Tiendas |
|-------|------------|---------|
| business1@test.com | password123 | Electrónica Digital, Audio Premium |
| business2@test.com | password123 | Moda Urbana, Librería Cultura |

### Cuentas Customer (Compradores)
| Email | Contraseña |
|-------|------------|
| customer1@test.com | password123 |
| customer2@test.com | password123 |

## 🗂️ Estructura del Proyecto

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Rutas de autenticación
│   ├── (public)/       # Rutas públicas
│   ├── (business)/     # Dashboard de negocios
│   ├── (customer)/     # Área de clientes
│   └── api/            # API Routes
├── components/         # Componentes React
├── lib/               # Utilidades y configuración
├── services/          # Lógica de negocio
├── hooks/             # Custom React Hooks
└── types/             # TypeScript types
```

## 📱 Rutas Principales

### Públicas
- `/` - Landing page
- `/stores` - Lista de todas las tiendas
- `/stores/[slug]` - Detalle de tienda
- `/stores/[slug]/products/[id]` - Detalle de producto

### Autenticación
- `/login` - Inicio de sesión unificado
- `/register` - Registro con selección de tipo de usuario

### Business Dashboard
- `/dashboard` - Panel principal
- `/dashboard/stores` - Gestión de tiendas
- `/dashboard/stores/new` - Crear nueva tienda
- `/dashboard/stores/[id]/products` - Gestión de productos
- `/dashboard/orders` - Ver pedidos recibidos

### Customer Area
- `/profile` - Perfil del cliente
- `/orders` - Historial de pedidos
- `/checkout` - Proceso de compra

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🚀 Deployment

### Build para Producción

```bash
npm run build
npm run start
```

### Variables de Entorno en Producción

Asegúrate de configurar las siguientes variables en tu servicio de hosting:

- `DATABASE_URL` - URL de PostgreSQL en producción
- `NEXTAUTH_URL` - URL de tu dominio
- `NEXTAUTH_SECRET` - Secret key segura

### Recomendaciones de Hosting

- **Aplicación:** Vercel, Railway, Render
- **Base de Datos:** Supabase, Neon, Railway PostgreSQL

## 🔒 Seguridad

- ✅ Autenticación con JWT mediante NextAuth
- ✅ Validación de datos con Zod
- ✅ Protección CSRF
- ✅ Rate limiting en APIs críticas
- ✅ Sanitización de inputs
- ✅ Permisos basados en roles

## 📈 Características Técnicas Destacadas

- **Server Side Rendering (SSR)** para mejor SEO
- **Incremental Static Regeneration (ISR)** para páginas de productos
- **Optimistic Updates** para mejor UX
- **Responsive Design** mobile-first
- **TypeScript** para type safety
- **Prisma** para type-safe database queries
- **React Server Components** para mejor performance