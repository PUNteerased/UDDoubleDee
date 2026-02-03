const QUESTIONS_KEY = "questions";

export function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function isTooLong(value, max) {
  return typeof value === "string" && value.length > max;
}

export async function readAllQuestions(env) {
  const raw = await env.QUESTIONS_KV.get(QUESTIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeAllQuestions(env, questions) {
  await env.QUESTIONS_KV.put(QUESTIONS_KEY, JSON.stringify(questions, null, 2));
}

export function requireAdmin(request, env) {
  if (!env.ADMIN_TOKEN) {
    return json({ success: false, error: "ADMIN_TOKEN is not configured" }, { status: 500 });
  }
  const token = request.headers.get("X-Admin-Token");
  if (!token || token !== env.ADMIN_TOKEN) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

