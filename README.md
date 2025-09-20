# Backend Tokokue

Backend project untuk toko online menggunakan **Express**, **Prisma ORM**, dan **PostgreSQL**.

---

## Table of Contents

- [Requirements](#requirements)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Run Development Server](#run-development-server)
- [API Endpoints](#api-endpoints)
- [Notes](#notes)

---

## Requirements

- Node.js >= 18
- npm
- PostgreSQL (misal pakai Laragon)
- Git

---

## Setup

1. Clone repository:

```bash
git clone <repository-url>
cd backend-tokokue
```

2. Install dependencies:

```bash
npm install
```

3. Environment Variables:

```bash
APP_PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/tokokue"
JWT_SECRET="your_secret_key"
```

## Database Setup

1. Pastikan PostgreSQL aktif.

2. Buat database baru (tokokue) lewat pgAdmin / terminal.

3. Jalankan Prisma migrate:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Run Dev Server:

```bash
npm run dev
```

Server akan berjalan di http://localhost:5000

## API Endpoints

### Roles

- **GET** `/api/roles`

### Users

- **POST** `/api/users/register`
- **POST** `/api/users/login`
- **PATCH** `/api/users/profile` -> Required token

```http
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "name": "User",
  "email": "user@example.com",
  "password": "password123"
  ///"roleId": default user///
}

```

### Other In Develop
