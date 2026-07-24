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

To deploy the Course Builder with PostgreSQL and Nginx Proxy Manager (OpenResty):

1. **Ensure `proxy_network` exists**:
   ```bash
   docker network create proxy_network || true
   ```

2. **Start the containers**:
   ```bash
   docker compose up --build -d
   ```

3. **Configure Nginx Proxy Manager UI**:
   - In your **Nginx Proxy Manager UI**:
     - **Domain Names**: `your-domain.com` (or IP)
     - **Scheme**: `http`
     - **Forward Hostname / IP**: `v79_course_builder` (or `v79_nginx_proxy`)
     - **Forward Port**: `3080` (if forwarding directly to `v79_course_builder`) OR `80` (if forwarding to `v79_nginx_proxy`)
     - **Websockets Support**: **Enabled** (ON)
     - **Block Common Exploits**: **Enabled** (ON)

> 💡 **Port Conflict Resolution (Port 3000 Avoidance)**:
> - The application container internally uses **port 3080** instead of 3000 to prevent conflicts with other services on your server running on port 3000.
> - Direct host access is available at `http://<your-server-ip>:3030`.
> - If forwarding in Nginx Proxy Manager directly to container `v79_course_builder`, set **Forward Port** to `3080`.

