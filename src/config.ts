const rawPort = Bun.env.PORT ?? "3000";
const parsedPort = Number(rawPort);
const rawIdleTimeout = Bun.env.IDLE_TIMEOUT_SECONDS ?? "255";
const parsedIdleTimeout = Number(rawIdleTimeout);

export const config = {
	port: Number.isFinite(parsedPort) ? parsedPort : 3000,
	idleTimeout: Number.isFinite(parsedIdleTimeout) ? parsedIdleTimeout : 255,
	openRouterApiKey: Bun.env.OPENROUTER_API_KEY,
	openRouterReferer: Bun.env.OPENROUTER_REFERER,
	openRouterTitle: Bun.env.OPENROUTER_TITLE,
	openRouterModel: Bun.env.OPENROUTER_MODEL ?? "deepseek/deepseek-chat-v3-0324:free",
	groqApiKey: Bun.env.GROQ_API_KEY,
	groqModel: Bun.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
	cerebrasApiKey: Bun.env.CEREBRAS_API_KEY,
	cerebrasModel: Bun.env.CEREBRAS_MODEL ?? "llama3.1-8b",
};