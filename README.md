# Social Workers Network (Réseau de Travailleurs Sociaux)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)

An innovative digital platform designed to create a selective network of independent social workers. Our mission is to connect social care establishments with highly qualified professionals (technicians, engineers, project managers, etc.) through a rigorous labeling system.

## 🌟 Project Overview

### Context
This project aims to guarantee superior service quality in the social work sector. By implementing a strict validation process based on diplomas and experience, we ensure that establishments find the right expertise while fostering meaningful connections with the public they serve.

### Educational Objectives
This platform demonstrates mastery of:
- **Frontend (React)**: Advanced form management, role-based dashboards, and complex state management.
- **Backend (Node.js/Express)**: RESTful architecture, JWT authentication, and RBAC (Role-Based Access Control).
- **Database (SQL)**: Relational modeling and advanced filtering queries.

---

## 🚀 Key Features

### 🧑‍💼 For Social Workers (Independent)
- **Rich Profile Creation**: Upload diplomas (PDF), list experiences, and define specialties.
- **Availability Management**: Interactive calendar to indicate working hours.
- **Mission Application**: Browse and apply for missions posted by establishments.

### 🏢 For Establishments (Clients)
- **Mission Posting**: Define needs based on public type, duration, and urgency.
- **Pro Search**: Filter professionals by skills, labels, and proximity.
- **Quality Control**: Validate services and provide feedback/ratings.

### 🛡️ For Administrators (The Network)
- **Labeling System**: Moderate and approve new members by verifying credentials.
- **Global Overview**: Monitor all ongoing connections and platform activity.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (with Vite)
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Data Fetching**: React Query
- **Styling**: Tailwind CSS & shadcn/ui
- **Routing**: React Router

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **ORM**: Prisma
- **Database**: NeonDB (PostgreSQL)
- **Authentication**: JWT & bcryptjs
- **File Storage**: Cloudinary (via Multer)

---

## 🔒 Security & Performance

- **GDPR Compliance**: Personal data and diplomas are encrypted and stored securely.
- **Robust Auth**: Password hashing using `bcryptjs` and secure route protection via `JWT`.
- **High Performance**: 
    - SPA (Single Page Application) for fluid UX.
    - API response times optimized to <500ms.
    - Client-side caching with React Query.
- **Scalability**: Modular architecture (MVC/Clean Architecture) for future-proofing.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- NeonDB Account (or local PostgreSQL)
- Cloudinary Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/social-workers-network.git
   cd social-workers-network
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Developed as part of a professional certification project.*
