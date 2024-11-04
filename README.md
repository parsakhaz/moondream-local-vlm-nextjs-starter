# Moondream Web Interface

A modern web interface for the Moondream vision language model, built with Next.js and FastAPI. This project provides a user-friendly way to interact with images using Moondream's vision-language capabilities.

## Core Features

- 🌓 **Light/Dark Mode**: Automatic theme switching with system preference detection
- 🖼️ **Drag-and-Drop Upload**: Easy image uploading with drag-and-drop support
- 💬 **Interactive Q&A**: Ask questions about uploaded images through a chat interface
- 🚀 **Smooth Animations**: Beautiful transitions powered by Framer Motion
- 🔒 **Privacy-First**: All processing happens locally on your machine
- 📱 **Responsive Design**: Optimized for all devices and screen sizes
- ⚡ **CUDA Support**: GPU acceleration for faster inference
- 🎨 **Modern UI**: Built with Next.js, Tailwind CSS, and Framer Motion

## Architecture

### Frontend (Next.js)

- **Theme System**: Light/dark mode with system preference detection
- **Image Upload Component**: Drag-and-drop image handling and preview
- **Chat Interface**: Interactive Q&A about uploaded images
- **State Management**: Maintains image and chat state
- **API Integration**: Communicates with FastAPI backend

### Backend (FastAPI)

- **Model Management**: Loads and manages Moondream model
- **Image Processing**: Handles image encoding and caching
- **Q&A System**: Processes questions about encoded images
- **Memory Management**: Cleans up cached encodings

## Detailed API Flow

### Image Description Flow

1. User uploads image via frontend
2. Image sent to `/describe` endpoint
3. Backend encodes image and caches encoding
4. Model generates description
5. Frontend displays description and enables Q&A

### Question-Answer Flow

1. User types question in chat interface
2. Question sent to `/ask` endpoint with image key
3. Backend retrieves cached encoding
4. Model generates answer
5. Frontend displays response in chat

## Installation

### Prerequisites

~~~bash
# System Requirements
- Python 3.8+
- Node.js 16+
- CUDA-capable GPU (recommended)
- 8GB+ RAM

# Python Dependencies
pip install transformers einops torch fastapi uvicorn python-multipart pillow

# Node.js Dependencies
npm install axios framer-motion @radix-ui/react-slot formidable
~~~

### Backend Setup

~~~bash
# Clone repository
git clone [repository-url]
cd moondream-web

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
~~~

### Frontend Setup

~~~bash
# Navigate to frontend directory
cd moondream-web

# Install dependencies
npm install

# Start development server
npm run dev
~~~

## API Endpoints

### `/describe` (POST)

Handles initial image upload and description

- Input: Image file (multipart/form-data)
- Output:

  ~~~json
  {
    "description": "Generated description of the image",
    "image_key": "Unique key for cached encoding"
  }
  ~~~

### `/ask` (POST)

Handles questions about previously uploaded images

- Input:

  ~~~json
  {
    "question": "User's question about the image",
    "image_key": "Key from previous describe call"
  }
  ~~~

- Output:

  ~~~json
  {
    "answer": "Model's answer to the question"
  }
  ~~~

### `/health` (GET)

System health and status check

- Output:

  ~~~json
  {
    "status": "healthy",
    "model_loaded": true,
    "tokenizer_loaded": true,
    "cuda_available": true,
    "device": "cuda:0"
  }
  ~~~

## Implementation Details

### Theme System

- Uses next-themes for theme management
- Automatically detects system color scheme preference
- Smooth transitions between light and dark modes
- Persists user theme preference

### Image Encoding Cache

- Stores encoded images in memory using unique timestamps
- Enables fast subsequent Q&A without re-encoding
- Automatically cleans up on server restart

### Error Handling

- Frontend displays user-friendly error messages
- Backend provides detailed error logging
- Graceful fallbacks for common failure cases

### Performance Optimizations

- Uses torch.float16 for reduced memory usage
- CUDA acceleration when available
- Efficient image encoding caching
- Streaming responses for large payloads

## Development

### Code Structure

~~~
moondream-web/
├── src/
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── ImageUpload.tsx   # Image upload component
│   │   └── Chat.tsx         # Chat interface component
│   ├── pages/
│   │   ├── api/
│   │   │   ├── ask.ts       # Question handling endpoint
│   │   │   └── api.ts       # API utilities
│   │   ├── _app.tsx         # App configuration
│   │   ├── _document.tsx    # Document configuration
│   │   └── index.tsx        # Main page
│   └── styles/
│       └── globals.css      # Global styles
├── public/                  # Static assets
└── app.py                  # FastAPI backend
~~~

### Development Workflow

1. Make changes to frontend or backend
2. Backend auto-reloads with uvicorn
3. Frontend hot-reloads with Next.js
4. Test changes in development environment

## Troubleshooting

### Common Issues

1. CUDA Memory Errors
   - Reduce batch size
   - Close other GPU applications
   - Monitor memory usage with `nvidia-smi`

2. Connection Errors
   - Verify FastAPI server is running
   - Check correct ports are open
   - Ensure correct IP addresses (127.0.0.1)

3. Image Processing Errors
   - Verify supported image formats
   - Check image file size
   - Monitor server logs

## Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests if applicable
5. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built on [Moondream](https://github.com/vikhyat/moondream) model
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Theme system by [next-themes](https://github.com/pacocoursey/next-themes)

---

Created with ❤️ for the AI community
