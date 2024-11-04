import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import formidable from 'formidable';
import { createReadStream } from 'fs';
import FormData from 'form-data';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const form = formidable();
		const [fields, files] = await form.parse(req);

		const message = fields.message?.[0];
		const file = files.file?.[0];

		if (!message || !file) {
			return res.status(400).json({ error: 'Missing message or file' });
		}

		// Create form data for Moondream API
		const formData = new FormData();
		formData.append('file', createReadStream(file.filepath));

		// Format messages array as expected by the model
		const messages = [
			{
				role: 'system',
				content: 'You are a helpful AI assistant that can see and understand images.',
			},
			{
				role: 'user',
				content: message,
			},
		];

		// Important: FastAPI expects 'messages' as a JSON string
		formData.append('messages', JSON.stringify(messages));

		console.log('Sending request to Moondream API...');
		console.log('Message:', message);

		// Send request to local Moondream endpoint
		const response = await axios.post('http://localhost:8000/v1/chat/completions', formData, {
			headers: {
				...formData.getHeaders(),
			},
		});

		console.log('Received response:', response.data);

		// Extract the assistant's message from the choices array
		const assistantMessage = response.data.choices[0].message.content;

		return res.status(200).json({
			response: assistantMessage,
		});
	} catch (error) {
		console.error('Chat error:', error);
		return res.status(500).json({ error: 'Failed to process chat request' });
	}
}
