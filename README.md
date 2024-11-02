# Moondream Web Interface

A modern web interface for the Moondream vision language model, built with Next.js and FastAPI. This project allows you to run image understanding tasks entirely locally with OpenAI API compatibility.

## Tested Environment

This project has been thoroughly tested on:
- Lenovo Legion 7i
- Windows 11 Pro
- NVIDIA RTX 4090M GPU (16GB VRAM)
- 32GB System RAM
- Intel i9-13900HX CPU

## Prerequisites

### System Requirements
- NVIDIA GPU with 8GB+ VRAM (tested on RTX 4090M)
- Windows 11 (or Linux/macOS with equivalent setup)
- Python 3.8 or higher
- Node.js 16+
- 16GB+ System RAM recommended

### CUDA Setup

1. Install NVIDIA GPU Drivers
   - Download latest Game Ready Driver from NVIDIA website
   - Verify installation:
   ~~~bash
   nvidia-smi
   ~~~

2. Install CUDA Toolkit 12.1
   - Download from NVIDIA Developer portal
   - Run network installer
   - Add CUDA paths to system environment variables
   - Verify installation:
   ~~~bash
   nvcc --version
   ~~~

3. Install PyTorch with CUDA support
   ~~~bash
   pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
   ~~~

## Installation Guide

### Backend Setup

1. Clone the repository
   ~~~bash
   git clone https://github.com/yourusername/moondream-web.git
   cd moondream-web
   ~~~

2. Create and activate virtual environment
   ~~~bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate # Linux/macOS
   ~~~

3. Install Python dependencies
   ~~~bash
   pip install -r requirements.txt
   ~~~

4. Verify CUDA setup
   ~~~bash
   python test_pytorch-cuda.py
   ~~~

5. Start FastAPI server
   ~~~bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ~~~

### Frontend Setup

1. Navigate to frontend directory
   ~~~bash
   cd moondream-web
   ~~~

2. Install Node.js dependencies
   ~~~bash
   npm install
   ~~~

3. Create environment file
   ~~~bash
   cp .env.example .env.local
   ~~~

4. Start development server
   ~~~bash
   npm run dev
   ~~~

## Features

- 🔄 OpenAI API-compatible endpoints
- 🖼️ Local image processing with Moondream vision language model
- 🚀 Modern, responsive UI built with Next.js
- 🔒 Privacy-first approach - all processing happens locally
- ⚡ CUDA acceleration support
- 🎨 Sleek design with Tailwind CSS and Framer Motion animations

## API Usage Examples

### OpenAI SDK
~~~python
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
~~~

### Langchain
~~~python
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage

chat = ChatOpenAI(
    base_url="http://localhost:8000/v1",
    api_key="not-needed",
    model="moondream-v2"
)

messages = [HumanMessage(content="What's in this image?")]
response = chat.invoke(messages)
~~~

### Direct API Call
~~~bash
curl -X POST http://localhost:8000/v1/chat/completions \
    -H "Content-Type: multipart/form-data" \
    -F "file=@image.jpg" \
    -F 'messages=[{"role":"user","content":"What is in this image?"}]'
~~~

## Troubleshooting

### Common Issues

1. CUDA Not Detected
   - Verify NVIDIA drivers with `nvidia-smi`
   - Check CUDA installation with `nvcc --version`
   - Ensure PyTorch CUDA compatibility

2. Out of Memory Errors
   - Close other GPU-intensive applications
   - Reduce batch size if processing multiple images
   - Consider using a GPU with more VRAM

3. Frontend Connection Issues
   - Verify backend server is running
   - Check port configurations
   - Ensure no firewall blocking

### Performance Optimization

1. GPU Optimization
   - Enable hardware-accelerated GPU scheduling in Windows
   - Update to latest NVIDIA drivers
   - Monitor GPU usage with Task Manager

2. System Configuration
   - Set Windows power plan to "High Performance"
   - Allocate sufficient virtual memory
   - Close unnecessary background applications

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built on [Moondream](https://github.com/vikhyat/moondream) model
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

---

Created with ❤️ for the AI community
