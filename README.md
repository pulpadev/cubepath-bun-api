# cubepath-bun-api

API minima con Bun y OpenRouter.

## Ejecutar

```bash
bun run start
```

Abre [http://localhost:3000](http://localhost:3000) para usar el cliente HTML de prueba.

Variables de entorno:

- `OPENROUTER_API_KEY` obligatoria
- `OPENROUTER_MODEL` opcional. Por defecto: `deepseek/deepseek-chat-v3-0324:free`
- `OPENROUTER_REFERER` opcional
- `OPENROUTER_TITLE` opcional
- `PORT` opcional
- `IDLE_TIMEOUT_SECONDS` opcional. Por defecto: `255`

## Endpoint

- `GET /health`
- `POST /chat` en streaming SSE
- `GET /` cliente HTML minimalista

Respuesta esperada:

```json
{
	"status": "ok"
}
```

Ejemplo para `POST /chat`:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "Dime una frase corta sobre Bun"
  }'
```

El endpoint devuelve `text/event-stream` con eventos:

- `start`: metadatos iniciales
- `token`: fragmentos de texto a medida que llegan
- `end`: fin de la respuesta
- `error`: error durante el stream

Ejemplo de consumo con `fetch`:

```ts
const response = await fetch("http://localhost:3000/chat", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		Accept: "text/event-stream",
	},
	body: JSON.stringify({
		message: "Explica Bun en una frase",
	}),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (reader) {
	const { done, value } = await reader.read();

	if (done) {
		break;
	}

	console.log(decoder.decode(value, { stream: true }));
}
```

Tambien acepta `messages` y `model` en el body:

```json
{
	"model": "deepseek/deepseek-chat-v3-0324:free",
	"messages": [
		{
			"role": "user",
			"content": "Que es Bun?"
		}
	]
}
```
