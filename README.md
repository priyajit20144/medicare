# MEDICARE — Professional Full-Stack Healthcare Platform

Medicare is an enterprise-grade digital healthcare platform combining online pharmacy e-commerce, secure prescription uploads with licensed pharmacist review workflows, doctor discovery and appointment booking with conflict prevention, preventive health checkup packages, diagnostic facility directories, 1-year premium healthcare memberships, and comprehensive administrative oversight.

---

## 1. Architecture & Technology Stack

### Frontend Client
* **Framework:** React 18 + Vite + TypeScript (Strict Type Safety)
* **Styling & Design System:** Tailwind CSS with Plus Jakarta Sans typography, custom healthcare color palette, and accessible contrast ratios
* **UI & Animation:** Lucide React icons + Framer Motion micro-interactions
* **State Management:** Zustand (reactive auth and cart stores)
* **Server State & Caching:** TanStack Query v5 with optimistic invalidations
* **Routing & Protection:** React Router v6 with `ProtectedRoute` and `RoleProtectedRoute`

### Backend Server
* **Runtime:** Node.js (v20+ LTS) + Express + TypeScript
* **Database & ODM:** MongoDB Atlas + Mongoose (Strictly No PostgreSQL / No Prisma)
* **Security & Hardening:** Helmet, CORS, Express Rate Limiting, BCrypt password hashing, JWT tokens
* **Validation:** Zod schema validation for API request bodies and query parameters
* **File Uploads:** Multer with strict MIME validation (PDF, JPG, PNG), file size limits (10MB), and private streaming routes with audit trails
* **Payment Architecture:** Decoupled `PaymentService` abstraction supporting mock development mode and drop-in real payment gateways

---

## 2. Directory Structure

```text
medicare/
├── client/                      # React + TypeScript + Vite frontend
│   ├── public/                  # SVG logos and static assets
│   ├── src/
│   │   ├── api/                 # Strongly typed fetch API client
│   │   ├── components/          # Reusable UI (StatusBadge, EmptyState, LoadingState, Disclaimers)
│   │   ├── layouts/             # MainLayout, DashboardLayout, AdminLayout
│   │   ├── pages/               # Feature pages
│   │   │   ├── admin/           # Admin Dashboard, Medicines, Orders, Appointments, Users, Packages, Facilities, Audit Logs
│   │   │   ├── auth/            # Login, Register, Forgot Password
│   │   │   ├── cart/            # Cart drawer & full cart page with Rx enforcement
│   │   │   ├── checkout/        # Multi-step checkout with address & Rx attachment
│   │   │   ├── checkups/        # Health checkup packages & booking
│   │   │   ├── doctor/          # Doctor clinical dashboard & schedule
│   │   │   ├── doctors/         # Doctor directory & profile booking
│   │   │   ├── facilities/      # Healthcare centers & diagnostic hubs
│   │   │   ├── medicines/       # Medicine marketplace with filters & search
│   │   │   ├── pharmacist/      # Pharmacist prescription review console
│   │   │   ├── premium/         # VIP 1-Year Membership subscription
│   │   │   └── user/            # Patient dashboard, orders, prescriptions, appointments, notifications
│   │   ├── routes/              # Route protection guards
│   │   ├── store/               # Zustand global client stores (auth, cart)
│   │   ├── types/               # TypeScript interfaces & domain models
│   │   ├── App.tsx              # Application router & QueryClientProvider
│   │   ├── main.tsx             # DOM mounting entry
│   │   └── index.css            # Tailwind directives & design tokens
│   ├── package.json
│   └── vite.config.ts           # Proxy configuration to :5000 backend
│
├── server/                      # Node.js + Express + Mongoose backend
│   ├── src/
│   │   ├── config/              # MongoDB Atlas connection & environment loader
│   │   ├── controllers/         # Request handling & business orchestration
│   │   ├── middleware/          # JWT auth, RBAC authorization, Multer upload, error handling
│   │   ├── models/              # Mongoose schemas (User, Doctor, Pharmacist, Medicine, Prescription, Order, etc.)
│   │   ├── routes/              # Express REST routing
│   │   ├── seed/                # Seed script with 20+ medicines, 10+ doctors, checkups, facilities
│   │   ├── services/            # Payment gateway abstraction
│   │   ├── tests/               # Vitest integration test suites
│   │   ├── utils/               # JWT helpers, passwords, audit logger, response wrappers
│   │   ├── validators/          # Zod request validators
│   │   ├── app.ts               # Express middleware assembly
│   │   └── server.ts            # Entrypoint with graceful DB connection
│   └── package.json
│
├── .env                         # Actual local environment configuration (Safe placeholders)
├── .gitignore                   # Ignores .env, node_modules, dist, uploads
├── package.json                 # Monorepo root scripts
└── README.md                    # Platform documentation
```

---

## 3. Environment Configuration

The application reads all configuration directly from the actual root `.env` file.

> **CRITICAL NOTE:** In accordance with project architectural specifications, `.env.example` is **NOT created**. The developer or deployment administrator must configure credentials directly in the `.env` file.

### Required Environment Variables

```env
NODE_ENV=development
PORT=5000

APP_URL=http://localhost:5173
API_URL=http://localhost:5000

# MongoDB Atlas Database URI (Provided by User)
MONGODB_URI="mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/medicare"

# JWT Authentication Secret (Provided by User)
JWT_SECRET="REPLACE_WITH_YOUR_JWT_SECRET"
JWT_EXPIRES_IN="7d"

SESSION_SECRET="REPLACE_WITH_YOUR_SESSION_SECRET"
CORS_ORIGIN="http://localhost:5173"

STORAGE_PROVIDER="local"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=10

PAYMENT_PROVIDER="mock"
PAYMENT_SECRET=""

EMAIL_PROVIDER=""
EMAIL_API_KEY=""

FRONTEND_URL="http://localhost:5173"
VITE_API_URL="http://localhost:5000/api"

# Auth0 API Settings (from Auth0 Dashboard)
AUTH0_AUDIENCE="http://localhost:5000"
AUTH0_API_ID="6abc42caa9ce5f0ef7176151"
AUTH0_DOMAIN="YOUR_AUTH0_TENANT.us.auth0.com"
AUTH0_ALGORITHM="RS256"
AUTH0_TOKEN_LIFETIME=86400
```

> **Security Mandate:** Never commit real credentials or live MongoDB Atlas connection strings to source control. Only server-side code has access to `MONGODB_URI` and `JWT_SECRET`.

---

## 4. Quickstart & Installation

### Prerequisites
* **Node.js:** v20.x LTS or higher
* **npm:** v10.x or higher
* **MongoDB Atlas:** A MongoDB cluster with network access allowed for your server IP.

### Step 1: Install Dependencies
```bash
# Install root orchestration tools
npm install

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
cd ..
```

### Step 2: Configure Environment
Open `.env` in the root folder and update `MONGODB_URI` with your MongoDB Atlas cluster connection string and `JWT_SECRET` with your secret key:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/medicare?retryWrites=true&w=majority"
JWT_SECRET="my_secure_super_secret_jwt_key_2026"
```

### Step 3: Initialize Production Baseline Configuration
Initialize baseline system categories, healthcare diagnostic test catalog, checkup packages, partner facilities, and the 1-Year VIP Membership Plan:
```bash
npm run seed
```

### Step 4: Run Development Servers
```bash
npm run dev
```
* **Frontend Application:** `http://localhost:5173`
* **Backend REST API:** `http://localhost:5000/api`
* **Health Check:** `http://localhost:5000/api/health`

---

## 5. User Roles & Security Access Control

Medicare provides authentic role-based access control (RBAC) backed by MongoDB Atlas and BCrypt hashed credentials:

| Role | Access Capabilities |
| :--- | :--- |
| **System Admin** | Complete platform oversight, inventory management, revenue analytics, user governance, audit trail |
| **Pharmacist** | Prescription verification queue, clinical notes, approve/reject/clarify patient prescriptions |
| **Doctor** | Clinical appointments dashboard, consultation management, patient communication |
| **Patient / User** | Pharmacy ordering, prescription upload, doctor appointments, checkup bookings, 1-Year VIP membership |

Users register securely via `/register` or can be provisioned by administrators. Initial system admin can also be provisioned on startup via `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables.

---

## 6. Core Modules & Workflows

### 1. Medicine E-Commerce
* **Catalog:** Search, category filters, dosage forms, manufacturer details, and prescription requirement indicators.
* **Safety Verification:** Medicines marked `requiresPrescription: true` enforce prescription attachment before checkout completion.
* **Inventory Management:** Atomic stock decrement during order processing with transaction safety.

### 2. Private Prescription Review Workflow
```text
Patient Uploads Document (PDF/PNG/JPG)
         ↓
Status: PENDING_REVIEW
         ↓
Licensed Pharmacist Claims Prescription
         ↓
Pharmacist Verifies Dosage, Validity & Physician Credentials
         ↓
Approval / Rejection / Clarification with Clinical Notes
         ↓
Patient Receives Notification & Can Order Verified Medications
```
* **Security & Privacy:** Prescriptions are stored in protected directories (never in public web roots). Downloads are streamed through authenticated routes verifying user ownership or clinical roles (`GET /api/prescriptions/:id/files/:filename`).

### 3. Doctor Discovery & Appointment Booking
* **Search & Filters:** Search by specialty (Cardiology, Dermatology, Neurology, Pediatrics, etc.), experience, fee, and format (In-Person vs. Video Telehealth).
* **Double-Booking Prevention:** Atomic scheduling checks prevent overlapping appointments for the same doctor, date, and time slot.

### 4. Preventive Health Checkups
* Bundled diagnostic packages (Basic Health, Cardiac Screening, Comprehensive Executive, Diabetes Panel).
* Over 20 individual laboratory biomarkers (Complete Blood Count, Lipid Panel, HbA1c, Liver Function).
* Diagnostic report uploads with secure patient delivery.

### 5. Healthcare Facilities Network
* Directory of certified partner clinics, diagnostic labs, sample collection centers, and pharmacies.
* Operating hours, direct contact details, and available screening packages.

### 6. Premium 1-Year VIP Membership
* Configurable benefit allowances (Free express delivery, complimentary annual executive checkup, specialist video visits, member discounts).
* Real-time allowance tracking (`MembershipBenefitUsage`).

### 7. Administrative Console (`/admin`)
* **Analytics Overview:** Live database aggregation for total revenue, active orders, clinical appointments, and user registrations.
* **Inventory Controls:** Full CRUD for pharmaceutical stock, pricing, and prescription requirements.
* **Audit Trail:** Immutable logging of security-critical actions (logins, prescription decisions, user role updates, order status changes).

---

## 7. REST API Reference (Sample)

| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new patient account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session profile |
| `GET` | `/api/medicines` | Public | Search and filter medicine catalog |
| `POST` | `/api/admin/medicines` | `ADMIN` | Create new pharmaceutical product |
| `POST` | `/api/prescriptions` | `USER` | Upload prescription file & metadata |
| `GET` | `/api/prescriptions/:id/files/:file` | Owner / Clinician | Stream protected medical document |
| `PATCH`| `/api/pharmacist/prescriptions/:id/review` | `PHARMACIST`, `ADMIN` | Approve, reject, or request clarification |
| `GET` | `/api/doctors` | Public | Browse verified doctors & schedules |
| `POST` | `/api/appointments` | `USER` | Book appointment with conflict checks |
| `POST` | `/api/orders` | `USER` | Create order with stock decrement |
| `GET` | `/api/admin/analytics/overview` | `ADMIN` | Real-time platform business metrics |
| `GET` | `/api/admin/audit-logs` | `ADMIN` | Query security and compliance logs |

---

## 8. Quality Assurance & Automated Testing

The project includes automated integration and unit test suites:

```bash
# Run all tests across server and client
npm test

# Run server backend test suite
npm --prefix server test

# Run frontend test suite
npm --prefix client test

# Validate TypeScript type safety
npm --prefix server run build
npm --prefix client run build
```

---

## 9. Healthcare Safety Disclaimer

Medicare is a healthcare workflow platform designed to connect patients, licensed pharmacies, diagnostic facilities, and qualified medical professionals.

* The platform **does NOT provide autonomous medical diagnosis or automatic medication prescribing**.
* Prescription medications strictly require verification by a licensed human pharmacist.
* In the event of a medical emergency, patients are instructed to call their local emergency number immediately.

---

## 10. Production Deployment Guidelines

1. **Environment Secrets:** Supply real `MONGODB_URI`, `JWT_SECRET`, and payment gateway keys via secure production environment variables (e.g. AWS Secrets Manager, Vercel, or Render environment settings). Never commit `.env` to Git.
2. **Reverse Proxy & HTTPS:** Configure NGINX or Cloudflare with TLS 1.3 encryption and HTTP Strict Transport Security (HSTS).
3. **Database Optimization:** Ensure MongoDB Atlas IP Whitelist is restricted to your production servers, and compound indexes are active.
4. **Storage Architecture:** Transition from local disk storage to encrypted cloud object storage (e.g. AWS S3 with KMS server-side encryption) using the modular `StorageService` interface.
