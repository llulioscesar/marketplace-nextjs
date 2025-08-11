# 🛍️ Marketplace Básico - Next.js Monolith

Aplicación de marketplace desarrollada con Next.js 14, TypeScript, Prisma y PostgreSQL. Soporta dos tipos de usuarios: Business (vendedores) y Customers (compradores).

## 🚀 Características

### Para Usuarios Públicos
- ✅ Navegación por todas las tiendas disponibles
- ✅ Visualización de productos por tienda
- ✅ Sin necesidad de registro para explorar

### Para Clientes (Customers)
- ✅ Registro y autenticación
- ✅ Carrito de compras con persistencia
- ✅ Compra de productos de múltiples tiendas
- ✅ Historial de pedidos
- ✅ Perfil personalizado

### Para Negocios (Business)
- ✅ Registro y autenticación
- ✅ Creación y gestión de múltiples tiendas
- ✅ Gestión completa de productos por tienda
- ✅ Panel de control con pedidos recibidos
- ✅ Gestión de órdenes con cambio de estados
- ✅ Estadísticas de ventas y reportes

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js v4
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** React Hook Form + Zod
- **State Management:** Zustand + @tanstack/react-query
- **Notifications:** Sonner
- **Icons:** Lucide React

## 📋 Comandos Disponibles

### Desarrollo
```bash
# Iniciar servidor de desarrollo con Turbopack
npm run dev

# Verificar tipos TypeScript
npm run type-check

# Linting
npm run lint
```

### Base de Datos
```bash
# Generar cliente Prisma
npm run db:generate

# Push schema a la base de datos (development)
npm run db:push

# Crear y aplicar migraciones
npm run db:migrate

# Cargar datos de prueba
npm run db:seed

# Abrir Prisma Studio (GUI para la DB)
npm run db:studio
```

### Producción
```bash
# Build para producción
npm run build

# Iniciar servidor de producción
npm run start
```

### Utilidades
```bash
# Generar secret para NextAuth
npm run auth:secret
```

## 📦 Instalación Local

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
```

3. **Configurar variables de entorno**

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/marketplace_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-key-super-segura-aqui" # Generar con: npm run auth:secret
```

4. **Configurar la base de datos**

```bash
# Crear la base de datos (si no existe)
createdb marketplace_db

# Ejecutar migraciones
npm run db:migrate

# Cargar datos de prueba
npm run db:seed
```

5. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🐳 Instalación con Docker Compose

### Prerrequisitos

- Docker
- Docker Compose

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/[tu-usuario]/marketplace-nextjs.git
cd marketplace-nextjs
```

2. **Iniciar todos los servicios**
```bash
docker-compose up -d
```

Esto iniciará:
- **App Next.js**: [http://localhost:3000](http://localhost:3000)
- **PostgreSQL**: puerto 5432
- **pgAdmin**: [http://localhost:8080](http://localhost:8080)
  - Email: `admin@admin.com`
  - Password: `admin`

### Ejecutar migraciones y seed en Docker

```bash
# Ejecutar migraciones
docker exec -it web npm run db:migrate

# Cargar datos de prueba
docker exec -it web npm run db:seed

# Ver logs del contenedor de la app
docker logs -f web

# Entrar al contenedor para ejecutar comandos
docker exec -it web sh
```

### Comandos útiles Docker

```bash
# Ver servicios corriendo
docker-compose ps

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes (⚠️ Elimina datos de la DB)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f site
```

## 📱 URLs y Rutas Implementadas

### 🌐 Rutas Públicas
- `GET /` - Landing page
- `GET /stores` - Lista de todas las tiendas
- `GET /stores/[slug]` - Detalle de tienda con productos

### 🔐 Rutas de Autenticación
- `GET /login` - Inicio de sesión
- `GET /register` - Registro con selección de tipo de usuario
- `GET /unauthorized` - Página de acceso denegado

### 👤 Área de Clientes (Customer)
- `GET /orders` - Historial de pedidos del cliente
- `GET /checkout` - Proceso de compra

### 🏪 Panel de Negocios (Business)
- `GET /dashboard` - Panel principal con estadísticas
- `GET /dashboard/stores` - Gestión de tiendas
- `GET /dashboard/stores/new` - Crear nueva tienda
- `GET /dashboard/stores/[id]/edit` - Editar tienda
- `GET /dashboard/products` - Gestión de productos
- `GET /dashboard/products/new` - Crear nuevo producto
- `GET /dashboard/products/[id]/edit` - Editar producto
- `GET /dashboard/orders` - Gestión de órdenes recibidas

### 🔌 API Routes

#### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `ALL /api/auth/[...nextauth]` - NextAuth endpoints

#### APIs Públicas
- `GET /api/public/stores` - Lista pública de tiendas
- `GET /api/public/stores/[slug]/products` - Productos de una tienda

#### APIs de Negocios (Business)
- `GET|POST /api/business/stores` - CRUD tiendas
- `GET|PUT|DELETE /api/business/stores/[id]` - Gestión de tienda específica
- `GET|POST /api/business/products` - CRUD productos
- `GET|PUT|DELETE /api/business/products/[id]` - Gestión de producto específico
- `POST /api/business/products/bulk` - Operaciones masivas
- `GET /api/business/products/stats` - Estadísticas de productos
- `GET /api/business/orders` - Órdenes recibidas
- `PUT /api/business/orders/[id]` - Actualizar estado de orden
- `GET /api/business/reports` - Reportes y estadísticas
- `GET /api/business/dashboard` - Datos del dashboard

#### APIs de Clientes (Customer)
- `GET /api/customer/orders` - Órdenes del cliente
- `GET /api/customer/orders/[id]` - Detalle de orden específica
- `GET /api/customer/stats` - Estadísticas del cliente
- `POST /api/orders` - Crear nueva orden (checkout)

## 👥 Usuarios de Prueba

Después de ejecutar el seed (`npm run db:seed`), tendrás disponibles los siguientes usuarios:

### 🏢 Cuentas Business (Vendedores)
| Email | Contraseña | Tiendas |
|-------|------------|---------|
| business1@test.com | password123 | Electrónica Digital, Audio Premium |
| business2@test.com | password123 | Moda Urbana, Librería Cultura |

### 🛍️ Cuentas Customer (Compradores)
| Email | Contraseña |
|-------|------------|
| customer1@test.com | password123 |
| customer2@test.com | password123 |

## 🗂️ Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 🔐 Rutas de autenticación
│   │   ├── login/         # Inicio de sesión
│   │   └── register/      # Registro de usuarios
│   ├── (business)/        # 🏪 Dashboard de negocios
│   │   └── dashboard/     # Panel de administración
│   ├── (customer)/        # 👤 Área de clientes
│   │   ├── checkout/      # Proceso de compra
│   │   └── orders/        # Historial de pedidos
│   ├── stores/            # 🌐 Páginas públicas de tiendas
│   └── api/               # 🔌 API Routes
│       ├── auth/          # Autenticación
│       ├── business/      # APIs para negocios
│       ├── customer/      # APIs para clientes
│       └── public/        # APIs públicas
├── components/            # ⚛️ Componentes React
│   ├── business/          # Componentes para panel business
│   ├── customer/          # Componentes para área customer
│   │   ├── stores/        # Lista y detalle de tiendas
│   │   ├── products/      # Cards y grids de productos
│   │   ├── cart/          # Carrito de compras
│   │   └── checkout/      # Proceso de compra
│   ├── auth/              # Formularios de autenticación
│   ├── common/            # Componentes compartidos
│   ├── layouts/           # Layouts y navegación
│   └── ui/                # Componentes UI base (shadcn/ui)
├── hooks/                 # 🎣 Custom React Hooks
│   ├── auth/              # Hooks de autenticación
│   ├── business/          # Hooks para funciones business
│   ├── customer/          # Hooks para funciones customer
│   └── common/            # Hooks utilitarios
├── stores/                # 🗄️ State Management (Zustand)
│   ├── businessStore.ts   # Estado UI business
│   ├── cart.store.ts      # Estado del carrito
│   ├── products.store.ts  # Cache de productos
│   └── stores.store.ts    # Cache de tiendas
├── services/              # 🔧 Lógica de negocio
│   ├── business/          # Servicios para business
│   ├── customer/          # Servicios para customer
│   └── auth.service.ts    # Servicios de autenticación
├── lib/                   # 📚 Utilidades y configuración
│   ├── auth/              # Configuración NextAuth
│   ├── db/                # Configuración Prisma
│   ├── validations/       # Schemas Zod
│   └── utils/             # Funciones utilitarias
└── types/                 # 📝 TypeScript types
```

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

```env
DATABASE_URL=postgresql://usuario:password@host:5432/database
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=tu-secret-key-super-segura-en-produccion
```

## 🔒 Seguridad

- ✅ Autenticación con JWT mediante NextAuth
- ✅ Validación de datos con Zod en cliente y servidor
- ✅ Protección CSRF automática
- ✅ Sanitización de inputs
- ✅ Permisos basados en roles (Business/Customer)
- ✅ Validación de autorización en cada endpoint
- ✅ Hashing seguro de contraseñas con bcrypt

## 📈 Características Técnicas Destacadas

- **Server Side Rendering (SSR)** para mejor SEO
- **React Server Components** para mejor performance
- **Optimistic Updates** con Zustand + React Query
- **Responsive Design** mobile-first con Tailwind CSS
- **TypeScript** strict mode para type safety completa
- **Prisma** para type-safe database queries
- **Real-time notifications** con Sonner
- **Form validation** con React Hook Form + Zod
- **State persistence** con Zustand persist middleware
- **Image optimization** con Next.js Image component
