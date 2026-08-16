from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from src.adaptive.platform import AdaptiveError, AdaptivePlatform

router = APIRouter(prefix="/api/adaptive", tags=["adaptive-customer-intelligence"])
platform = AdaptivePlatform()


class ProjectInput(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    description: str | None = Field(default=None, max_length=500)


class TargetInput(BaseModel):
    targetColumn: str = Field(min_length=1, max_length=200)


class CustomerInput(BaseModel):
    customerKey: str = Field(min_length=1, max_length=300)
    modelId: str | None = None


def operation(callable):
    try:
        return callable()
    except AdaptiveError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/projects")
def list_projects():
    return platform.list_projects()


@router.post("/projects")
def create_project(payload: ProjectInput):
    return operation(lambda: platform.create_project(payload.name, payload.description))


@router.post("/projects/{project_id}/datasets")
async def upload_dataset(project_id: str, file: UploadFile = File(...)):
    content = await file.read()
    return operation(lambda: platform.upload_dataset(project_id, file.filename or "dataset.csv", content))


@router.get("/projects/{project_id}/datasets/{dataset_id}")
def get_dataset(project_id: str, dataset_id: str):
    return operation(lambda: platform.get_dataset(project_id, dataset_id))


@router.post("/projects/{project_id}/datasets/{dataset_id}/target")
def confirm_target(project_id: str, dataset_id: str, payload: TargetInput):
    return operation(lambda: platform.confirm_target(project_id, dataset_id, payload.targetColumn))


@router.post("/projects/{project_id}/datasets/{dataset_id}/train")
def train(project_id: str, dataset_id: str):
    return operation(lambda: platform.train(project_id, dataset_id))


@router.get("/projects/{project_id}/datasets/{dataset_id}/customers")
def customers(project_id: str, dataset_id: str, search: str = Query(default="", max_length=200)):
    return operation(lambda: platform.list_customers(project_id, dataset_id, search))


@router.post("/projects/{project_id}/datasets/{dataset_id}/predict")
def predict(project_id: str, dataset_id: str, payload: CustomerInput):
    return operation(lambda: platform.predict(project_id, dataset_id, payload.customerKey, payload.modelId))


@router.post("/projects/{project_id}/datasets/{dataset_id}/explain/local")
def local_explain(project_id: str, dataset_id: str, payload: CustomerInput):
    return operation(lambda: platform.explain(project_id, dataset_id, payload.customerKey, payload.modelId))


@router.get("/projects/{project_id}/datasets/{dataset_id}/explain/global")
def global_explain(project_id: str, dataset_id: str, model_id: str | None = None):
    return operation(lambda: platform.explain(project_id, dataset_id, None, model_id))


@router.get("/projects/{project_id}/datasets/{dataset_id}/explanations")
def list_explanations(project_id: str, dataset_id: str):
    return operation(lambda: platform.list_records(project_id, "explanations", dataset_id))


@router.post("/projects/{project_id}/datasets/{dataset_id}/recommend")
def recommend(project_id: str, dataset_id: str, payload: CustomerInput):
    return operation(lambda: platform.recommend(project_id, dataset_id, payload.customerKey, payload.modelId))


@router.get("/projects/{project_id}/datasets/{dataset_id}/recommendations")
def list_recommendations(project_id: str, dataset_id: str):
    return operation(lambda: platform.list_records(project_id, "recommendations", dataset_id))


@router.post("/projects/{project_id}/datasets/{dataset_id}/audit")
def audit(project_id: str, dataset_id: str, model_id: str | None = None):
    return operation(lambda: platform.audit(project_id, dataset_id, model_id))
