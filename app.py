"""
Moondream API Server
-------------------
A FastAPI server that provides OpenAI-compatible endpoints for image understanding using the Moondream vision language model.

Key Features:
- OpenAI API-compatible endpoints (/v1/chat/completions)
- Drop-in replacement for OpenAI's image understanding capabilities
- Local processing with CUDA acceleration
- Privacy-focused: all processing happens on your machine

Usage with OpenAI SDK:
    ```python
    from openai import OpenAI
    
    client = OpenAI(
        base_url="http://localhost:8000/v1",  # Point to your Moondream server
        api_key="not-needed"  # Can be any string
    )

    # Use it like OpenAI's API
    response = await client.chat.completions.create(
        model="moondream-v2",
        messages=[
            {"role": "user", "content": "What's in this image?"}
        ],
        temperature=0.7,
        max_tokens=1024
    )
    ```

Usage with curl:
    ```bash
    curl -X POST http://localhost:8000/v1/chat/completions \
        -H "Content-Type: multipart/form-data" \
        -F "file=@image.jpg" \
        -F 'messages=[{"role":"user","content":"What is in this image?"}]' \
        -F "temperature=0.7" \
        -F "max_tokens=1024"
    ```

Environment:
    - Python 3.8+
    - CUDA-capable GPU (recommended)
    - Required packages in requirements.txt
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Depends
from transformers import AutoModelForCausalLM, AutoTokenizer
from PIL import Image
import io
import torch
import logging
import sys
import platform
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Union
import time
from fastapi.encoders import jsonable_encoder
import uuid

# Set up detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class Message(BaseModel):
    """
    Represents a chat message in the conversation.
    
    Attributes:
        role (str): The role of the message sender ('user' or 'assistant')
        content (str): The actual message content
    
    Example:
        {
            "role": "user",
            "content": "What objects do you see in this image?"
        }
    """
    role: str = Field(..., description="Role of the message sender ('user' or 'assistant')")
    content: str = Field(..., description="Content of the message")

class ImageChatRequest(BaseModel):
    """
    Request model for image chat endpoints.
    
    Attributes:
        messages (List[Message]): List of conversation messages
        max_tokens (Optional[int]): Maximum tokens for response (default: 1024)
        temperature (Optional[float]): Sampling temperature (default: 0.7)
    
    Example:
        {
            "messages": [
                {"role": "user", "content": "What's in this image?"}
            ],
            "max_tokens": 1024,
            "temperature": 0.7
        }
    """
    messages: List[Message] = Field(..., description="List of conversation messages")
    max_tokens: Optional[int] = Field(1024, description="Maximum tokens for response")
    temperature: Optional[float] = Field(0.7, description="Sampling temperature")

class ChatResponse(BaseModel):
    """
    Response model for chat endpoints.
    
    Attributes:
        model (str): Model identifier
        created (int): Unix timestamp of response
        response (Message): The model's response message
        usage (dict): Token usage statistics
    
    Example:
        {
            "model": "moondream-v2",
            "created": 1635724800,
            "response": {
                "role": "assistant",
                "content": "The image shows..."
            },
            "usage": {
                "prompt_tokens": 10,
                "completion_tokens": 50,
                "total_tokens": 60
            }
        }
    """
    model: str
    created: int
    response: Message
    usage: dict

# Initialize FastAPI app with detailed documentation
app = FastAPI(
    title="Moondream API",
    description="""
    API for image understanding using the Moondream vision language model.
    
    Features:
    - Image description
    - Visual question answering
    - Batch processing
    - CUDA acceleration
    
    All processing happens locally for privacy and speed.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model initialization
model_id = "vikhyatk/moondream2"
revision = "2024-07-23"

print(f"Using CUDA: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"CUDA Device: {torch.cuda.get_device_name(0)}")
    print(f"CUDA Memory Allocated: {torch.cuda.memory_allocated(0) / 1024**2:.2f} MB")

try:
    print("Starting model loading process...")
    logger.info(f"Loading Moondream model from {model_id} (revision: {revision})")
    
    model = AutoModelForCausalLM.from_pretrained(
        model_id, 
        trust_remote_code=True, 
        revision=revision,
        torch_dtype=torch.float16
    )
    
    # Simple device placement
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = model.to(device)
    print(f"Model loaded successfully and moved to {device}")
    
    print("Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_id, revision=revision)
    print("Tokenizer loaded successfully")
    
    model.eval()
    logger.info("Model initialization complete")
    print(f"Model device: {next(model.parameters()).device}")
    if torch.cuda.is_available():
        print(f"CUDA Memory After Loading: {torch.cuda.memory_allocated(0) / 1024**2:.2f} MB")
except Exception as e:
    error_msg = f"Error loading model: {str(e)}"
    logger.error(error_msg)
    print(error_msg)
    raise RuntimeError(error_msg)

@app.post("/describe", 
         description="Generate a description for a single image",
         response_model=dict)
async def describe_image(file: UploadFile = File(...)):
    print(f"\n--- Processing new image: {file.filename} ---")
    logger.info(f"Received image upload: {file.filename} ({file.content_type})")
    
    if not file.content_type.startswith('image/'):
        error_msg = f"Invalid file type: {file.content_type}"
        logger.error(error_msg)
        raise HTTPException(status_code=400, detail=error_msg)
    
    try:
        print("Reading image data...")
        image_data = await file.read()
        
        print("Converting to PIL Image...")
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        print(f"Image size: {image.size}")
        
        print("Starting image encoding...")
        with torch.inference_mode():
            print("Encoding image...")
            enc_image = model.encode_image(image)
            print("Generating description...")
            description = model.answer_question(enc_image, "Describe this image.", tokenizer)
        
        print(f"Generated description: {description}")
        logger.info("Successfully processed image and generated description")
        
        if torch.cuda.is_available():
            print(f"CUDA Memory Usage: {torch.cuda.memory_allocated(0) / 1024**2:.2f} MB")
        
        return {"description": description}
    except Exception as e:
        error_msg = f"Error processing image: {str(e)}"
        logger.error(error_msg)
        print(f"Error: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/batch_describe",
         description="Generate descriptions for multiple images with custom prompts",
         response_model=dict)
async def batch_describe(
    images: List[UploadFile] = File(...),
    prompts: Optional[List[str]] = None
):
    print(f"\n--- Processing batch of {len(images)} images ---")
    logger.info(f"Received batch request with {len(images)} images")
    
    if not images:
        error_msg = "No images provided"
        logger.error(error_msg)
        raise HTTPException(status_code=400, detail=error_msg)
    
    if prompts and len(prompts) != len(images):
        error_msg = f"Prompt count ({len(prompts)}) doesn't match image count ({len(images)})"
        logger.error(error_msg)
        raise HTTPException(status_code=400, detail=error_msg)
    
    try:
        image_list = []
        
        # Process images
        for idx, img in enumerate(images):
            print(f"Processing image {idx + 1}/{len(images)}: {img.filename}")
            if not img.content_type.startswith('image/'):
                error_msg = f"Invalid file type for {img.filename}: {img.content_type}"
                logger.error(error_msg)
                raise HTTPException(status_code=400, detail=error_msg)
                
            image_data = await img.read()
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
            print(f"Image {idx + 1} size: {image.size}")
            image_list.append(image)
        
        if not prompts:
            prompts = ["Describe this image."] * len(images)
            print("Using default prompts for all images")
        
        print("Starting batch processing...")
        with torch.inference_mode():
            answers = model.batch_answer(
                images=image_list,
                prompts=prompts,
                tokenizer=tokenizer,
            )
        
        print("Batch processing complete")
        for idx, answer in enumerate(answers):
            print(f"Result {idx + 1}: {answer}")
            
        if torch.cuda.is_available():
            print(f"CUDA Memory Usage: {torch.cuda.memory_allocated(0) / 1024**2:.2f} MB")
            
        logger.info("Successfully processed batch")
        return {"answers": answers}
    except Exception as e:
        error_msg = f"Error processing batch: {str(e)}"
        logger.error(error_msg)
        print(f"Error: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/health",
         description="Check system health and CUDA status",
         responses={
             200: {
                 "description": "System health information",
                 "content": {
                     "application/json": {
                         "example": {
                             "status": "healthy",
                             "system_info": {"cuda_available": True},
                             "cuda_info": {"device_name": "NVIDIA GeForce RTX 3080"},
                             "model_info": {"model_loaded": True}
                         }
                     }
                 }
             }
         })
async def health_check():
    """
    Comprehensive health check of the service, model and CUDA setup.
    
    Returns:
        Dict containing:
        - System information
        - CUDA status and memory usage
        - Model status
        - Basic CUDA computation test results
    
    Example response:
        {
            "status": "healthy",
            "system_info": {
                "python_version": "3.8.10",
                "cuda_available": true
            },
            "cuda_info": {
                "device_name": "NVIDIA GeForce RTX 3080",
                "total_memory_gb": 10.0
            },
            "model_info": {
                "model_loaded": true,
                "model_device": "cuda:0"
            }
        }
    """
    print("\n=== Health Check ===")
    
    # System Information
    system_info = {
        "python_version": sys.version,
        "platform": platform.platform(),
        "pytorch_version": torch.__version__,
        "cuda_available": torch.cuda.is_available()
    }
    
    # CUDA Information
    cuda_info = {}
    if torch.cuda.is_available():
        cuda_info = {
            "cuda_version": torch.version.cuda,
            "device_count": torch.cuda.device_count(),
            "current_device": torch.cuda.current_device(),
            "device_name": torch.cuda.get_device_name(0),
            "total_memory_gb": torch.cuda.get_device_properties(0).total_memory / 1024**3,
            "allocated_memory_gb": torch.cuda.memory_allocated(0) / 1024**3,
            "cached_memory_gb": torch.cuda.memory_reserved(0) / 1024**3
        }
    
    # Model Information
    model_info = {
        "model_loaded": model is not None,
        "model_device": str(next(model.parameters()).device),
        "model_dtype": str(next(model.parameters()).dtype),
        "tokenizer_loaded": tokenizer is not None
    }
    
    # CUDA Tensor Test
    cuda_test_result = "not_performed"
    if torch.cuda.is_available():
        try:
            # Create and move tensor to GPU
            x = torch.rand(5, 3)
            x = x.cuda()
            # Simple computation test
            y = x * 2
            cuda_test_result = "passed"
        except Exception as e:
            cuda_test_result = f"failed: {str(e)}"
    
    health_status = {
        "status": "healthy",
        "system_info": system_info,
        "cuda_info": cuda_info,
        "model_info": model_info,
        "cuda_test": cuda_test_result
    }
    
    print(f"Health check result: {health_status}")
    return health_status

class Choice(BaseModel):
    """OpenAI-style choice object"""
    index: int
    message: Message
    finish_reason: str = "stop"

class Usage(BaseModel):
    """OpenAI-style usage object"""
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class ChatCompletionResponse(BaseModel):
    """
    OpenAI-compatible chat completion response.
    
    Example Response:
        {
            "id": "chatcmpl-123abc",
            "object": "chat.completion",
            "created": 1677858242,
            "model": "moondream-v2",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": "The image shows..."
                    },
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": 10,
                "completion_tokens": 50,
                "total_tokens": 60
            }
        }
    """
    id: str
    object: str = "chat.completion"
    created: int
    model: str
    choices: List[Choice]
    usage: Usage

@app.post("/v1/chat/completions",
         description="OpenAI-compatible chat completion endpoint for images",
         response_model=ChatCompletionResponse,
         responses={
             200: {
                 "description": "Successful OpenAI-compatible response",
                 "content": {
                     "application/json": {
                         "example": {
                             "id": "chatcmpl-123abc",
                             "object": "chat.completion",
                             "created": 1677858242,
                             "model": "moondream-v2",
                             "choices": [{
                                 "index": 0,
                                 "message": {
                                     "role": "assistant",
                                     "content": "The image shows a cat sitting on a windowsill."
                                 },
                                 "finish_reason": "stop"
                             }],
                             "usage": {
                                 "prompt_tokens": 10,
                                 "completion_tokens": 50,
                                 "total_tokens": 60
                             }
                         }
                     }
                 }
             },
             400: {
                 "description": "Invalid request format",
                 "content": {
                     "application/json": {
                         "example": {
                             "error": {
                                 "message": "Invalid request format",
                                 "type": "invalid_request_error",
                                 "param": None,
                                 "code": "invalid_request"
                             }
                         }
                     }
                 }
             }
         })
async def chat_completion(
    file: UploadFile = File(..., description="Image file to analyze"),
    messages: str = Form(..., description="JSON string of messages array"),
    model: str = Form("moondream-v2", description="Model to use"),
    temperature: Optional[float] = Form(0.7, description="Sampling temperature"),
    max_tokens: Optional[int] = Form(1024, description="Maximum tokens for response"),
):
    """
    OpenAI-compatible chat completion endpoint for images.
    Compatible with existing OpenAI client libraries.
    """
    try:
        # Parse messages
        messages_list = json.loads(messages)
        
        # Process image and get response
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Get last user message as prompt
        user_messages = [msg for msg in messages_list if msg.get('role', '').lower() == 'user']
        prompt = user_messages[-1].get('content', "Describe this image.") if user_messages else "Describe this image."
        
        # Generate response
        with torch.inference_mode():
            enc_image = model.encode_image(image)
            response_text = model.answer_question(
                enc_image,
                prompt,
                tokenizer,
            )
        
        # Calculate token counts (approximate)
        prompt_tokens = len(prompt.split())
        completion_tokens = len(response_text.split())
        
        # Format as OpenAI-style response
        response = ChatCompletionResponse(
            id=f"chatcmpl-{uuid.uuid4()}",
            created=int(time.time()),
            model=model,
            choices=[
                Choice(
                    index=0,
                    message=Message(
                        role="assistant",
                        content=response_text
                    ),
                    finish_reason="stop"
                )
            ],
            usage=Usage(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=prompt_tokens + completion_tokens
            )
        )
        
        return response
        
    except Exception as e:
        # OpenAI-style error response
        raise HTTPException(
            status_code=500,
            detail={
                "error": {
                    "message": str(e),
                    "type": "internal_error",
                    "param": None,
                    "code": "server_error"
                }
            }
        )

@app.post("/batch_chat",
         description="Chat with multiple images using different prompts",
         response_model=dict)
async def batch_chat_with_images(
    images: List[UploadFile] = File(...),
    chat_requests: List[ImageChatRequest] = None
):
    """
    Process multiple images with their respective chat prompts in batch.
    """
    print(f"\n--- Starting batch image chat with {len(images)} images ---")
    logger.info(f"Received batch chat request with {len(images)} images")
    
    if not images:
        raise HTTPException(status_code=400, detail="No images provided")
    
    try:
        image_list = []
        prompts = []
        
        # Process each image and extract prompts
        for idx, img in enumerate(images):
            if not img.content_type.startswith('image/'):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid file type for image {idx + 1}: {img.content_type}"
                )
            
            # Read and process image
            image_data = await img.read()
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
            image_list.append(image)
            
            # Extract prompt from chat request or use default
            if chat_requests and len(chat_requests) > idx:
                user_messages = [
                    msg for msg in chat_requests[idx].messages 
                    if msg.role.lower() == 'user'
                ]
                prompt = user_messages[-1].content if user_messages else "Describe this image."
            else:
                prompt = "Describe this image."
            
            prompts.append(prompt)
        
        # Process batch with model
        with torch.inference_mode():
            answers = model.batch_answer(
                images=image_list,
                prompts=prompts,
                tokenizer=tokenizer,
            )
        
        # Format responses
        responses = []
        for idx, (prompt, answer) in enumerate(zip(prompts, answers)):
            responses.append({
                "image_index": idx,
                "model": "moondream-v2",
                "created": int(time.time()),
                "response": {
                    "role": "assistant",
                    "content": answer
                },
                "usage": {
                    "prompt_tokens": len(prompt.split()),
                    "completion_tokens": len(answer.split()),
                    "total_tokens": len(prompt.split()) + len(answer.split())
                }
            })
        
        logger.info("Successfully processed batch image chat")
        return {"responses": responses}
        
    except Exception as e:
        error_msg = f"Error in batch image chat: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
