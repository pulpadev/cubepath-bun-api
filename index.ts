const server = Bun.serve({
	port: Number(process.env.PORT ?? 3000),
	fetch(request) {
		const url = new URL(request.url);

		if (url.pathname === "/health") {
			return Response.json({
				status: "ok",
			});
		}

		return new Response("Not Found", { status: 404 });
	},
});

console.log(`API running on http://localhost:${server.port}`);