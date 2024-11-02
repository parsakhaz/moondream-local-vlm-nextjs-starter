import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import formidable from 'formidable';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable();
    const [fields] = await form.parse(req);
    
    const question = fields.question?.[0];
    const imageKey = fields.image_key?.[0];

    if (!question || !imageKey) {
      return res.status(400).json({ error: 'Missing question or image key' });
    }

    console.log('Sending question to Moondream API...');
    console.log('Question:', question);
    console.log('Image Key:', imageKey);
    
    // Send request to local Moondream endpoint using IPv4 address
    const formData = new FormData();
    formData.append('question', question);
    formData.append('image_key', imageKey);

    const response = await axios.post('http://127.0.0.1:8000/ask', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    console.log('Received answer:', response.data);

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error asking question:', error);
    return res.status(500).json({ error: 'Failed to process question' });
  }
} 