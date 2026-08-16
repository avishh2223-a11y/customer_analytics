from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from src.api.adaptive import platform, router as adaptive_router

app = FastAPI(
    title="Adaptive Customer Intelligence API",
    version="2.0.0",
    description="Project-scoped dataset ingestion, model training, prediction, SHAP evidence, recommendations, and audit operations.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(adaptive_router)


@app.get("/health")
def health_check():
    return {"status": "online", "service": "adaptive-customer-intelligence", "projectCount": len(platform.list_projects())}


if __name__ == "__main__":
    uvicorn.run("src.api.main:app", host="127.0.0.1", port=8000, reload=True)
