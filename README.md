# FINOVA – Digital Banking & Personal Finance Platform

> **Smart Banking. Smarter Financial Future.**

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Operational-brightgreen.svg)]()

FINOVA is a high-end, production-grade **Digital Banking & Personal Finance Management Platform** built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). 

Designed to mirror modern fintech SaaS products, FINOVA combines glassmorphism aesthetics, dynamic financial analytics, 3D card/dashboard experiences, and real-time Socket.IO notifications into a cohesive educational banking application.

> **Disclaimer:** FINOVA is a demonstration and educational financial platform system. It is **not** a real banking institution and does not handle real currency or government identity credentials.

---

## 🚀 Key Features

### 🔐 1. Authentication & Security
- **JWT Authentication** with HTTP Bearer token headers & local storage persistence.
- **bcrypt Password Hashing** & security middleware (Helmet, CORS, Express Rate Limiting).
- **Role-Based Access Control (RBAC)** separating `user` and `admin` portals.
- **Two-Factor Authentication (2FA)** simulation & active device session tracking.
- **Fixed Admin Account:** Auto-initialized on backend launch.

### 💳 2. Multi-Account & Virtual 3D Card Suite
- **Account Types:** Digital Checking, High-Yield Savings (5.0% APY), Business Account, and Investment Portfolio Account.
- **Interactive 3D Virtual Cards:** Built with Three.js / React Three Fiber and Framer Motion card tilt/flip animations.
- **Card Controls:** Instant Freeze/Unfreeze, Block Card, Change PIN modal, Monthly spending limits, and E-Commerce/International payment toggles.

### 💸 3. Money Transfer & Transaction Consistency
- **Transfer Types:** Internal Transfer, Bank Transfer, International Wire, and Scheduled Transfers.
- **Pre-Confirmation Summary:** Displays fees, recipient info, and total deduction before execution.
- **Atomic Balance Updates:** Guarantees receiver balance credit and sender deduction without partial updates.
- **Unique Reference Generation:** Formatted references (e.g. `FN-2026-839201`).
- **Transaction Receipt Modal:** Print & download digital receipts with full audit fields.

### 📊 4. Personal Finance, Budgeting & Expenses
- **Expense Tracker:** Categorized recording (Food, Shopping, Transport, Bills, Subscriptions, etc.).
- **Budget Manager:** Monthly budget caps with automatic **80% limit warning badges** and notifications.
- **Savings Goals:** Target milestones with circular progress tracking and direct deposit transfer into goals.
- **Investment Portfolio:** Simulated stock, ETF, crypto, gold holdings with real-time profit/loss calculation.
- **Loan EMI Calculator:** Interactive amount/interest/duration sliders computing monthly EMI and total interest.
- **Simulated Credit Score:** Gauge visualization (e.g. 785/900 - Excellent) with factor breakdown.

### 👑 5. Separate Admin Control Center
- **KPI Overview:** Total Users, System Liquidity, Deposits, Withdrawals, Revenue, Active Cards, Loan Applications.
- **User Governance:** Search, filter, edit, activate, or suspend user accounts; create new users with custom initial demo balances.
- **Loan Disbursement:** Review pending loan applications and approve disbursements directly into user accounts.
- **Real-Time Live Chat:** Socket.IO support desk connecting admin directly with users.
- **System Audit Trail:** Immutable log of administrative actions, actor IP addresses, and timestamps.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS v3 (Vanilla CSS glassmorphism & gradients)
- **3D Graphics:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Animations:** Framer Motion & Canvas Confetti
- **Icons:** Lucide React
- **Charts:** Recharts
- **Notifications:** React Hot Toast
- **Real-Time:** Socket.IO Client

### Backend
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Security:** Helmet, CORS, Express Rate Limit, Express Validator
- **Logging:** Morgan & Winston
- **Real-Time:** Socket.IO Server

---

## 📂 Project Structure

```text
FINOVA/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/       # Card3D, Hero3DCanvas, ReceiptModal, StatCard, Sidebar, Navbar, etc.
│   │   ├── pages/            # Dashboard, Accounts, Transfer, Cards, Bills, Budgets, Loans, etc.
│   │   ├── pages/admin/      # AdminDashboard, AdminUsers, AdminAccounts, AdminLoans, etc.
│   │   ├── layouts/          # PublicLayout, UserLayout, AdminLayout
│   │   ├── context/          # AuthContext, ThemeContext, SocketContext
│   │   ├── services/         # Axios API Client with JWT interceptors
│   │   ├── utils/            # Currency and Date Formatters
│   │   ├── index.css         # Tailwind directives & Glassmorphism classes
│   │   ├── App.jsx           # Protected & Admin routes
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── config/               # Database & Winston Logger setup
│   ├── controllers/          # Auth, Accounts, Transfers, Cards, Admin, Loans, etc.
│   ├── middleware/           # JWT Protect, Admin RBAC, Error Handling, Validators
│   ├── models/               # Mongoose Schemas (User, Account, Transaction, Card, Loan, etc.)
│   ├── routes/               # REST API Routes
│   ├── services/             # Socket.IO Real-time service
│   ├── utils/                # JWT token generator & Database Seed script
│   ├── validators/           # Express-validator rules
│   ├── server.js             # Server entry point
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 🔑 Demo Access Credentials

The database comes pre-seeded with realistic financial demonstration accounts:

### 👑 Fixed Admin Account
- **Email:** `admin@gmail.com`
- **Password:** `admin`
- **Role:** Administrator (Access to `/admin` panel)

### 👤 Demo User Account
- **Email:** `demo@finova.com`
- **Password:** `password123`
- **Role:** User (Access to `/dashboard`, Accounts, Cards, Transfers)

---

## ⚡ Quick Start & Installation Guide

### Prerequisites
- Node.js `v18+`
- MongoDB local service running on `mongodb://localhost:27017/finova`

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed     # Populate database with realistic demo accounts & transactions
npm run dev      # Starts Express server on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

Open your browser and navigate to `http://localhost:5173`.

---

## 🛡️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finova
JWT_SECRET=finova_super_secret_jwt_key_2026_fintech_secure
JWT_EXPIRE=30d
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📄 License

This project is open-source under the [MIT License](LICENSE). Built for educational demonstration.
