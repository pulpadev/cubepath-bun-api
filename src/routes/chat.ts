import { config } from "../config";
import { sendChatCompletionStream, type ChatInputMessage } from "../services/openrouter";
import { createSseResponse, encodeSseEvent, errorResponse, readJsonBody } from "../utils/http";

type ChatBody = {
	message?: string;
	messages?: ChatInputMessage[];
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

		const completionStream = await sendChatCompletionStream({
			messages,
			signal: request.signal,
		});

		const stream = new ReadableStream<Uint8Array>({
			async start(controller) {
				try {
					controller.enqueue(
						encodeSseEvent("start", {
							model: config.openRouterModel,
						}),
					);

					for await (const chunk of completionStream) {
						const choice = chunk.choices[0];
						const content = choice?.delta?.content;

						if (chunk.error) {
							controller.enqueue(
								encodeSseEvent("error", {
									message: chunk.error.message,
									code: chunk.error.code,
								}),
							);
							break;
						}

						if (typeof content === "string" && content.length > 0) {
							controller.enqueue(
								encodeSseEvent("token", {
									content,
								}),
							);
						}

						if (choice?.finishReason) {
							controller.enqueue(
								encodeSseEvent("end", {
									reason: choice.finishReason,
								}),
							);
						}
					}
				} catch (error) {
					controller.enqueue(
						encodeSseEvent("error", {
							message: error instanceof Error ? error.message : "Unexpected streaming error.",
						}),
					);
				} finally {
					controller.close();
				}
			},
		});

		return createSseResponse(stream);
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