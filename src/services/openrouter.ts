import { OpenRouter } from "@openrouter/sdk";
import { config } from "../config";
import { type ChatCompletionStreamChunk, type ChatInputMessage } from "./chat-types";

let client: OpenRouter | null = null;

export function isOpenRouterConfigured(): boolean {
	return Boolean(config.openRouterApiKey);
}

export function getOpenRouterModel(): string {
	return config.openRouterModel;
}

function getClient(): OpenRouter {
	if (!config.openRouterApiKey) {
		throw new Error("Missing OPENROUTER_API_KEY environment variable.");
	}

	if (!client) {
		client = new OpenRouter({
			apiKey: config.openRouterApiKey,
			httpReferer: config.openRouterReferer,
			xTitle: config.openRouterTitle,
		});
	}

	return client;
}

export async function sendOpenRouterChatCompletion(input: {
	messages: ChatInputMessage[];
}): Promise<string> {
	const openRouter = getClient();
	const completion = await openRouter.chat.send({
		chatGenerationParams: {
			model: config.openRouterModel,
			messages: input.messages,
			stream: false,
		},
	});

	const content = completion.choices[0]?.message?.content;

	if (typeof content !== "string" || content.length === 0) {
		throw new Error("OpenRouter returned an empty response.");
	}

	return content;
}

export async function sendOpenRouterChatCompletionStream(input: {
	messages: ChatInputMessage[];
	signal?: AbortSignal;
}): Promise<AsyncIterable<ChatCompletionStreamChunk>> {
	const openRouter = getClient();

	return openRouter.chat.send(
		{
			chatGenerationParams: {
				model: config.openRouterModel,
				messages: input.messages,
				stream: true,
			},
		},
		{
			signal: input.signal,
		},
	);
}