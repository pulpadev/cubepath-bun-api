import { OpenRouter } from "@openrouter/sdk";
import { config } from "../config";

export type ChatInputMessage = {
	role: "system" | "user" | "assistant";
	content: string;
};

export type ChatCompletionStreamChunk = {
	choices: Array<{
		delta: {
			content?: string | null;
		};
		finishReason?: unknown;
	}>;
	error?: {
		message: string;
		code: number;
	};
};

let client: OpenRouter | null = null;

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

export async function sendChatCompletion(input: {
	messages: ChatInputMessage[];
	model?: string;
}): Promise<string> {
	const openRouter = getClient();
	const completion = await openRouter.chat.send({
		chatGenerationParams: {
			model: input.model ?? config.openRouterModel,
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

export async function sendChatCompletionStream(input: {
	messages: ChatInputMessage[];
	model?: string;
	signal?: AbortSignal;
}): Promise<AsyncIterable<ChatCompletionStreamChunk>> {
	const openRouter = getClient();

	return openRouter.chat.send(
		{
			chatGenerationParams: {
				model: input.model ?? config.openRouterModel,
				messages: input.messages,
				stream: true,
			},
		},
		{
			signal: input.signal,
		},
	);
}