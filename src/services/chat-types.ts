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

export type ChatProviderId = "openrouter" | "groq" | "cerebras";

export type ChatProviderStreamResult = {
	provider: ChatProviderId;
	model: string;
	stream: AsyncIterable<ChatCompletionStreamChunk>;
};

export type ChatProviderTextResult = {
	provider: ChatProviderId;
	model: string;
	text: string;
};