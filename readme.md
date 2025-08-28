# 🚀 Full-Stack Todo App with Timers

This is a **MERN-style full-stack project** using a modern front-end stack (React + Vite + TailwindCSS) and a secure backend (Express + MongoDB + JWT authentication).

---

## 🌍 Live Demo

👉 [https://suntek-ai-assignment.vercel.app/](https://suntek-ai-assignment.vercel.app/)

---

---

## 🔒 Authentication

- Secure **JWT-based authentication** (Access + Refresh tokens)
- Passwords hashed with **bcrypt** before storing in MongoDB
- Tokens auto-expire based on `.env` settings:
  - Access Token: `1d`
  - Refresh Token: `30d`

---

## 🧪 Test Credentials

Email: mrinmoymondal@gmail.com
Password: RandomTextPassword@2025

## 🛠 Tech Stack

### **Backend (Node.js + TypeScript)**

- **Express 5** – API server
- **Mongoose 8** – MongoDB ORM
- **JWT** – Authentication
- **bcryptjs** – Password hashing
- **dotenv** – Env config
- **Google GenAI SDK (@google/genai)** – AI features
- **chrono-node** – Date/time natural language parsing

### **Frontend (React + Vite + TS)**

- **React 19 + React DOM** – UI library
- **Vite 7** – Dev server & bundler
- **TailwindCSS 4** + **@tailwindcss/vite** – Styling
- **Radix UI** – Accessible UI primitives
- **TanStack React Query 5** – Data fetching
- **React Router 7** – Routing
- **Recharts** – Charts & visualizations
- **Lucide React** – Icons

---

## ⚙️ Setup Instructions (Local Development)

### 1. Prerequisites

- **Node.js v20+**
- **pnpm** (recommended) or npm
- **MongoDB** (local or Atlas cluster)

---

### 2. Clone the Repository

```
git clone https://github.com/mrinmoymondalreal/suntek-ai-assignment
cd suntek-ai-assignment
```

---

### 3. Backend Setup

```
cd backend
pnpm install   # or npm install
```

#### Configure Environment Variables

Create a `.env` file in `backend/`:

```
MONGODB_URI="mongodb://localhost:27017/your-db"
JWT_ACCESS_SECRET="supersecret_access"
JWT_REFRESH_SECRET="supersecret_refresh"
ACCESS_TOKEN_EXPIRES="1d"
REFRESH_TOKEN_EXPIRES="30d"
GEMINI_API_KEY="your-gemini-api-key"
FRONTEND_URL="http://localhost:5173"
```

#### Start Backend

```
pnpm dev
```

Backend runs on **http://localhost:3000** (unless configured otherwise).

---

### 4. Frontend Setup

```
cd ../frontend
pnpm install   # or npm install
```

#### Configure Environment Variables

Create a `.env` file in `backend/`:

```
VITE_API_BASE=http://localhost:3000
```

#### Start Frontend

```
pnpm dev
```

Frontend runs on 👉 **http://localhost:5173**

---

### 5. Verify Setup

1. Ensure MongoDB is running.
2. Start backend (API server).
3. Start frontend (React app).
4. Open browser at: **http://localhost:5173**

---

### 6. Build Commands

- **Frontend build**
  ```
  cd frontend && pnpm build
  ```
- **Backend build (TS → JS)**
  ```
  cd backend && tsc
  ```

---

✅ You now have a working full-stack app environment!

---
