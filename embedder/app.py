from fastapi import FastAPI, HTTPException
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel
from typing import List

app = FastAPI()
model = SentenceTransformer("all-MiniLM-L6-v2")

class TextsRequest(BaseModel):
    texts: List[str]

@app.post("/embed")
async def embed_texts(request: TextsRequest):
    if not request.texts or not all(isinstance(t, str) and t.strip() for t in request.texts):
        raise HTTPException(status_code=400, detail="Input must be a non-empty list of non-empty strings.")
    embeddings = model.encode(request.texts)
    return {"embeddings": embeddings.tolist()}