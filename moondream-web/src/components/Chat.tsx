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
import { motion, AnimatePresence } from 'framer-motion';

// Type definition for chat messages
interface Message {
	role: 'user' | 'assistant';
	content: string;
}

// Props interface for the Chat component
interface ChatProps {
	imageKey: string; // Unique key for the cached image encoding
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
			setMessages((prev) => [...prev, userMessage]);
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
			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			console.error('Error asking question:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.5, ease: 'easeOut' }}
			className='flex flex-col space-y-4 w-full max-w-2xl mx-auto p-6 border border-light-border dark:border-dark-border rounded-xl bg-light-primary/50 dark:bg-dark-primary/50 backdrop-blur-sm shadow-lg'
		>
			<motion.div
				initial={{ height: 0 }}
				animate={{ height: '200px' }}
				transition={{ duration: 0.5, ease: 'easeOut' }}
				className='flex flex-col space-y-4 p-4 rounded-lg bg-light-secondary dark:bg-dark-secondary overflow-y-auto border border-light-border/50 dark:border-dark-border/50'
			>
				<AnimatePresence mode='popLayout'>
					{messages.map((message, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
							transition={{ duration: 0.3 }}
							className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
						>
							<motion.div
								layout
								className={`max-w-[80%] rounded-lg px-4 py-2 ${
									message.role === 'user' ? 'bg-light-accent dark:bg-dark-accent text-white' : 'bg-gray-200 dark:bg-gray-700 text-light-text dark:text-dark-text'
								}`}
							>
								{message.content}
							</motion.div>
						</motion.div>
					))}
				</AnimatePresence>
			</motion.div>

			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className='flex space-x-2'>
				<input
					type='text'
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
					placeholder='Ask a question about the image...'
					className='flex-1 px-4 py-2 rounded-lg bg-light-secondary dark:bg-dark-secondary text-light-text dark:text-dark-text border border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent transition-colors'
					disabled={isLoading}
				/>
				<Button
					onClick={askQuestion}
					disabled={isLoading || !input.trim()}
					className='px-6 bg-light-accent dark:bg-dark-accent hover:bg-light-accent/90 dark:hover:bg-dark-accent/90 text-white'
				>
					{isLoading ? 'Asking...' : 'Ask'}
				</Button>
			</motion.div>
		</motion.div>
	);
}
