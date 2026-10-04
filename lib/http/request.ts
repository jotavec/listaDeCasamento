import { NextResponse } from "next/server";

export function isSameOrigin(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const url = new URL(request.url);
  // Next's internal request URL can use localhost behind the hosting proxy.
  // Host is the actual browser-facing authority; forwarded host is not trusted.
  const host = request.headers.get("host") ?? url.host;
  const protocol = process.env.VERCEL || process.env.CODESPACE_NAME ? "https:" : url.protocol;
  return request.headers.get("origin") === `${protocol}//${host}`;
}

function invalidRequest(status: number) {
  return { response: NextResponse.json({ error: "Requisição inválida." }, { status }) };
}

// Limit the actual bytes read, including requests without Content-Length.
export async function readJsonObject(request: Request): Promise<
  { data: Record<string, unknown>; response?: never }
  | { response: NextResponse; data?: never }
> {
  if (!isSameOrigin(request)) return invalidRequest(403);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return invalidRequest(415);
  }
  const maxBytes = 64 * 1024;
  if (Number(request.headers.get("content-length")) > maxBytes) return invalidRequest(413);
  if (!request.body) return invalidRequest(400);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return invalidRequest(413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const data: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!data || typeof data !== "object" || Array.isArray(data)) return invalidRequest(400);
    return { data: data as Record<string, unknown> };
  } catch {
    return invalidRequest(400);
  } finally {
    reader.releaseLock();
  }
}
