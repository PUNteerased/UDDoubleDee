export async function onRequestGet() {
  return new Response(JSON.stringify({ success: true, message: "API is running (Cloudflare Pages Functions)" }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

