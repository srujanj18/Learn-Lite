# Load model directly
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

tokenizer = AutoTokenizer.from_pretrained("google/long-t5-tglobal-base")
model = AutoModelForSeq2SeqLM.from_pretrained("google/long-t5-tglobal-base")