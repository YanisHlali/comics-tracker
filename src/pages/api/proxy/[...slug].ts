import { NextApiRequest, NextApiResponse } from 'next';
import { handleApiError, AppError, ERROR_TYPES } from '@/lib/errorHandler';

export default async function routeHandler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const API_BASE = process.env.NEXT_PUBLIC_CBR_VIEWER_LINK;
  if (!API_BASE) {
    return handleApiError(res, new AppError("CBR viewer endpoint non défini", ERROR_TYPES.VALIDATION_ERROR));
  }

  const targetUrl = `${API_BASE}${req.url!.replace(/^\/api\/proxy/, "")}`;
  const correctedUrl = targetUrl.replace('/proxy-image/', '/cbr/');
  
  try {
    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    let bodyContent: string | undefined = undefined;
    if (hasBody && req.body && Object.keys(req.body).length > 0) {
      bodyContent = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const fetchHeaders: Record<string, string> = {};
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        fetchHeaders[key] = Array.isArray(value) ? value[0] : value;
      }
    });

    delete fetchHeaders.host;
    fetchHeaders["ngrok-skip-browser-warning"] = "true";
    
    if (bodyContent) {
      fetchHeaders["content-length"] = Buffer.byteLength(bodyContent).toString();
    }

    const proxyRes = await fetch(correctedUrl, {
      method: req.method!,
      headers: fetchHeaders,
      body: bodyContent,
      redirect: 'manual',
    });

    if (!proxyRes.ok) {
      throw new AppError(`Proxy request failed with status ${proxyRes.status}`, ERROR_TYPES.NETWORK_ERROR);
    }

    const contentType = proxyRes.headers.get("content-type");
    const contentLength = proxyRes.headers.get("content-length");
    if (contentType) res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);
    res.status(proxyRes.status);

    const buffer = Buffer.from(await proxyRes.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    const errorObj = error instanceof Error ? error : undefined;
    const appError = new AppError("Erreur proxy vers le viewer", ERROR_TYPES.NETWORK_ERROR, errorObj);
    return handleApiError(res, appError);
  }
}