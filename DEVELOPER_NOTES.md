# 📋 Grabeat App Developer Hand-off & Dev Notes

This file contains crucial API, database, environment, and repository details needed for mobile app development and system administration.

---

## 1. 🌐 API Endpoints & Interactive Documentation
* **Production API Base URL**: `https://grabeat-backend.onrender.com/api/v1`
* **Interactive Swagger Documentation**: `https://grabeat-backend.onrender.com/api-docs`
  * Use the Swagger UI page to verify schemas, request headers, request bodies, and check response templates for all routes.

---

## 2. 🔐 Credentials for Testing
Use these seeded accounts to log in and test endpoints that require authentication (Bearer Token auth):

* **Super Admin Account**:
  * **Email**: `superadmin@cugrabeats.com`
  * **Password**: `@Ryansri_001`
* **Normal Admin Account**:
  * **Email**: `admin@cugrabeats.com`
  * **Password**: `@Ryansri_001`

---

## 3. 📂 Repository Structure (Monorepo)
* **`/backend`**: Express.js server, Prisma ORM schema, and database seeding scripts.
* **`/frontend`**: Next.js client for the web-based Flat UI Admin Dashboard and Student Portal view.

---

## 4. 🛢️ Database (Supabase PostgreSQL)
* **Host**: `aws-0-ap-south-1.pooler.supabase.com`
* **Port**: `5432` (Direct migrations) or `6543` (Transaction pooler)
* **Database Name**: `postgres`
* **Username**: `postgres.ftcgykobqdbyrpvelola`

---

## 5. 🖼️ Cloudinary (Image Uploads)
All product and venue images are configured to upload to the following Cloudinary folder structure:
* **Target Upload Folder**: `products`
