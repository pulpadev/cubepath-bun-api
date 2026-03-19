export function jsonResponse(body: unknown, status = 200): Response {
	return Response.json(body, { status });
}

export function errorResponse(status: number, error: string): Response {
	return jsonResponse({ error }, status);
}

export async function readJsonBody<T>(request: Request): Promise<T> {
	return (await request.json()) as T;
}

const encoder = new TextEncoder();

export function createSseResponse(stream: ReadableStream<Uint8Array>): Response {
	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream; charset=utf-8",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
		},
	});
}

export function encodeSseEvent(event: string, data: unknown): Uint8Array {
	return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}