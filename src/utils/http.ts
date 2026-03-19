export function jsonResponse(body: unknown, status = 200): Response {
	return Response.json(body, { status });
}

export function errorResponse(status: number, error: string): Response {
	return jsonResponse({ error }, status);
}

export async function readJsonBody<T>(request: Request): Promise<T> {
	return (await request.json()) as T;
}