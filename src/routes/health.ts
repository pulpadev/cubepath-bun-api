import { jsonResponse } from "../utils/http";

export function handleHealth(): Response {
	return jsonResponse({ status: "ok" });
}