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
- **Database**: PostgreSQL (with durable relational schema)
- **Deployment**: Docker & Docker Compose

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

