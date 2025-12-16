import os
from groq import Groq

# ---------------- GROQ CONFIG ----------------
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY environment variable not set")

client = Groq(api_key=api_key)

# ---------------- SUMMARIZATION ----------------
def groq_query(payload):
    text = payload.get("inputs", "").strip()
    if not text:
        return {"error": "No input text provided"}

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{
                "role": "user",
                "content": f"""
You are an expert academic summarizer.

Summarize the following text clearly and concisely.
- Preserve all key points
- Group related ideas logically
- Use complete sentences
- Do NOT add new information

Text:
{text}
"""
            }],
            temperature=0.2,
            max_tokens=512
        )

        return [{"summary_text": completion.choices[0].message.content.strip()}]

    except Exception as e:
        return {"error": f"Groq API error: {e}"}


# ---------------- WELL-STRUCTURED CHAT ----------------
def groq_chat(prompt: str) -> str:
    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant. "
                        "Always respond in a WELL-STRUCTURED manner.\n\n"
                        "Rules:\n"
                        "1. Use clear section headings.\n"
                        "2. Use short, readable paragraphs.\n"
                        "3. Keep language simple and professional.\n"
                        "4. Do not use emojis or symbols.\n"
                        "5. End with a short conclusion when relevant."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=400
        )

        answer = completion.choices[0].message.content
        return answer.encode("utf-8", errors="ignore").decode("utf-8").strip()

    except Exception as e:
        return f"Chat failed: {e}"
