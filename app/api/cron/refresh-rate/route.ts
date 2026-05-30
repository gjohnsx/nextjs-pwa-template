export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const jpyUsdURL = new URL("/api/rates/jpy-usd", request.url);
  const ratesURL = new URL("/api/rates", request.url);

  const [jpyUsdResponse, ratesResponse] = await Promise.all([
    fetch(jpyUsdURL, { cache: "no-store" }),
    fetch(ratesURL, { cache: "no-store" }),
  ]);

  if (!jpyUsdResponse.ok || !ratesResponse.ok) {
    return Response.json(
      {
        ok: false,
        jpyUsdStatus: jpyUsdResponse.status,
        ratesStatus: ratesResponse.status,
      },
      { status: 502 },
    );
  }

  const [rate, rates] = await Promise.all([
    jpyUsdResponse.json(),
    ratesResponse.json(),
  ]);
  return Response.json({ ok: true, rate, rates });
}

