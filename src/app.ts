import { handleChat } from "./routes/chat";
import { handleHealth } from "./routes/health";
import { jsonResponse } from "./utils/http";

const indexHtml = Bun.file("./public/index.html");

export const app = {
	async fetch(request: Request): Promise<Response> {
		const { pathname } = new URL(request.url);

		if (request.method === "GET" && pathname === "/") {
			return new Response(indexHtml, {
				headers: {
					"Content-Type": "text/html; charset=utf-8",
				},
			});
		}

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