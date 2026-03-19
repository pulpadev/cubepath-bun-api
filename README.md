# cubepath-bun-api

API minima con Bun y OpenRouter.

## Ejecutar

```bash
bun run start
```

Variables de entorno:

- `OPENROUTER_API_KEY` obligatoria
- `OPENROUTER_MODEL` opcional. Por defecto: `deepseek/deepseek-chat-v3-0324:free`
- `OPENROUTER_REFERER` opcional
- `OPENROUTER_TITLE` opcional
- `PORT` opcional

## Endpoint

- `GET /health`
- `POST /chat`

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
  -d '{
    "message": "Dime una frase corta sobre Bun"
  }'
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
