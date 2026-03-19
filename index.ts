import { app } from "./src/app";
import { config } from "./src/config";
import { getConfiguredProviderSummary } from "./src/services/chat-router";

const server = Bun.serve({
	port: config.port,
	idleTimeout: config.idleTimeout,
	fetch: app.fetch,
});

console.log(`API running on http://localhost:${server.port}`);

const configuredProviders = getConfiguredProviderSummary();

if (configuredProviders.length > 0) {
	console.log(
		`LLM providers: ${configuredProviders.map((provider) => `${provider.provider}:${provider.model}`).join(", ")}`,
	);
}