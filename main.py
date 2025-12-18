import asyncio
import re
import string
import io
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from summarize import groq_query, groq_chat
import PyPDF2
from image_generation import router as image_router

app = FastAPI()

# ---------------- GLOBAL DOCUMENT MEMORY ----------------
LATEST_DOCUMENT_TEXT: Optional[str] = None

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- CONFIG ----------------
MAX_CHARS_PER_CHUNK = 900
CHUNK_OVERLAP = 150
MAX_DOC_CHARS = 10000

# ---------------- UTILS ----------------
def chunk_text(text: str, max_chars: int = MAX_CHARS_PER_CHUNK, overlap: int = CHUNK_OVERLAP):
    if len(text) <= max_chars:
        return [text]
    chunks, start = [], 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        chunks.append(text[start:end])
        if end >= len(text):
            break
        start = end - overlap
    return chunks


def extract_summary_text(summary):
    if isinstance(summary, dict) and 'error' in summary:
        raise HTTPException(status_code=400, detail=summary['error'])
    if isinstance(summary, list) and summary:
        return summary[0]['summary_text']
    raise HTTPException(status_code=500, detail="Invalid summary format")


def normalize_text(raw: str) -> str:
    cleaned = ''.join(ch for ch in raw if ch in string.printable)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned


def extract_text_from_pdf(file: UploadFile):
    reader = PyPDF2.PdfReader(io.BytesIO(file.file.read()))
    return ' '.join(page.extract_text() or '' for page in reader.pages)


# ---------------- API ----------------
@app.post('/analyze')
async def analyze_document(content: str = Form(None), file: UploadFile = File(None)):
    global LATEST_DOCUMENT_TEXT

    if content and file:
        raise HTTPException(status_code=400, detail="Provide either content or file")

    if file:
        if file.content_type != 'application/pdf':
            raise HTTPException(status_code=400, detail="Only PDF supported")
        text = extract_text_from_pdf(file)
    elif content:
        text = content
    else:
        raise HTTPException(status_code=400, detail="No input provided")

    text = normalize_text(text)[:MAX_DOC_CHARS]
    LATEST_DOCUMENT_TEXT = text  # store document for chat

    chunks = chunk_text(text)
    responses = await asyncio.gather(*[
        asyncio.to_thread(groq_query, {"inputs": c}) for c in chunks
    ])
    summaries = [extract_summary_text(r) for r in responses]

    final_resp = groq_query({"inputs": " ".join(summaries)})
    final_summary = extract_summary_text(final_resp)

    return {"summary": final_summary, "content": text}


@app.post('/chat')
async def chat(question: str = Form(...)):
    if not question.strip():
        raise HTTPException(status_code=400, detail="Question is empty")

    if LATEST_DOCUMENT_TEXT:
        prompt = f"""
Answer the question using ONLY the document below.

Structure your response with headings and short paragraphs.

DOCUMENT:
{LATEST_DOCUMENT_TEXT[:7000]}

QUESTION:
{question}
"""
    else:
        prompt = f"""
Answer the following question in a well-structured manner.

QUESTION:
{question}
"""

    return {"answer": groq_chat(prompt)}

app.include_router(image_router)