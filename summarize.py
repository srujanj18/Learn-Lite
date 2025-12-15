import os
import requests
from dotenv import load_dotenv

load_dotenv(dotenv_path='.env.local')

API_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn"
HEADERS = {
    "Authorization": f"Bearer {os.environ.get('NEXT_PUBLIC_HUGGINGFACE_API_KEY', '')}",
}

def query(payload):
    """
    Call Hugging Face Inference API for summarization.
    payload: {"inputs": "<text>", "parameters": {...}} (parameters optional)
    """
    text = payload.get("inputs", "")
    if not text:
        return {"error": "No input provided"}

    try:
        response = requests.post(API_URL, headers=HEADERS, json=payload, timeout=60)
    except Exception as e:
        return {"error": f"HF request failed: {e}"}

    if response.status_code != 200:
        return {"error": f"HF error {response.status_code}: {response.text}"}

    if not response.text.strip():
        return {"error": "Empty response from model"}

    try:
        return response.json()
    except Exception as e:
        return {"error": f"Failed to parse HF response: {e}"}