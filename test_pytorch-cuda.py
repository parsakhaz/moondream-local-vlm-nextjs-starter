import torch
import sys
import platform

def test_cuda():
    """
    Comprehensive test of PyTorch CUDA setup
    """
    # System Information
    print("=== System Information ===")
    print(f"Python version: {sys.version}")
    print(f"Platform: {platform.platform()}")
    print(f"PyTorch version: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    
    if torch.cuda.is_available():
        print("\n=== CUDA Information ===")
        print(f"CUDA version: {torch.version.cuda}")
        print(f"CUDA device count: {torch.cuda.device_count()}")
        print(f"Current CUDA device: {torch.cuda.current_device()}")
        print(f"CUDA device name: {torch.cuda.get_device_name(0)}")
        
        # Memory Information
        print("\n=== GPU Memory Information ===")
        print(f"Total GPU memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
        print(f"Allocated GPU memory: {torch.cuda.memory_allocated(0) / 1024**3:.2f} GB")
        print(f"Cached GPU memory: {torch.cuda.memory_reserved(0) / 1024**3:.2f} GB")
        
        # Test CUDA with tensor operations
        print("\n=== CUDA Tensor Test ===")
        try:
            # Create and move tensor to GPU
            x = torch.rand(5, 3)
            print("CPU Tensor:")
            print(x)
            
            x = x.cuda()
            print("\nGPU Tensor:")
            print(x)
            
            # Simple computation test
            y = x * 2
            print("\nComputation result (x * 2):")
            print(y)
            
            print("\n✅ CUDA test passed successfully!")
            
        except Exception as e:
            print(f"\n❌ CUDA test failed: {str(e)}")
    else:
        print("\n❌ CUDA is not available. Please check your setup:")
        print("1. Verify NVIDIA drivers are installed (nvidia-smi)")
        print("2. Verify CUDA toolkit is installed (nvcc --version)")
        print("3. Reinstall PyTorch with CUDA support:")
        print("   pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121")

if __name__ == "__main__":
    test_cuda()