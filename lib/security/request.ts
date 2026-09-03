const DEFAULT_MAX_BODY_BYTES = 16_384;

export type JsonBodyResult<T> =
  | { ok: true; body: T }
  | { ok: false; response: Response };

export async function readJsonBody<T>(
  request: Request,
  maxBodyBytes = DEFAULT_MAX_BODY_BYTES,
): Promise<JsonBodyResult<T>> {
  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    return {
      ok: false,
      response: Response.json({ message: "Invalid request format." }, { status: 415 }),
    };
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const parsedLength = Number(contentLength);
    if (Number.isFinite(parsedLength) && parsedLength > maxBodyBytes) {
      return {
        ok: false,
        response: Response.json(
          { message: "The submitted request is too large." },
          { status: 413 },
        ),
      };
    }
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > maxBodyBytes) {
    return {
      ok: false,
      response: Response.json(
        { message: "The submitted request is too large." },
        { status: 413 },
      ),
    };
  }

  try {
    return { ok: true, body: JSON.parse(rawBody) as T };
  } catch {
    return {
      ok: false,
      response: Response.json({ message: "Invalid request body." }, { status: 400 }),
    };
  }
}
