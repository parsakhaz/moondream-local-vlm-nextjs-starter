# Prerequisites

## System Requirements

- NVIDIA RTX 4090M GPU
- Windows 11
- Python 3.8+

## CUDA Setup

1. Install NVIDIA GPU drivers (Latest Game Ready Driver)
   - Download from: <https://www.nvidia.com/download/index.aspx>
   - Select: RTX 4090M
   - Verify installation: `nvidia-smi`

2. Install CUDA Toolkit 12.1
   - Download from: <https://developer.nvidia.com/cuda-12-1-0-download-archive>
   - Choose: Windows → x86_64 → 11 → exe(network)
   - Verify installation: `nvcc --version`

3. Install PyTorch with CUDA 12.1 support

   ```bash
   pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
   ```

## Python Dependencies

Install all required packages:

```bash
pip install -r requirements.txt
```

## Required Python Packages

- fastapi
- uvicorn
- python-multipart
- transformers
- torch (with CUDA support)
- Pillow
- accelerate
- typing-extensions

## Verify Installation

1. Test CUDA Setup:

```bash
python test_pytorch-cuda.py
```

2. Start the FastAPI server:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

3. Check API Health:

```bash
curl http://localhost:8000/health
```

## Troubleshooting

1. If CUDA is not detected:
   - Verify NVIDIA drivers: `nvidia-smi`
   - Check CUDA: `nvcc --version`
   - Verify PyTorch CUDA: `python test_pytorch-cuda.py`

2. If model fails to load:
   - Check available GPU memory
   - Ensure all dependencies are installed
   - Verify Python version compatibility
