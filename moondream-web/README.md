# Moondream Web Interface

A modern web interface for the Moondream vision language model, built with Next.js and FastAPI. This project allows you to run image understanding tasks entirely locally with OpenAI API compatibility.

## Features

- 🔄 OpenAI API-compatible endpoints
- 🖼️ Local image processing with Moondream vision language model
- 🚀 Modern, responsive UI built with Next.js
- 🔒 Privacy-first approach - all processing happens locally
- ⚡ CUDA acceleration support
- 🎨 Sleek design with Tailwind CSS and Framer Motion animations

## API Compatibility

### OpenAI SDK Usage
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="not-needed"  # Can be any string
)

response = await client.chat.completions.create(
    model="moondream-v2",
    messages=[
        {"role": "user", "content": "What's in this image?"}
    ]
)
```

### Langchain Usage
```python
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage

chat = ChatOpenAI(
    base_url="http://localhost:8000/v1",
    api_key="not-needed",
    model="moondream-v2"
)

messages = [HumanMessage(content="What's in this image?")]
response = chat.invoke(messages)
```

### Direct API Usage
```bash
curl -X POST http://localhost:8000/v1/chat/completions \
    -H "Content-Type: multipart/form-data" \
    -F "file=@image.jpg" \
    -F 'messages=[{"role":"user","content":"What is in this image?"}]'
```

## Tech Stack

### Frontend

- **Next.js** - React framework for production
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **shadcn/ui** - UI component library

### Backend

- **FastAPI** - Modern Python web framework
- **PyTorch** - Machine learning framework
- **Moondream** - Vision language model
- **Pillow** - Image processing
- **uvicorn** - ASGI server

## Getting Started

### Prerequisites

- Node.js 16+ for frontend
- Python 3.8+ for backend
- CUDA-capable GPU (recommended)

### Frontend Setup

```bash
# Navigate to frontend directory
cd moondream-web

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000)

### Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000)

## API Endpoints

### `/describe`

POST endpoint for single image description

- Input: Single image file
- Output: JSON with description

### `/batch_describe`

POST endpoint for batch image processing

- Input: Multiple image files and optional prompts
- Output: JSON with descriptions array

### `/health`

GET endpoint for system health check

- Output: Detailed system information including CUDA status

## Development

The project uses a modern development workflow:

- Hot reloading for both frontend and backend
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Tailwind CSS for styling
- Framer Motion for animations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open-source and available under the MIT License.

## Acknowledgments

- Built on top of the [Moondream](https://github.com/vikhyat/moondream) model
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)

---

Created with ❤️ for the AI community
