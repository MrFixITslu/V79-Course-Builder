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

### V79 Junior Networking Academy

The repository also includes a separate networking programme for learners ages **12–17**:

```text
/course/course-junior-networking-academy-01
```

The networking course is intentionally separate from the Junior AI Academy and contains:

- **20 missions / 60 lessons**;
- Core Path activities for ages 12–14;
- Engineer Challenge extensions for ages 15–17;
- networking hardware, racks, UPS systems, structured cabling, copper, fiber and PoE;
- OSI and TCP/IP models;
- Ethernet, MAC addressing, IPv4, subnetting and CIDR;
- DHCP, DNS, ARP and ICMP;
- routing, VLANs, trunks and inter-VLAN routing;
- Wi-Fi planning across 2.4/5/6 GHz concepts;
- servers, storage, virtualization and cloud networking;
- firewalls, NAT, VPNs and defensive network security;
- monitoring, logging and network operations;
- structured troubleshooting;
- network design, documentation and a final build/simulation capstone;
- **20 browser-based interactive network labs**;
- 20 mission covers and 20 concept diagrams;
- hardware, OSI and troubleshooting teaching posters;
- printable hardware, rack, cabling, IP/VLAN, wireless/security, troubleshooting and final-design worksheets;
- 20 captioned narrated mission videos generated during the production Docker build.

Instructor/curriculum guidance:

```text
docs/junior-networking-academy-blueprint.md
```

### Course pricing controls

Administrators can set courses to **Free** or **Subscription** and set a USD course price.

- Pricing may be configured before launch.
- Pricing may be changed after launch.
- Free access always normalizes the stored price to `0`.
- Subscription access preserves the administrator's chosen price.
- When a course already has a live website listing, saving a pricing/access change synchronizes the existing website entry before the local change is committed.
- Pricing changes are added to the publishing audit log.

### V79 Junior AI Academy

The repository includes a team-based, subscription-ready AI programme for children ages 6–12 at:

```text
/course/course-junior-ai-academy-01
```

The Junior Academy contains 16 weekly missions across **AI Explorer**, **AI Creator**, and **AI Builder**. It deliberately excludes the later advanced app-development/deployment course.

Key programme features:

- Two age paths inside the same missions: **AI Explorers (6–8)** and **AI Creators (9–12)**.
- Transferable AI skills: prompting, verification, privacy, ethics, images, writing, audio, video, presentations, promotion, workflows, problem solving and supervised entrepreneurship.
- **AI Studio Teams of exactly three** with Leader, Builder and Checker responsibilities.
- Leadership rotation so every learner practices accountability and handover.
- A long-running team project that begins in Mission 1 and becomes the final Demo Day product.
- Age-appropriate project management: goals, milestones, owners, deadlines, **To Do → Doing → Done**, risks and backup plans.
- Younger learners use an **Uh-Oh Plan**; older learners use simple Low/Medium/High risk cards.
- The **CALM** conflict method: Cool down → Ask & listen → Look for fair choices → Make an agreement, with immediate adult escalation for unsafe or serious behavior.
- Weekly Studio Check-Ins with individual contribution reflections and instructor review states: **Submitted → Needs Changes → Approved**.
- Certificate eligibility requires all lessons, all 16 approved weekly team submissions and the individual learner’s reflection for each mission.
- A complete visual pack with 16 mission covers, 16 badges, character cards and Creator Code/MAGIC/STOP/CALM posters.
- Sixteen captioned narrated mission-intro videos generated reproducibly during the production Docker build.

Instructor curriculum documentation lives in:

```text
docs/junior-ai-academy-blueprint.md
docs/junior-ai-academy-mission-01.md
docs/junior-ai-academy-missions-02-16.md
docs/junior-ai-academy-team-project-model.md
docs/junior-ai-academy-instructor-guardian-guide.md
```

Printable learner worksheets are stored in:

```text
public/junior-ai/resources/
```

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
- **Database**: the persistent JSON file store (`data/store.json`). The old Compose PostgreSQL container was unused by the application and has been removed from the service definition. Its existing Docker volume is deliberately left intact; back up the JSON store and learner files before deployment. Do not use `docker compose down -v`.
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

> **Important:** The GitHub **Package & Publish Image** workflow validates and publishes the image to GHCR. It does **not** connect to the production server or restart the live containers. Your server/deployment platform must pull/rebuild the new image and start it separately.



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
> - The production Docker image defaults to **port 3030** and exposes **3030**.
> - Docker Compose also sets `PORT=3030`.
> - Direct host access is available at `http://cb.v79sl.duckdns.org:3030` or `http://localhost:3030`.
> - If forwarding in Nginx Proxy Manager to container `v79_course_builder`, set **Forward Port** to `3030`.
> - Container/orchestrator health checks may use `/healthz`; a healthy app returns `{"status":"ok"}`.

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

## Automatic server deployment

After a validated merge to `main`, the delivery workflow deploys the `course-builder` service through Tailscale and pinned SSH. Publication to GHCR alone never changes the server. In GitHub **Settings → Environments → production**, configure the secrets `TAILSCALE_AUTHKEY`, `DEPLOY_HOST` (the server's Tailscale address), `DEPLOY_USER`, `DEPLOY_SSH_KEY` (private deploy key), and `DEPLOY_KNOWN_HOSTS` (independently verified host key). Restrict who can change the production environment. Configure environment variables `DEPLOY_ROOT` (absolute existing server directory containing this app's Compose file and `.env`), `DEPLOY_PROJECT` (the current Compose project shown by `docker inspect`), and optional `DEPLOY_SSH_PORT` (default 22).

The deploy user needs Docker and `rsync` access and the server must already have `proxy_network`. Before enabling the workflow, back up the application's existing data, encryption keys, uploads, databases and `.env` and verify a restore. The script preserves `.env`, `data`, `uploads`, backups and existing `.git`; it updates the app in place, starts only `course-builder` and checks its HTTP readiness inside the container. It does not remove orphan containers or volumes. Source removed from Git may remain in the server directory because deployment intentionally does not delete unknown local files. A first merge will fail closed if a required secret, mount, project, or server directory is absent. Review Actions → deploy and record the `.deployed_sha` in the server directory after each successful release.
