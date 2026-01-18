# Testing Guide

## Testing Mistral Integration

### Prerequisites
1. Set up your `.env.local` file with:
   ```bash
   VERCEL_AI_GATEWAY_API_KEY=your_api_key_here
   MISTRAL_MODEL=mistral/mistral-large-latest
   ```

### Test Endpoints

#### 1. Basic Text Generation
**Endpoint**: `POST /api/chat/test`

**Request**:
```json
{
  "prompt": "What is critical thinking?"
}
```

**Response**:
```json
{
  "text": "...",
  "usage": {
    "promptTokens": 10,
    "completionTokens": 50
  },
  "model": "mistral/mistral-large-latest"
}
```

#### 2. Streaming Text Generation
**Endpoint**: `POST /api/chat/stream`

**Request**:
```json
{
  "prompt": "What is critical thinking?"
}
```

**Response**: Data stream (use `useChat` or `useCompletion` from `ai` SDK)

### Test Page

Visit `/test-mistral` in your browser to test the integration interactively.

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/test-mistral`
3. Enter a prompt and click "Generate Response"
4. Verify the response is generated correctly

### Usage Monitoring

Vercel AI Gateway automatically tracks:
- Token usage
- Request count
- Latency
- Errors

View metrics in your Vercel dashboard under AI Gateway.

### Troubleshooting

**Error: "Failed to generate text"**
- Check that `VERCEL_AI_GATEWAY_API_KEY` is set in `.env.local`
- Verify the API key is valid in Vercel dashboard
- Check that the model name is correct

**Error: "Model not found"**
- Verify `MISTRAL_MODEL` is set correctly
- Check available models in Vercel AI Gateway dashboard

**No response**
- Check browser console for errors
- Check server logs for API errors
- Verify network connectivity
