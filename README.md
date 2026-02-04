# Réseau+ Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.11-764ABC?logo=redux)](https://redux-toolkit.js.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?logo=prisma)](https://www.prisma.io/)

A professional platform connecting social care establishments with qualified independent social workers through a rigorous verification and labeling system.

## Overview

This platform digitizes the process of matching social workers with institutions, handling everything from registration to payment:

- **Social Workers**: Create verified profiles, manage availability, apply for missions, receive payments
- **Institutions**: Post missions, search qualified professionals, manage assignments, process payments
- **Administrators**: Verify credentials, moderate content, oversee platform operations

## Tech Stack

### Frontend

| Technology                | Purpose                          |
| ------------------------- | -------------------------------- |
| React 19                  | UI Framework                     |
| TypeScript 5.9            | Type Safety                      |
| Redux Toolkit + RTK Query | State Management & Data Fetching |
| Tailwind CSS 4            | Styling                          |
| shadcn/ui + Radix UI      | Component Library                |
| React Router 7            | Routing                          |
| React Hook Form + Zod     | Form Handling & Validation       |
| Stripe.js                 | Payment Integration              |
| react-big-calendar        | Availability Calendar            |
| Socket.IO Client          | Real-time Communication          |
| i18next + react-i18next   | Internationalization (i18n)      |

### Backend

| Technology          | Purpose                      |
| ------------------- | ---------------------------- |
| Node.js + Express 5 | API Server                   |
| TypeScript          | Type Safety                  |
| Prisma 7            | ORM                          |
| PostgreSQL (NeonDB) | Database                     |
| JWT + bcryptjs      | Authentication               |
| Cloudinary + Multer | File Storage                 |
| Stripe              | Payment Processing           |
| Nodemailer          | Email Service                |
| Swagger             | API Documentation            |
| Socket.IO           | Real-time WebSocket Server   |
| Zod                 | Request Validation           |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Frontend (React + Socket.IO Client)              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Pages → RTK Query Hooks → Redux Store → Axios Base Query          │    │
│  │  Real-time: Socket.IO Client → Event Handlers → UI Updates         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┬───────────────┬────────────────────────┘
                          REST API   │               │  WebSocket
┌────────────────────────────────────┴───────────────┴────────────────────────┐
│                     Backend (Express + Socket.IO Server)                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Routes → Controllers → Services → Prisma ORM → PostgreSQL          │    │
│  │  Real-time: Socket.IO Server → Event Emitters → Connected Clients  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **RTK Query**: Tag-based cache invalidation eliminates stale UI state automatically
- **Modular Endpoints**: Each domain (missions, applications, etc.) has its own endpoint module
- **Type-Safe**: Full TypeScript coverage with Zod validation on both ends
- **Real-time Communication**: WebSocket integration via Socket.IO for instant notifications and messaging
- **Auth Guards**: Multi-layer route protection with ProtectedRoute, RoleGuard, and WorkerVerifiedGuard
- **Internationalization**: Full i18n support with English and French translations

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios instance with auth interceptors
│   │   ├── components/       # Reusable UI components
│   │   │   ├── auth/         # Login, registration wizards
│   │   │   ├── common/       # DataTable, Calendar, KPICard, etc.
│   │   │   ├── payment/      # Stripe checkout components
│   │   │   ├── messaging/    # Chat and messaging components
│   │   │   └── ui/           # Base shadcn/ui components
│   │   ├── features/
│   │   │   ├── api/          # RTK Query API & endpoints
│   │   │   ├── slices/       # Redux slices (auth)
│   │   │   └── validation/   # Zod schemas
│   │   ├── pages/            # Route components by role
│   │   │   ├── admin/        # Admin dashboard, validations
│   │   │   ├── institution/  # Mission management, payments
│   │   │   └── worker/       # Applications, availability
│   │   ├── middleware/       # Route guards (auth, role, verification)
│   │   ├── contexts/         # React contexts (messaging, WebSocket)
│   │   ├── locales/          # i18n translation files (en, fr)
│   │   ├── types/            # TypeScript definitions
│   │   └── lib/              # Utilities (toast, stripe, calendar, socket)
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── socket/           # Socket.IO event handlers
│   │   └── types/            # TypeScript types
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Database seeding
│   └── package.json
│
└── docs/                     # Architecture documentation
```

## Features

### For Social Workers

- Multi-step registration with document uploads (CV, diplomas, ID)
- Interactive availability calendar with recurring slots
- Mission browsing with filters (speciality, domain, urgency)
- Application tracking and status updates
- Assignment management and completion
- Real-time messaging with institutions
- Review system for completed missions
- Multi-language support (English/French)

### For Institutions

- Mission posting with urgency levels and domain requirements
- Worker search with filtering by skills and availability
- Application management (accept/reject with notifications)
- Assignment tracking and status updates
- Real-time messaging with workers
- Stripe payment processing with fee calculation
- Worker rating and feedback
- Multi-language support (English/French)

### For Administrators

- Worker verification and credential validation
- Document review and approval workflow
- Domain and speciality management
- Platform-wide mission and assignment oversight
- Review moderation and management
- Admin action logging and audit trail
- Dashboard with KPIs and statistics
- Real-time notifications for admin actions

### Authentication & Authorization

- Seamless login/register flow with automatic role-based redirection
- Protected routes with loading states during authentication
- Session persistence across page refreshes
- Guest guards preventing authenticated users from accessing login/register pages

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (or NeonDB account)
- Cloudinary account (for file uploads)
- Stripe account (for payments)

### Environment Variables

**Backend (`backend/.env`)**

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
STRIPE_SECRET_KEY="sk_..."
SMTP_HOST="..."
SMTP_USER="..."
SMTP_PASS="..."
```

**Frontend (`frontend/.env`)**

```env
VITE_API_URL="http://localhost:3000"
VITE_STRIPE_PUBLISHABLE_KEY="pk_..."
```

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/social-workers-platform.git
cd social-workers-platform

# Backend setup
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

## API Documentation

Swagger documentation available at `http://localhost:3000/api-docs` when backend is running.

## Database Schema

Core entities:

- **Users** - Authentication with role-based access (worker, institution, admin)
- **Workers** - Profiles with verification status, documents, experiences
- **Institutions** - Organization profiles
- **Missions** - Job postings with requirements and urgency
- **Applications** - Worker applications with status tracking
- **Assignments** - Confirmed worker-mission matches
- **Payments** - Stripe-integrated payment tracking
- **Reviews** - Bidirectional rating system
- **Notifications** - Real-time user notifications
- **Conversations** - Chat conversations between users
- **Messages** - Real-time messaging with delivery status
- **AdminLogs** - Audit trail for admin actions

## Security

- JWT-based authentication with secure token storage
- Password hashing with bcryptjs
- Role-based access control (RBAC) with route guards
- Multi-layer auth middleware (ProtectedRoute → RoleGuard → WorkerVerifiedGuard)
- Input validation with Zod on frontend and backend
- Stripe handles sensitive payment data (PCI compliant)
- Automatic token refresh and session management

## License

MIT License - see [LICENSE](LICENSE) for details.

---

_Developed as part of a professional certification project (PFE)._
