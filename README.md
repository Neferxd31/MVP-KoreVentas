# KoreVentas (VentaFlow Base) — MVP

SaaS multi-tenant de gestión de ventas y clientes para comercios pequeños y negocios de servicios.

> Base técnica del MVP. Desarrollo 100% local dockerizado.

## Estructura

```
.
├── backend/              # Spring Boot 3 + Java 21 + PostgreSQL + Flyway + JWT
├── frontend/             # Vite + React 18 + TypeScript + Tailwind + React Query
├── docker-compose.yml    # Todo dockerizado (producción-like)
├── docker-compose.dev.yml # Desarrollo con hot-reload
└── docs/
```

## Requisitos previos

Solo necesitas **Docker Desktop**. Nada más.

Para desarrollo sin Docker también puedes usar: Java 21, Maven 3.9+, Node 20+, npm.

## Arrancar todo con Docker

### Opción A — Producción-like (todo buildeado)

```bash
docker compose up --build
```

- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:8080/api/health**

### Opción B — Desarrollo con hot-reload (recomendado para desarrollar)

```bash
docker compose -f docker-compose.dev.yml up
```

- Frontend (Vite dev server): **http://localhost:5173**
- Backend API: **http://localhost:8080/api/health**

Editas archivos en tu editor y los cambios se reflejan al instante:
- Frontend: Vite hace hot-reload automático.
- Backend: guarda el archivo Java y Maven recompila.

### Parar todo

```bash
docker compose down
# o
docker compose -f docker-compose.dev.yml down
```

### Resetear base de datos

```bash
docker compose down -v    # -v borra los volumes (datos de Postgres)
docker compose up --build
```

## Arrancar sin Docker (manual)

```bash
# 1) PostgreSQL (necesitas Docker para la DB al menos)
cd infra && docker compose up -d

# 2) Backend
cd backend && mvn spring-boot:run

# 3) Frontend
cd frontend && npm install && npm run dev
```

## Endpoints disponibles

| Método | Ruta              | Auth    | Descripción                           |
|--------|-------------------|---------|---------------------------------------|
| GET    | /api/health       | No      | Health check del backend              |
| POST   | /api/auth/register| No      | Registrar negocio + primer admin      |
| POST   | /api/auth/login   | No      | Login, retorna JWT                    |

### Registro

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Barbería Don Andrés",
    "businessType": "barberia",
    "fullName": "Andrés López",
    "email": "andres@example.com",
    "password": "12345678"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "andres@example.com",
    "password": "12345678"
  }'
```

## Multi-tenant + RLS

- Cada tabla de negocio lleva `tenant_id`.
- PostgreSQL enforce el aislamiento vía Row Level Security.
- El backend setea `app.tenant_id` por petición vía aspecto Spring.
- Las tablas de auth (tenants, users) no llevan RLS porque se consultan antes de tener contexto de tenant.

## Convenciones

- Indentación: 2 espacios.
- Commits en inglés, imperativo, minúsculas: `feat: add login form`.
- Nombres de archivos frontend en kebab-case.
- Paquetes Java en lowercase.
