/**
 * Chat Component
 * 
 * A component that provides a chat interface for asking questions about an image.
 * Uses the Moondream model's Q&A capabilities through a local API endpoint.
 * 
 * Features:
 * - Real-time chat interface with user and assistant messages
 * - Question input with loading states
 * - Scrollable chat history
 * - Error handling
 */

import { useState } from 'react';
import { Button } from './ui/button';
// import SimpleBar from 'simplebar-react';
// import 'simplebar-react/dist/simplebar.min.css';

// Type definition for chat messages
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Props interface for the Chat component
interface ChatProps {
  imageKey: string;  // Unique key for the cached image encoding
}

export default function Chat({ imageKey }: ChatProps) {
  // State management for messages, input, and loading state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles sending questions to the Moondream model and receiving answers
   * Updates the chat history with both question and answer
   */
  const askQuestion = async () => {
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      
      // Add user question to chat immediately for better UX
      const userMessage: Message = { role: 'user', content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // Prepare form data for API request
      const formData = new FormData();
      formData.append('question', input);
      formData.append('image_key', imageKey);

      // Send request to local API endpoint
      const response = await fetch('/api/ask', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      // Add model's response to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error asking question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full max-w-2xl mx-auto">
      {/* Chat history container with scrolling */}
      <div className="flex flex-col space-y-4 h-[200px] p-4 rounded-lg bg-gray-900 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Individual message bubbles with role-based styling */}
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Question input and submit section */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
          placeholder="Ask a question about the image..."
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
          disabled={isLoading}
        />
        <Button
          onClick={askQuestion}
          disabled={isLoading || !input.trim()}
          className="px-6"
        >
          {isLoading ? 'Asking...' : 'Ask'}
        </Button>
      </div>
    </div>
  );
}