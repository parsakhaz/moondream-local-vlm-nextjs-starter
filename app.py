"""
Moondream Web Interface - FastAPI Backend
---------------------------------------

This module provides the FastAPI backend for the Moondream web interface.
It handles image processing, caching, and Q&A functionality using the Moondream model.

Key Components:
    - FastAPI server with CORS support
    - Moondream model initialization and management
    - Image encoding cache system
    - RESTful endpoints for image description and Q&A
    - Health monitoring

Dependencies:
    - FastAPI: Web framework
    - Transformers: For Moondream model
    - PyTorch: ML framework
    - Pillow: Image processing
    - Python 3.8+
    - CUDA (optional but recommended)
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Depends
from transformers import AutoModelForCausalLM, AutoTokenizer
from PIL import Image
import io
import torch
import json
import time
from typing import List
import logging
from fastapi.middleware.cors import CORSMiddleware

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Moondream API",
    description="Local API server for Moondream vision language model",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model and tokenizer
print("Loading model and tokenizer...")
model_id = "vikhyatk/moondream2"
revision = "2024-07-23"

try:
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        trust_remote_code=True,
        revision=revision,
        torch_dtype=torch.float16,
    )
    if torch.cuda.is_available():
        model = model.to("cuda")
    tokenizer = AutoTokenizer.from_pretrained(model_id, revision=revision)
    print("Model and tokenizer loaded successfully")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    raise

# Store encoded images temporarily
encoded_images = {}

@app.post("/describe")
async def describe_image(file: UploadFile = File(...)):
    """
    Generate a description for an uploaded image and cache its encoding.

    Args:
        file (UploadFile): The image file to process

    Returns:
        dict: Contains the image description and a key for accessing the cached encoding
            {
                "description": str,
                "image_key": str
            }

    Raises:
        HTTPException: If image processing fails
    """
    try:
        print("\nGenerating description...")
        # Read and process image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # Generate description using Moondream model
        with torch.inference_mode():
            enc_image = model.encode_image(image)
            
            # Store encoded image for future questions
            image_key = str(time.time())
            encoded_images[image_key] = enc_image
            
            description = model.answer_question(enc_image, "Describe this image.", tokenizer)
            print(f"Generated description: {description}")
        
        if torch.cuda.is_available():
            print(f"CUDA Memory Usage: {torch.cuda.memory_allocated(0) / 1024**2:.2f} MB")
        
        logger.info("Successfully processed image and generated description")
        return {
            "description": description,
            "image_key": image_key
        }
        
    except Exception as e:
        error_msg = f"Error processing image: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/ask")
async def ask_question(
    question: str = Form(...),
    image_key: str = Form(...),
):
    """
    Answer a question about a previously processed image.

    Args:
        question (str): The question to answer about the image
        image_key (str): Key to retrieve the cached image encoding

    Returns:
        dict: Contains the model's answer
            {
                "answer": str
            }

    Raises:
        HTTPException: If image key not found or processing fails
    """
    try:
        if image_key not in encoded_images:
            raise HTTPException(status_code=400, detail="Image not found. Please upload the image again.")
        
        # Get the encoded image
        enc_image = encoded_images[image_key]
        
        # Generate answer using Moondream model
        with torch.inference_mode():
            print(f"Generating answer for question: {question}")
            answer = model.answer_question(enc_image, question, tokenizer)
            print(f"Generated answer: {answer}")
        
        return {"answer": answer}
        
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Clean up old encoded images periodically
@app.on_event("startup")
@app.on_event("shutdown")
async def cleanup_encoded_images():
    encoded_images.clear()

@app.get("/health")
async def health_check():
    """
    Check system health and CUDA status
    """
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "tokenizer_loaded": tokenizer is not None,
        "cuda_available": torch.cuda.is_available(),
        "device": str(next(model.parameters()).device)
    }
