import asyncio
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from summarize import query
import PyPDF2
import io

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

MAX_CHARS_PER_CHUNK = 900  # keep input under HF model limits
CHUNK_OVERLAP = 120  # overlap to avoid cutting sentences abruptly
MAX_DOC_CHARS = 10000  # soft cap to keep latency low on very large files
HF_MAX_LENGTH = 180
HF_MIN_LENGTH = 60


def chunk_text(text: str, max_chars: int = MAX_CHARS_PER_CHUNK, overlap: int = CHUNK_OVERLAP):
    """Split text into slightly overlapping chunks to avoid tokenizer index errors on long docs."""
    if len(text) <= max_chars:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        chunks.append(text[start:end])
        if end >= len(text):
            break
        start = end - overlap  # step back a bit to preserve context between chunks
    return chunks


def extract_summary_text(summary):
    """Normalize the HF response into a plain summary string."""
    if isinstance(summary, dict) and 'error' in summary:
        raise HTTPException(status_code=400, detail=summary['error'])

    if isinstance(summary, list):
        if not summary:
            raise HTTPException(status_code=500, detail="Model returned empty response")
        if "summary_text" in summary[0]:
            return summary[0]["summary_text"]
        raise HTTPException(status_code=500, detail="Unexpected response format from model")

    if isinstance(summary, dict) and "summary_text" in summary:
        return summary["summary_text"]

    raise HTTPException(status_code=500, detail="Failed to get summary from model")


def extract_text_from_pdf(file: UploadFile):
    text = ""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.file.read()))
        for page_num in range(len(pdf_reader.pages)):
            text += pdf_reader.pages[page_num].extract_text()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF file: {e}")
    return text

@app.post("/analyze")
async def analyze_document(
    content: str = Form(None),
    file: UploadFile = File(None)
):
    if content and file:
        raise HTTPException(status_code=400, detail="Provide either text content or a file, not both.")

    text_to_summarize = ""
    if file:
        if file.content_type == 'application/pdf':
            text_to_summarize = extract_text_from_pdf(file)
        elif file.content_type == 'text/plain':
            text_to_summarize = (await file.read()).decode("utf-8")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a PDF or a plain text file.")
    elif content:
        text_to_summarize = content
    else:
        raise HTTPException(status_code=400, detail="No content or file provided.")

    if not text_to_summarize.strip():
        raise HTTPException(status_code=400, detail="The provided document is empty or contains no text.")

    # Truncate extremely long inputs to keep response time reasonable
    if len(text_to_summarize) > MAX_DOC_CHARS:
        text_to_summarize = text_to_summarize[:MAX_DOC_CHARS]

    try:
        chunks = chunk_text(text_to_summarize)
        payloads = [
            {
                "inputs": chunk,
                "parameters": {
                    "max_length": HF_MAX_LENGTH,
                    "min_length": HF_MIN_LENGTH,
                    "do_sample": False,
                },
            }
            for chunk in chunks
        ]

        # Run HF requests in parallel threads to reduce end-to-end latency
        responses = await asyncio.gather(
            *[asyncio.to_thread(query, payload) for payload in payloads],
            return_exceptions=False,
        )

        chunk_summaries = []
        for idx, summary_resp in enumerate(responses):
            print(f"Summary response chunk {idx + 1}/{len(responses)} (len {len(chunks[idx])}): {summary_resp}")  # Debug logging
            chunk_summaries.append(extract_summary_text(summary_resp))

        combined_summary = " ".join(chunk_summaries)
        return { "summary": combined_summary }

    except Exception as e:
        print(f"Error processing summary: {str(e)}")  # Debug logging
        raise HTTPException(status_code=500, detail=f"Error processing summary: {str(e)}")
