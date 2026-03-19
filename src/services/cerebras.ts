import Cerebras from "@cerebras/cerebras_cloud_sdk";
import { config } from "../config";
import { type ChatCompletionStreamChunk, type ChatInputMessage } from "./chat-types";

let client: Cerebras | null = null;

export function isCerebrasConfigured(): boolean {
	return Boolean(config.cerebrasApiKey);
}

export function getCerebrasModel(): string {
	return config.cerebrasModel;
}

function getClient(): Cerebras {
	if (!config.cerebrasApiKey) {
		throw new Error("Missing CEREBRAS_API_KEY environment variable.");
	}

	if (!client) {
		client = new Cerebras({
			apiKey: config.cerebrasApiKey,
			warmTCPConnection: false,
		});
	}

	return client;
}

function normalizeChunk(chunk: {
	choices?: Array<{
		delta?: { content?: string | null };
		finish_reason?: unknown;
	}>;
	error?: { message?: string; code?: number };
}): ChatCompletionStreamChunk {
	const choice = chunk.choices?.[0];

	return {
		choices: [
			{
				delta: {
					content: choice?.delta?.content,
				},
				finishReason: choice?.finish_reason,
			},
		],
		error: chunk.error?.message
			? {
					message: chunk.error.message,
					code: chunk.error.code ?? 500,
				}
			: undefined,
	};
}

export async function sendCerebrasChatCompletion(input: {
	messages: ChatInputMessage[];
}): Promise<string> {
	const cerebras = getClient();
	const completion = await cerebras.chat.completions.create({
		messages: input.messages,
		model: config.cerebrasModel,
	});

	if (!("choices" in completion)) {
		throw new Error("Cerebras returned an unexpected response.");
	}

	const firstChoice = completion.choices[0];
	const content = "message" in firstChoice ? firstChoice.message?.content : undefined;

	if (typeof content !== "string" || content.length === 0) {
		throw new Error("Cerebras returned an empty response.");
	}

	return content;
}

export async function sendCerebrasChatCompletionStream(input: {
	messages: ChatInputMessage[];
	signal?: AbortSignal;
}): Promise<AsyncIterable<ChatCompletionStreamChunk>> {
	const cerebras = getClient();
	const stream = await cerebras.chat.completions.create(
		{
			messages: input.messages,
			model: config.cerebrasModel,
			stream: true,
		},
		{
			signal: input.signal,
		},
	);

	return {
		async *[Symbol.asyncIterator]() {
			for await (const chunk of stream) {
				yield normalizeChunk(chunk);
			}
		},
	};
}
