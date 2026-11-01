from __future__ import annotations

import logging
import os

from fastapi import FastAPI, File, HTTPException, Query, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from src.adaptive.platform import AdaptiveError, AdaptivePlatform



logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Configure allowed frontend origins with a comma-separated environment variable.
# Example:
# FRONTEND_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]


app = FastAPI(
    title="Customer Analytics Adaptive Upgrade API",
    version="1.0.0",
    docs_url="/docs",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


platform = AdaptivePlatform()


class CreateProjectRequest(BaseModel):
    name: str = Field(..., min_length=1)
    description: str | None = None


class ConfirmTargetRequest(BaseModel):
    target: str = Field(..., min_length=1)


class LegacyConfirmTargetRequest(BaseModel):
    targetColumn: str = Field(..., min_length=1)


class PredictRequest(BaseModel):
    customerKey: str = Field(..., min_length=1)
    modelId: str | None = None


class ExplainRequest(BaseModel):
    customerKey: str | None = None
    modelId: str | None = None


class AuditRequest(BaseModel):
    modelId: str | None = None


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Return a consistent response for invalid request data."""
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "path": str(request.url.path),
        },
    )


@app.exception_handler(Exception)
async def unexpected_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    """Prevent internal exceptions from leaking implementation details."""
    logger.exception(
        "Unhandled exception for %s %s",
        request.method,
        request.url.path,
        exc_info=exc,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error."},
    )


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/adaptive/projects")
def list_projects():
    return platform.list_projects()


@app.post("/api/adaptive/projects")
def create_project(body: CreateProjectRequest):
    try:
        return platform.create_project(body.name, body.description)
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/adaptive/projects/{project_id}")
def get_project(project_id: str):
    try:
        return platform.get_project(project_id)
    except AdaptiveError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/api/adaptive/projects/{project_id}/latest-dataset")
def get_latest_dataset(project_id: str):
    try:
        data = platform.get_latest_dataset(project_id)
        if not data:
            raise HTTPException(
                status_code=404,
                detail="No dataset found for this project.",
            )
        return data
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/adaptive/projects/{project_id}/datasets")
async def upload_dataset(
    project_id: str,
    file: UploadFile = File(...),
):
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        return platform.upload_dataset(
            project_id,
            file.filename or "data.csv",
            content,
        )
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/adaptive/projects/{project_id}/datasets/{dataset_id}")
def get_dataset(project_id: str, dataset_id: str):
    try:
        return platform.get_dataset(project_id, dataset_id)
    except AdaptiveError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post(
    "/api/adaptive/projects/{project_id}/datasets/{dataset_id}/confirm-target"
)
def confirm_target(
    project_id: str,
    dataset_id: str,
    body: ConfirmTargetRequest,
):
    try:
        return platform.confirm_target(project_id, dataset_id, body.target)
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/adaptive/projects/{project_id}/datasets/{dataset_id}/target")
def confirm_target_legacy(
    project_id: str,
    dataset_id: str,
    body: LegacyConfirmTargetRequest,
):
    """Compatibility route for older frontend clients and tests."""
    try:
        return platform.confirm_target(project_id, dataset_id, body.targetColumn)
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/adaptive/projects/{project_id}/datasets/{dataset_id}/train")
def train_model(project_id: str, dataset_id: str):
    try:
        return platform.train(project_id, dataset_id)
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/adaptive/projects/{project_id}/datasets/{dataset_id}/customers")
def list_customers(
    project_id: str,
    dataset_id: str,
    query: str = Query("", alias="q"),
    limit: int = Query(50, ge=1, le=200),
):
    try:
        return platform.list_customers(
            project_id,
            dataset_id,
            query=query,
            limit=limit,
        )
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/adaptive/projects/{project_id}/datasets/{dataset_id}/predict")
def predict_record(
    project_id: str,
    dataset_id: str,
    body: PredictRequest,
):
    try:
        return platform.predict(
            project_id=project_id,
            dataset_id=dataset_id,
            customer_key=body.customerKey,
            model_id=body.modelId,
        )
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/adaptive/projects/{project_id}/datasets/{dataset_id}/risk-summary")
def get_risk_summary(
    project_id: str,
    dataset_id: str,
    model_id: str | None = None,
    refresh: bool = Query(False),
):
    try:
        return platform.risk_summary(
            project_id=project_id,
            dataset_id=dataset_id,
            model_id=model_id,
            force_refresh=refresh,
        )
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/adaptive/projects/{project_id}/datasets/{dataset_id}/explain")
def explain_record(
    project_id: str,
    dataset_id: str,
    body: ExplainRequest,
):
    try:
        return platform.explain(
            project_id=project_id,
            dataset_id=dataset_id,
            customer_key=body.customerKey,
            model_id=body.modelId,
        )
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post(
    "/api/adaptive/projects/{project_id}/datasets/{dataset_id}/explain/local"
)
def explain_local_record(
    project_id: str,
    dataset_id: str,
    body: ExplainRequest,
):
    try:
        if not body.customerKey:
            raise HTTPException(
                status_code=422,
                detail="customerKey is required for a local explanation.",
            )
        return platform.explain(
            project_id,
            dataset_id,
            body.customerKey,
            body.modelId,
        )
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get(
    "/api/adaptive/projects/{project_id}/datasets/{dataset_id}/explain/global"
)
def explain_global_record(
    project_id: str,
    dataset_id: str,
    model_id: str | None = None,
):
    try:
        return platform.explain(project_id, dataset_id, None, model_id)
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get(
    "/api/adaptive/projects/{project_id}/datasets/{dataset_id}/explanations"
)
def list_explanations(project_id: str, dataset_id: str):
    try:
        return platform.list_records(project_id, "explanations", dataset_id)
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/adaptive/projects/{project_id}/datasets/{dataset_id}/recommend")
def recommend_record(
    project_id: str,
    dataset_id: str,
    body: PredictRequest,
):
    try:
        return platform.recommend(
            project_id,
            dataset_id,
            body.customerKey,
            body.modelId,
        )
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get(
    "/api/adaptive/projects/{project_id}/datasets/{dataset_id}/recommendations"
)
def list_recommendations(project_id: str, dataset_id: str):
    try:
        return platform.list_records(project_id, "recommendations", dataset_id)
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/adaptive/projects/{project_id}/datasets/{dataset_id}/audit")
def audit_model(
    project_id: str,
    dataset_id: str,
    body: AuditRequest | None = None,
):
    try:
        return platform.audit(
            project_id,
            dataset_id,
            body.modelId if body else None,
        )
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
