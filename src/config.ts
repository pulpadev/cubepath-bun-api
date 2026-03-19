const rawPort = Bun.env.PORT ?? "3000";
const parsedPort = Number(rawPort);

export const config = {
	port: Number.isFinite(parsedPort) ? parsedPort : 3000,
	openRouterApiKey: Bun.env.OPENROUTER_API_KEY,
	openRouterReferer: Bun.env.OPENROUTER_REFERER,
	openRouterTitle: Bun.env.OPENROUTER_TITLE,
	openRouterModel: Bun.env.OPENROUTER_MODEL ?? "deepseek/deepseek-chat-v3-0324:free",
};