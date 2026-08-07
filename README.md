# CU Grab Eats - Campus Food Companion (Admin Panel & API Service)

CU Grab Eats is a campus food companion built specifically for Chandigarh University students. This repository contains:
1. **TypeScript Express.js Backend REST API** (versioned `/api/v1/`, JWT auth, Zod validation, Cloudinary, soft deletes, and audit logs).
2. **Next.js 15 Admin Dashboard** (a premium SaaS dashboard featuring a multi-step Venue Creation Wizard, Mess Menu weekly editor, Trash/Restore manager, and Audit log inspector).

---

## Technical Stack & Architecture

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, bcrypt, jsonwebtoken, Cloudinary, Multer, Helmet, Morgan, Compression, CORS, Rate Limiting, Zod.
- **Frontend (Admin Dashboard)**: Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, TanStack Table, React Hook Form, Zod.

---

## Folder Structure

```
├── backend/
│   ├── prisma/             # Schema, migrations, and seed script
│   ├── src/
│   │   ├── config/         # Database and Cloudinary configuration
│   │   ├── controllers/    # API controllers
│   │   ├── routes/         # Versioned routes (/api/v1)
│   │   ├── middlewares/    # Auth, upload, and error handling middlewares
│   │   ├── services/       # Business logic (e.g. Open Now calculation)
│   │   ├── repositories/   # Data access layers (with soft deletes)
│   │   ├── validators/     # Zod validation schemas
│   │   └── types/          # Shared type definitions
│   ├── swagger.json        # OpenAPI static documentation
│   ├── package.json
│   └── tsconfig.json
├── components/             # Shadcn and Dashboard React components
├── app/                    # Next.js App router pages
├── package.json
└── README.md
```

---

## Getting Started

### 1. Database Setup (Docker)
Ensure Docker is installed on your local computer, then spin up the PostgreSQL container:
```bash
cd backend
docker-compose up -d
```
This boots up a PostgreSQL server listening on port `5432` with username `postgres`, password `postgres`, and database `cugrabeats`.

### 2. Environment Variables Configuration
Check that `backend/.env` is set up:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cugrabeats?schema=public"
JWT_SECRET="super_secret_jwt_key_123!@#"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
NODE_ENV="development"
```

### 3. Run Migrations & Database Seeding
From the `backend/` directory:
```bash
# Run database migrations to construct the tables
npx prisma db push

# Seed the database with mock administrators, outlets, menu items, and mess schedule
npm run prisma:seed
```

### 4. Start the Express API Service
Start the hot-reloading development server:
```bash
npm run dev
```
The server will boot on [http://localhost:5000](http://localhost:5000).
Interactive Swagger API documentation is available at [http://localhost:5000/api-docs](http://localhost:5000/api-docs).

### 5. Start the Next.js Admin Dashboard
Go to the root workspace directory and run the Next.js development server:
```bash
npm run dev
```
Access the admin portal on [http://localhost:3000](http://localhost:3000).

- **Default Super Admin login**:
  - Email: `superadmin@cugrabeats.com`
  - Password: `admin123`

---

## Key Backend REST APIs for Flutter Integration

All endpoints are versioned under `/api/v1/`.

| Endpoint | Method | Authentication | Description |
|---|---|---|---|
| `/auth/login` | `POST` | Public | Authenticate admin, returns JWT |
| `/venues` | `GET` | Public | Fetch all venues (calculates `isOpenNow`) |
| `/venues/:id` | `GET` | Public | Fetch venue details, categories, and hours |
| `/menu-items` | `GET` | Public | Global menu items search & category filter |
| `/mess-menu/today` | `GET` | Public | Retrieve today's Hostel mess menu schedule |
| `/announcements` | `GET` | Public | Retrieve active campus food announcements |

---

## Production Deployment Instructions

1. **Database**: Provision a managed PostgreSQL instance (e.g. AWS RDS or Supabase) and update `DATABASE_URL`.
2. **Build Backend**:
   ```bash
   cd backend
   npm run build
   npm run start
   ```
3. **Build Frontend**:
   ```bash
   npm run build
   npm start
   ```
4. **Cloudinary**: Setup a production Cloudinary bucket to handle secure, optimized CDN assets delivery.
