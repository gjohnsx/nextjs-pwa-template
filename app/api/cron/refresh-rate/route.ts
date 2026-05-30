export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rateURL = new URL("/api/rates/jpy-usd", request.url);
  const response = await fetch(rateURL, { cache: "no-store" });

  if (!response.ok) {
    return Response.json(
      { ok: false, status: response.status },
      { status: 502 },
    );
  }

  const rate = await response.json();
  return Response.json({ ok: true, rate });
}
