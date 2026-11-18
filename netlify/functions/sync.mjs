import { getStore } from "@netlify/blobs";

export default async (req) => {
  const k = new URL(req.url).searchParams.get("k") || "";
  if (!/^[a-f0-9]{64}$/.test(k)) return new Response("bad key", { status: 400 });
  const store = getStore("focusforge");
  if (req.method === "GET") {
    const d = await store.get(k, { type: "json" });
    return Response.json(d || { days: {} });
  }
  if (req.method === "PUT") {
    const t = await req.text();
    if (t.length > 400000) return new Response("too big", { status: 413 });
    let j;
    try { j = JSON.parse(t); } catch { return new Response("bad json", { status: 400 }); }
    if (!j || typeof j.days !== "object") return new Response("bad body", { status: 400 });
    await store.setJSON(k, { days: j.days });
    return Response.json({ ok: true });
  }
  return new Response("method not allowed", { status: 405 });
};

export const config = { path: "/api/sync" };
