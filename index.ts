import { app } from "./src/app";
import { config } from "./src/config";

const server = Bun.serve({
	port: config.port,
	fetch: app.fetch,
});

console.log(`API running on http://localhost:${server.port}`);