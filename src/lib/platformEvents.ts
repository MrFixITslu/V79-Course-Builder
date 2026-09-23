import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type AcademyEvent = {
  id: string;
  type: string;
  version: 1;
  occurredAt: string;
  organizationRef: string;
  subjectId?: string;
  correlationId?: string;
  payload?: Record<string, unknown>;
};

type OutboxItem = {
  event: AcademyEvent;
  status: "pending" | "sent" | "failed";
  attempts: number;
  nextAttemptAt: string;
  lastError?: string | null;
  sentAt?: string | null;
  createdAt: string;
};

const outboxFile = path.join(process.cwd(), "data", "platform-event-outbox.json");
let flushing = false;

function config() {
  return {
    url: String(process.env.V79_HUB_EVENT_URL || "").trim(),
    secret: String(process.env.V79_HUB_EVENT_SECRET || "").trim(),
  };
}

export function academyHubEventsConfigured() {
  const { url, secret } = config();
  return Boolean(url && secret.length >= 32);
}

function readOutbox(): OutboxItem[] {
  if (!fs.existsSync(outboxFile)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(outboxFile, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOutbox(items: OutboxItem[]) {
  fs.mkdirSync(path.dirname(outboxFile), { recursive: true });
  const tmp = outboxFile + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(items, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, outboxFile);
}

function sign(body: string, timestamp: string) {
  const bodyHash = crypto.createHash("sha256").update(body).digest("hex");
  const canonical = ["POST", "/api/platform/events", timestamp, bodyHash].join("\n");
  return crypto.createHmac("sha256", config().secret).update(canonical).digest("hex");
}

async function deliver(event: AcademyEvent): Promise<"sent" | "pending" | "failed" | "disabled"> {
  if (!academyHubEventsConfigured()) return "disabled";
  const body = JSON.stringify(event);
  const timestamp = String(Date.now());
  try {
    const response = await fetch(config().url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-v79-service-id": "academy",
        "x-v79-timestamp": timestamp,
        "x-v79-signature": sign(body, timestamp),
      },
      body,
      signal: AbortSignal.timeout(7000),
    });
    if (response.ok) return "sent";
    if (response.status === 409 || response.status === 429 || response.status >= 500) return "pending";
    return "failed";
  } catch {
    return "pending";
  }
}

export function queueAcademyEvent(event: Omit<AcademyEvent, "id" | "version"> & { id?: string }) {
  const fullEvent: AcademyEvent = {
    ...event,
    id: event.id || crypto.randomUUID(),
    version: 1,
  };
  const items = readOutbox();
  if (!items.some(item => item.event.id === fullEvent.id)) {
    items.push({
      event: fullEvent,
      status: "pending",
      attempts: 0,
      nextAttemptAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    writeOutbox(items);
  }
  setImmediate(() => flushAcademyEvents().catch(err => console.warn("[V79 Hub Events] Academy flush failed:", err?.message || err)));
  return fullEvent.id;
}

export async function flushAcademyEvents() {
  if (flushing || !academyHubEventsConfigured()) return;
  flushing = true;
  try {
    const items = readOutbox();
    let changed = false;
    const now = Date.now();
    for (const item of items.filter(item => item.status === "pending" && Date.parse(item.nextAttemptAt) <= now).slice(0, 25)) {
      const state = await deliver(item.event);
      changed = true;
      if (state === "sent") {
        item.status = "sent";
        item.sentAt = new Date().toISOString();
        item.lastError = null;
      } else if (state === "failed") {
        item.status = "failed";
        item.lastError = "Permanent rejection from V79 Hub";
        item.attempts += 1;
      } else if (state === "pending") {
        item.attempts += 1;
        const delay = Math.min(30 * 60 * 1000, 30 * 1000 * (2 ** Math.min(item.attempts - 1, 6)));
        item.nextAttemptAt = new Date(Date.now() + delay).toISOString();
        item.lastError = "Delivery deferred";
      }
    }
    if (changed) {
      const retained = items.filter(item => item.status !== "sent" || !item.sentAt || Date.now() - Date.parse(item.sentAt) < 7 * 86400000);
      writeOutbox(retained.slice(-1000));
    }
  } finally {
    flushing = false;
  }
}

export function startAcademyEventPump() {
  setInterval(() => {
    flushAcademyEvents().catch(err => console.warn("[V79 Hub Events] Academy periodic flush failed:", err?.message || err));
  }, 60 * 1000).unref();
  setTimeout(() => {
    flushAcademyEvents().catch(err => console.warn("[V79 Hub Events] Academy startup flush failed:", err?.message || err));
  }, 5000).unref();
}
