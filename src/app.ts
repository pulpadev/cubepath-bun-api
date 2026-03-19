import { handleChat } from "./routes/chat";
import { handleHealth } from "./routes/health";
import { jsonResponse } from "./utils/http";

export const app = {
	async fetch(request: Request): Promise<Response> {
		const { pathname } = new URL(request.url);

		if (request.method === "GET" && pathname === "/health") {
			return handleHealth();
		}

		if (request.method === "POST" && pathname === "/chat") {
			return handleChat(request);
		}

		return jsonResponse(
			{
				error: "Not Found",
			},
			404,
		);
	},
};