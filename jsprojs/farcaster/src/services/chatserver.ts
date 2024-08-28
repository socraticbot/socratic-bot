import axios from 'axios';
import { config } from '../config';

const client = axios.create({
    baseURL: config.CHATSERVER_API_URL,
    headers: {
      Authorization: `Bearer ${config.CHATSERVER_API_KEY}`,
      'Content-Type': 'application/json',
    },
})

export async function createConversation(message: string): Promise<{ conversation_id: string; message: string }> {
    const res = await client.post('/new', {
        name: 'dfs_v1',
        request: {
            topic: message,
        },
    });
    
    return res.data;
}

export async function sendMessage(conversationId: string, content: string): Promise<string> {
    const res = await client.post('/reply', {
        conversation_id: conversationId,
        message: content,
    });
    return res.data.message;
}
