import { answerChat, parseChatRequest } from './_chat.js';

interface FunctionRequest {
  method?: string;
  body?: unknown;
}

interface FunctionResponse {
  status: (code: number) => FunctionResponse;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export default async function handler(req: FunctionRequest, res: FunctionResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method-not-allowed' });
    return;
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  const chatRequest = parseChatRequest(body);
  if (!chatRequest) {
    res.status(400).json({ error: 'bad-request' });
    return;
  }

  try {
    res.status(200).json(await answerChat(chatRequest));
  } catch (error) {
    console.error('chat error:', error instanceof Error ? error.message : error);
    res.status(502).json({ error: 'ai-unavailable' });
  }
}

function safeParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
