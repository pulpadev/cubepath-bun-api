import { config } from "../config";
import {
	type ChatInputMessage,
	type ChatProviderId,
	type ChatProviderStreamResult,
	type ChatProviderTextResult,
} from "./chat-types";
import {
	isCerebrasConfigured,
	getCerebrasModel,
	sendCerebrasChatCompletion,
	sendCerebrasChatCompletionStream,
} from "./cerebras";
import {
	isGroqConfigured,
	getGroqModel,
	sendGroqChatCompletion,
	sendGroqChatCompletionStream,
} from "./groq";
import {
	isOpenRouterConfigured,
	getOpenRouterModel,
	sendOpenRouterChatCompletion,
	sendOpenRouterChatCompletionStream,
} from "./openrouter";

type ProviderDescriptor = {
	id: ChatProviderId;
	isConfigured: () => boolean;
	getModel: () => string;
	sendText: (input: { messages: ChatInputMessage[] }) => Promise<string>;
	sendStream: (input: {
		messages: ChatInputMessage[];
		signal?: AbortSignal;
	}) => Promise<AsyncIterable<import("./chat-types").ChatCompletionStreamChunk>>;
};

const providerDescriptors: ProviderDescriptor[] = [
	{
		id: "openrouter",
		isConfigured: isOpenRouterConfigured,
		getModel: getOpenRouterModel,
		sendText: sendOpenRouterChatCompletion,
		sendStream: sendOpenRouterChatCompletionStream,
	},
	{
		id: "groq",
		isConfigured: isGroqConfigured,
		getModel: getGroqModel,
		sendText: sendGroqChatCompletion,
		sendStream: sendGroqChatCompletionStream,
	},
	{
		id: "cerebras",
		isConfigured: isCerebrasConfigured,
		getModel: getCerebrasModel,
		sendText: sendCerebrasChatCompletion,
		sendStream: sendCerebrasChatCompletionStream,
	},
];

let nextProviderIndex = 0;

function getConfiguredProviders(): ProviderDescriptor[] {
	const providers = providerDescriptors.filter((provider) => provider.isConfigured());

	if (providers.length === 0) {
		throw new Error(
			"No chat provider is configured. Set at least one of OPENROUTER_API_KEY, GROQ_API_KEY, or CEREBRAS_API_KEY.",
		);
	}

	return providers;
}

function selectNextProvider(): ProviderDescriptor {
	const providers = getConfiguredProviders();
	const provider = providers[nextProviderIndex % providers.length];

	nextProviderIndex = (nextProviderIndex + 1) % providers.length;

	console.log(`[chat-router] selected provider=${provider.id} model=${provider.getModel()}`);

	return provider;
}

export function getConfiguredProviderSummary(): Array<{ provider: ChatProviderId; model: string }> {
	return getConfiguredProviders().map((provider) => ({
		provider: provider.id,
		model: provider.getModel(),
	}));
}

export async function sendChatCompletion(input: {
	messages: ChatInputMessage[];
}): Promise<ChatProviderTextResult> {
	const provider = selectNextProvider();
	const text = await provider.sendText({ messages: input.messages });

	return {
		provider: provider.id,
		model: provider.getModel(),
		text,
	};
}

export async function sendChatCompletionStream(input: {
	messages: ChatInputMessage[];
	signal?: AbortSignal;
}): Promise<ChatProviderStreamResult> {
	const provider = selectNextProvider();
	const stream = await provider.sendStream({
		messages: input.messages,
		signal: input.signal,
	});

	return {
		provider: provider.id,
		model: provider.getModel(),
		stream,
	};
}

if (!config.openRouterApiKey && !config.groqApiKey && !config.cerebrasApiKey) {
	console.warn("No LLM provider API keys detected. Configure at least one provider before using /chat.");
}