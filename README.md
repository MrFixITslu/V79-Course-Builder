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

### From Idea to Advantage programme

The repository includes a published, editable Caribbean small-business programme at:

```text
/course/from-idea-to-advantage
```

It contains 12 modules, 36 lessons, 12 module quizzes, 12 practical assignments and a 24-question scenario examination. Its reusable programme layer adds:

- A 40-question **Business Advantage Diagnostic** with separate pre-launch and operating-business wording.
- Eight weighted capability areas with fair service-business wording for purchasing and resource management.
- A starting score, priority modules, final score and category-by-category improvement comparison.
- A 12-section **Business Advantage Workbook** that exports an editable operating plan.
- Evidence-based assessment confidence that increases as workbook sections are completed.
- Certificate eligibility only after 100% lesson completion, all required assignments and a final-exam score of at least 70%.
- Browser-persisted progress that follows the existing Student Portal architecture.

The course is seeded idempotently on first application start. Existing copies are never overwritten, preserving administrator edits and deliberate deletion.

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

### Academy portal and memberships

The public learning catalogue is at `/academy`; the authoring studio remains at `/`.
Application filters and course counts are calculated from the current catalogue. Creating,
importing, deleting and changing course status refreshes the admin list. The learner catalogue
refreshes on return to the tab and every 30 seconds. Only Published/Uploaded courses appear.
Deleting a linked website course removes its remote entry first; if the website cannot be
reached, deletion returns an error and preserves the local record for retry. Unpublishing a
linked course follows the same rule. Set `ACADEMY_PUBLIC_URL` to the academy's HTTPS address
so website publications link back to the correct portal. Existing remote entries should be
republished once to update their links. Curriculum edits still require the explicit Publish action.

Choose **Free** or **Subscription access** in a course's Overview settings. Legacy Premium and
Free Trial courses require a membership rather than silently granting access. Stripe checkout
is deliberately disabled; the app does not collect card details or simulate successful payments.
The **Learners & memberships** admin page supports dated membership grants, extensions,
revocation and password resets. Integrating Stripe Checkout, verified subscription webhooks
and the billing portal is a later setup task; adding a Stripe secret alone does not enable billing.

Learners register with email and a password of at least 12 characters. Their enrolments,
lesson progress, assignment responses, programme work and exam results are persisted in
`data/learners.json`. Include the entire `data` directory in backups. Guest learning remains
available for free courses; guest progress stays in the browser. Old simulated enrolment flags
are never accepted as proof of access. Sessions expire after 12 hours and on application restart.

Quiz and programme exam answers are not returned before submission. Grading is performed
on the server. Certificates check saved lesson completion, required assignment responses and
programme exam results, and are issued to the learner account's name. Assignment submission
records completion, not instructor grading or accreditation.

The old public default recovery key is automatically replaced. Retrieve your private recovery
key from `data/.admin_reset_token.txt` on the server. New installations use `ADMIN_PASSWORD`
or generate a temporary password in `data/.initial_admin_password.txt`. Neither credential is
printed in application logs. Existing administrator passwords are retained.

Validation: `npm run lint`, `npm test`, `npm run build`, then `npm run test:api`. The API tests
use an isolated temporary data directory and never modify production course or learner records.
