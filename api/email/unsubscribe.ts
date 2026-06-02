type VercelRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (statusCode: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method && req.method !== "GET") {
    res.status(405);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send("Method not allowed");
    return;
  }

  const token = first(req.query?.token);

  console.info(
    JSON.stringify({
      feature: "email-delivery",
      eventName: "unsubscribe_confirmation_rendered",
      hasToken: token.length > 0
    })
  );

  res.status(200);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>You have been unsubscribed | Daily Paper</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        color: #f8fafc;
        font: 16px/1.6 Segoe UI, sans-serif;
        background:
          radial-gradient(circle at 9% 2%, rgba(34, 211, 238, 0.24), transparent 30%),
          radial-gradient(circle at 84% 0%, rgba(244, 114, 182, 0.18), transparent 32%),
          #070912;
      }
      main {
        width: min(720px, calc(100% - 32px));
        border: 1px solid rgba(34, 211, 238, 0.24);
        border-radius: 16px;
        padding: 28px;
        background: rgba(17, 24, 39, 0.84);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34), 0 0 36px rgba(34, 211, 238, 0.12);
      }
      a {
        color: #22d3ee;
        font-weight: 800;
      }
    </style>
  </head>
  <body>
    <main data-testid="unsubscribe-confirmation">
      <h1>You have been unsubscribed</h1>
      <p>Delivery is paused immediately. Your saved Daily Paper preferences remain available.</p>
      <a href="/dashboard/newsletter">Manage newsletter delivery</a>
    </main>
  </body>
</html>`);
}
