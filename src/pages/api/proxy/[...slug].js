export default async function handler(req, res) {
  const API_BASE = process.env.NEXT_PUBLIC_CBR_VIEWER_LINK;
  if (!API_BASE) {
    res.status(500).json({ error: "CBR viewer endpoint non défini." });
    return;
  }

  const targetUrl = `${API_BASE}${req.url.replace(/^\/api\/proxy/, "")}`;

  try {
    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    let bodyContent = undefined;
    if (hasBody && req.body && Object.keys(req.body).length > 0) {
      bodyContent = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const headers = { ...req.headers };
    delete headers.host;
    headers["ngrok-skip-browser-warning"] = "true";
    if (bodyContent) headers["content-length"] = Buffer.byteLength(bodyContent).toString();

    const proxyRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: bodyContent,
      redirect: 'manual',
    });

    const contentType = proxyRes.headers.get("content-type");
    const contentLength = proxyRes.headers.get("content-length");
    if (contentType) res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);
    res.status(proxyRes.status);

    const buffer = Buffer.from(await proxyRes.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    console.error("❌ Erreur proxy:", err);
    res.status(500).json({ error: "Erreur proxy vers le viewer" });
  }
}
