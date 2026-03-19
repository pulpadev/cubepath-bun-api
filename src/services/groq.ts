import Groq from "groq-sdk";
import { config } from "../config";
import { type ChatCompletionStreamChunk, type ChatInputMessage } from "./chat-types";

let client: Groq | null = null;

export function isGroqConfigured(): boolean {
	return Boolean(config.groqApiKey);
}

export function getGroqModel(): string {
	return config.groqModel;
}

function getClient(): Groq {
	if (!config.groqApiKey) {
		throw new Error("Missing GROQ_API_KEY environment variable.");
	}

	if (!client) {
		client = new Groq({
			apiKey: config.groqApiKey,
		});
	}

	return client;
}

function normalizeChunk(chunk: {
	choices?: Array<{
		delta?: { content?: string | null };
		finish_reason?: unknown;
	}>;
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
	};
}

export async function sendGroqChatCompletion(input: {
	messages: ChatInputMessage[];
}): Promise<string> {
	const groq = getClient();
	const completion = await groq.chat.completions.create({
		messages: input.messages,
		model: config.groqModel,
	});

	const content = completion.choices[0]?.message?.content;

	if (typeof content !== "string" || content.length === 0) {
		throw new Error("Groq returned an empty response.");
	}

	return content;
}

export async function sendGroqChatCompletionStream(input: {
	messages: ChatInputMessage[];
	signal?: AbortSignal;
}): Promise<AsyncIterable<ChatCompletionStreamChunk>> {
	const groq = getClient();
	const stream = await groq.chat.completions.create(
		{
			messages: input.messages,
			model: config.groqModel,
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
