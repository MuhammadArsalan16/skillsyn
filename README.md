# 🚀 SkillSync

**SkillSync** is a full-stack collaboration and productivity platform for students and developers.
Built with React + Node.js + PostgreSQL, fully containerized using Docker, and designed for Azure DevOps CI/CD pipelines.

---

## 📦 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Tailwind CSS v3, Vite, React Router v6 |
| Backend   | Node.js, Express.js, JWT Auth       |
| Database  | PostgreSQL 15                       |
| DevOps    | Docker, Docker Compose, GitHub Actions, Azure DevOps |

---

## 🐳 Docker Architecture

Three separate containers communicate over the `skillsync_net` internal Docker bridge network:

```
Browser → frontend (nginx:80) → backend (node:5000) → db (postgres:5432)
```

- **frontend** — React app compiled to static files, served by Nginx
- **backend** — Express REST API with JWT auth connected to Postgres
- **db** — PostgreSQL with auto-initialized schema (`database/schema.sql`)

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/skillsync.git
cd skillsync
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
# Edit .env with your preferred values (defaults work for local dev)
```

### 3. Start All Containers
```bash
docker compose up --build
```

### Accessing the Application
| Service       | URL                          |
|---------------|------------------------------|
| Frontend      | http://localhost:3000        |
| Backend API   | http://localhost:5000        |
| Health Check  | http://localhost:5000/api/health |
| PostgreSQL    | localhost:5432               |

---

## 📁 Project Structure

```
skillsync/
├── frontend/              # React app (Vite + Tailwind CSS)
│   ├── Dockerfile         # Multi-stage: node builder → nginx
│   ├── nginx.conf         # React Router SPA support
│   └── src/
├── backend/               # Node.js Express API
│   ├── Dockerfile         # Multi-stage node alpine build
│   └── src/
│       ├── db/            # PostgreSQL connection
│       ├── middleware/    # JWT auth middleware
│       └── routes/        # auth, projects, tasks
├── database/
│   └── schema.sql         # Auto-ran on first Postgres start
├── .github/workflows/
│   └── github-actions.yml # CI/CD pipeline
├── azure-pipelines/
│   └── backend-pipeline.yml # Azure DevOps YAML
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔗 API Endpoints

| Method | Endpoint                      | Auth Required | Description          |
|--------|-------------------------------|---------------|----------------------|
| POST   | `/api/auth/register`          | No            | Register a user      |
| POST   | `/api/auth/login`             | No            | Login, returns JWT   |
| GET    | `/api/auth/me`                | Yes           | Get current user     |
| GET    | `/api/projects`               | Yes           | List user's projects |
| POST   | `/api/projects`               | Yes           | Create a project     |
| GET    | `/api/tasks/project/:id`      | Yes           | List tasks           |
| POST   | `/api/tasks`                  | Yes           | Create a task        |
| PUT    | `/api/tasks/:id/status`       | Yes           | Update task status   |

---

## 🔧 Docker Compose Commands

```bash
# Build and start all containers in the background
docker compose up --build -d

# View logs
docker compose logs -f

# Stop all containers
docker compose down

# Stop and remove volumes (reset database)
docker compose down --volumes

# Rebuild a single service
docker compose build backend
docker compose up -d backend
```

---

## 🐙 Push to GitHub

```bash
git init
git add .
git commit -m "Initial SkillSync commit"
git remote add origin https://github.com/<your-username>/skillsync.git
git branch -M main
git push -u origin main
```

---

## ☁️ Azure Deployment Guide

### Option A: Azure Container Registry + App Service

1. **Create ACR**: `az acr create --name skillsyncacr --resource-group myRG --sku Basic`
2. **Build & Push images**:
   ```bash
   az acr build --registry skillsyncacr --image skillsync-backend ./backend
   az acr build --registry skillsyncacr --image skillsync-frontend ./frontend
   ```
3. **Create App Service** and set container to your ACR image.
4. **Add env vars** for `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` in App Service config.

### Option B: Azure DevOps CI/CD

The `azure-pipelines/backend-pipeline.yml` file provides a ready-made Azure DevOps pipeline that:
- Triggers on push to `main`
- Builds both Docker images
- Pushes to Azure Container Registry (ACR)

Configure these variables in your Azure DevOps pipeline:
- `dockerRegistryServiceConnection` — your ACR service connection name
- `containerRegistry` — e.g. `skillsyncacr.azurecr.io`

---

## 🧪 Test Credentials

| Email                    | Password      |
|--------------------------|---------------|
| `admin@skillsync.com`    | `password123` |
| `test@skillsync.com`     | `password123` |
