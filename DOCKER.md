# Docker Setup - Backend (posyandu-be)

Backend service untuk aplikasi Posyandu dengan Prisma managed database.

## 🚀 Quick Start

```bash
# 1. Setup environment
cd posyandu-be
cp .env.example .env

# Edit .env dan set:
# - DATABASE_URL (dari Prisma dashboard)
# - BETTER_AUTH_SECRET
# - API_KEY

# 2. Build dan jalankan
docker-compose up -d

# 3. Lihat logs
docker-compose logs -f

# 4. Akses API
# http://localhost:3000/api/v1
```

## 🛑 Stop Service

```bash
docker-compose down
```

## 📝 Environment Variables

Wajib diisi di `.env`:

- `DATABASE_URL` - Connection string dari Prisma
- `BETTER_AUTH_SECRET` - Secret key (32+ karakter)
- `API_KEY` - API protection key (32+ karakter)

Optional:

- `BACKEND_PORT` - Default: 3000
- `BETTER_AUTH_URL` - Default: http://localhost:3000

## 🔧 Commands

```bash
# Rebuild
docker-compose build --no-cache

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# Execute commands
docker-compose exec backend sh
docker-compose exec backend npx prisma studio
```
