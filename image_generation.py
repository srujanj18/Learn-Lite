import os
import io
import requests
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# ✅ NEW Hugging Face Router URL
HF_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL}"

HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
if not HF_API_KEY:
    raise RuntimeError("HUGGINGFACE_API_KEY not set")

HEADERS = {
    "Authorization": f"Bearer {HF_API_KEY}",
    "Content-Type": "application/json"
}


class ImageRequest(BaseModel):
    prompt: str


@router.post("/generate-image")
def generate_image(data: ImageRequest):
    prompt = data.prompt.strip()

    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    payload = {
        "inputs": prompt,
        "options": {
            "wait_for_model": True,
            "use_cache": False
        }
    }

    try:
        response = requests.post(
            HF_API_URL,
            headers=HEADERS,
            json=payload,
            timeout=90
        )

        if response.status_code != 200:
            try:
                err = response.json()
                message = err.get("error", "Image generation failed")
            except Exception:
                message = response.text

            raise HTTPException(status_code=response.status_code, detail=message)

        return StreamingResponse(
            io.BytesIO(response.content),
            media_type="image/png"
        )

    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Image generation timed out")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
