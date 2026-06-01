# NexusHub – AI-Powered Collaboration & Project Management Platform

A unified workspace combining Team Communication, Kanban Project Management, Sprint Agile Dashboarding, AI Assistants with RAG document searching, Video lobbies, and Admin capabilities into a single cohesive platform.

---

## Technical Architecture Highlights

- **Frontend**: React 19 SPA optimized by Vite, styled via custom CSS with glassmorphic cards and dynamic theme hue customize controllers.
- **Backend Service**: Node.js & Express.js server exposing REST APIs, protected by JWT authentication and public IP rate limiters, alongside Socket.io room systems.
- **Data & Caching Engines**: Mongoose MongoDB for persistent storage models, Redis key-value stores as session rate brokers, and Pinecone vector indexing to run Retrieval-Augmented Generation (RAG) wiki searches.
- **DevOps**: Multi-stage Docker configurations, orchestrated locally via `docker-compose.yml`, validated continuously on GitHub Actions pipelines.

---

## Directory Organization

```
nexushub-platform/
├── .github/workflows/         # GitHub Actions CI/CD workflows
├── backend/                   # Node.js, Express, Socket.io, AI pipelines
│   ├── src/app.ts             # Express + WebSockets server bootstrapper
│   ├── Dockerfile             # Multi-stage Backend docker configuration
│   └── package.json           # Backend dependency matrix
├── src/                       # React 19 Frontend Web Client
│   ├── components/            # Interface views (Sprints, Analytics, Meetings, etc.)
│   ├── context/               # Workspace context variables
│   ├── index.css              # Glassmorphic and theme styling tokens
│   └── main.tsx               # Client mounting entrypoint
├── Dockerfile                 # Client web browser bundle building container
├── docker-compose.yml         # Dev/Prod multi-container coordinator
└── nginx.conf                 # SPA router fallback configurations
```

---

## Quickstart & Launch Commands

To start the unified container stack locally, ensure Docker is running, then execute:

```bash
# Start all clustered services (Frontend, API Backend, MongoDB, Redis)
docker compose up --build -d

# Check cluster services status logs
docker compose ps

# Follow container service log outputs
docker compose logs -f nexushub-backend
```

### Local Development Handshake
If you wish to test or run local frontend services natively:

```bash
# Install node packages
npm install

# Start Vite hot-module-replacement server
npm run dev
```

---

## Continuous Integration & Verification

The repository includes strict compiler verification pipelines:
- **TypeScript Static Verification**: Code compiles flawlessly with `npx tsc --noEmit` returning zero compiler errors or typing warnings.
- **GitHub Pipeline Validation**: All pushes and pull requests trigger automated format, build, and docker packaging configurations defined inside `.github/workflows/ci.yml`.
