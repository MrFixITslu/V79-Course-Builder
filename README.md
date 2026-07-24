# V79 Academy Course Builder

The **V79 Academy Course Builder** is an enterprise-grade internal course authoring and management platform designed for administrators to create, review, structure, and export online training courses for V79 applications (including Fire Finance Pro, SIWM, Tiquet, and KashDash) before publishing them to the V79 Academy portal.

---

## Features

- **Multi-Application Support**: Author courses for Fire Finance Pro (FFPRO2), SIWM, Tiquet, KashDash, and general tracks.
- **Hierarchical Authoring**: Manage modules, lessons, learning objectives, estimated durations, and markdown content.
- **Interactive Quiz Builder**: Create multiple-choice and true/false quizzes with correct answers and detailed explanations.
- **Asset Manager**: Organize videos, audio files, PDFs, exercises, and downloads by Course, Module, and Lesson.
- **Student-Facing Preview Mode**: Test the complete student experience (landing page, module navigation, lesson viewer, quiz modal, downloads).
- **Automated Export System**: Package courses into structured JSON directories (`course.json`, `modules/`, `quizzes/`, `README.md`) ready for Academy publishing.
- **AI Course Assistant**: Powered by Gemini to auto-generate course outlines, lesson descriptions, and quiz questions.

---

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: a JSON file store (`data/store.json`). Note: `docker-compose.yml` also starts a PostgreSQL container and `schema.sql` describes a relational schema for one, but the server does not currently read `DATABASE_URL` or connect to Postgres at all - that container is currently unused. Until the server is migrated to actually use it, don't rely on the Postgres schema for durability; only `data/store.json` is real.
- **Deployment**: Docker & Docker Compose

---

## Publishing courses to the website

Previously, marking a course "Uploaded" was just a status label - it didn't send anything anywhere. Publishing is now a real action: the **Publish to Website** button (in a course's Settings tab) transforms the course's modules, lessons, and quizzes into the website's expected format and creates or updates the matching entry there via its admin API.

To enable it, set these two environment variables for this app:

- `WEBSITE_SYNC_URL` - the base URL of the website (e.g. `https://vision79.example.com`), no trailing slash.
- `WEBSITE_ADMIN_PASSWORD` - that website's current admin password.

If the website's admin account still has a pending one-time password (e.g. right after a password reset), log into its `/admin` panel once to set a permanent password before publishing - the publish action will tell you if this is blocking it.

Publishing again after edits updates the same website entry (tracked via `websiteAppId` on the course) rather than creating a duplicate. Pricing isn't set from the Course Builder yet - newly published courses default to free and can be priced from the website's own admin panel afterwards without affecting curriculum or exam content.

---

## Installation & Development

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Docker & Docker Compose (for production deployment)

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and provide your Gemini API key (optional, for AI features):
```bash
cp .env.example .env
```

3. Run the development server (Express + Vite):
```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser.

---

## Production Deployment (Docker Compose & Nginx Proxy Manager)

To deploy the Course Builder with PostgreSQL and Nginx Proxy Manager (OpenResty) for **cb.v79sl.duckdns.org**:

1. **Ensure `proxy_network` exists**:
   ```bash
   docker network create proxy_network || true
   ```

2. **Start the containers**:
   ```bash
   docker compose up --build -d
   ```

3. **Configure Nginx Proxy Manager UI (for `cb.v79sl.duckdns.org`)**:
   - In your **Nginx Proxy Manager UI**:
     - **Domain Names**: `cb.v79sl.duckdns.org`
     - **Scheme**: `http`
     - **Forward Hostname / IP**: `v79_course_builder` (or server IP)
     - **Forward Port**: `3030`
     - **Websockets Support**: **Enabled** (ON)
     - **Block Common Exploits**: **Enabled** (ON)

> 💡 **Port 3030 & Domain Setup (`cb.v79sl.duckdns.org`)**:
> - The application container is configured to run on **port 3030** (`PORT=3030`).
> - Direct host access is available at `http://cb.v79sl.duckdns.org:3030` or `http://localhost:3030`.
> - If forwarding in Nginx Proxy Manager to container `v79_course_builder`, set **Forward Port** to `3030`.

