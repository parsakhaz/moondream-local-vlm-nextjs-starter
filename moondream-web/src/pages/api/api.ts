// services/api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
  },
  // Important: If you're using credentials
  withCredentials: true,
});

interface Message {
  role: string;
  content: string;
}

interface ChatRequest {
  messages: Message[];
  max_tokens?: number;
  temperature?: number;
}

interface ChatCompletionChoice {
  index: number;
  message: Message;
  finish_reason: string;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Define the ChatResponse type that was missing
interface ChatResponse {
  image_index: number;
  model: string;
  created: number;
  response: Message;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface DescribeResponse {
  description: string;
  image_key: string;
}

export const describeImage = async (imageFile: File): Promise<DescribeResponse> => {
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    const response = await api.post('/describe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error describing image:', error);
    throw error;
  }
};

export const batchDescribeImages = async (imageFiles: File[], prompts: string[]): Promise<string[]> => {
  const formData = new FormData();
  imageFiles.forEach((file: File) => {
    formData.append('images', file);
  });
  prompts.forEach((prompt: string) => {
    formData.append('prompts', prompt);
  });

  try {
    const response = await api.post('/batch_describe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.answers;
  } catch (error) {
    console.error('Error in batch describing images:', error);
    throw error;
  }
};

export const createChatCompletion = async (
  imageFile: File,
  messages: Message[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}
): Promise<ChatCompletionResponse> => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('messages', JSON.stringify(messages));
  
  if (options.model) {
    formData.append('model', options.model);
  }
  if (options.temperature) {
    formData.append('temperature', options.temperature.toString());
  }
  if (options.max_tokens) {
    formData.append('max_tokens', options.max_tokens.toString());
  }

  try {
    const response = await api.post('/v1/chat/completions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    // Handle OpenAI-style errors
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    }
    throw error;
  }
};

export const batchChatWithImages = async (
  imageFiles: File[], 
  chatRequests: ChatRequest[]
): Promise<{ responses: ChatResponse[] }> => {
  const formData = new FormData();
  
  imageFiles.forEach((file: File) => {
    formData.append('images', file);
  });
  
  try {
    const response = await api.post('/batch_chat', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { chat_requests: chatRequests }
    });
    return response.data;
  } catch (error) {
    console.error('Error in batch image chat:', error);
    throw error;
  }
};
