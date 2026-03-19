import { sendChatCompletion, type ChatInputMessage } from "../services/openrouter";
import { errorResponse, jsonResponse, readJsonBody } from "../utils/http";

type ChatBody = {
	message?: string;
	messages?: ChatInputMessage[];
	model?: string;
};

function normalizeMessages(body: ChatBody): ChatInputMessage[] {
	if (Array.isArray(body.messages) && body.messages.length > 0) {
		return body.messages;
	}

	if (typeof body.message === "string" && body.message.trim().length > 0) {
		return [
			{
				role: "user",
				content: body.message.trim(),
			},
		];
	}

	return [];
}

export async function handleChat(request: Request): Promise<Response> {
	try {
		const body = await readJsonBody<ChatBody>(request);
		const messages = normalizeMessages(body);

		if (messages.length === 0) {
			return errorResponse(
				400,
				"Invalid request body. Provide either a non-empty 'message' string or a non-empty 'messages' array.",
			);
		}

		const reply = await sendChatCompletion({
			messages,
			model: body.model,
		});

		return jsonResponse({
			reply,
			model: body.model,
		});
	} catch (error) {
		if (error instanceof SyntaxError) {
			return errorResponse(400, "Invalid JSON body.");
		}

		if (error instanceof Error) {
			const status = error.message.includes("OPENROUTER_API_KEY") ? 500 : 502;
			return errorResponse(status, error.message);
		}

		return errorResponse(500, "Unexpected server error.");
	}
}