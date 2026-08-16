# Adaptive Customer Intelligence Upgrade

This upgrade converts the original Telco-only churn application into a project-scoped adaptive analytics platform. A Telco dataset remains a compatible binary-classification input, but it is no longer hardcoded into the running API or user interface.

## Start the Services

Install the Python dependencies and run the API from the repository root.

```bash
python -m pip install -r requirements.txt
uvicorn src.api.main:app --reload --port 8000
```

Start the Next.js frontend in a second terminal.

```bash
cd frontend
pnpm install
NEXT_PUBLIC_API_URL=http://localhost:8000/api pnpm dev
```

## Adaptive Workflow

Create a project in **Datasets**, upload a UTF-8 or Latin-1 CSV, inspect the generated profile, and confirm the target column. Training then creates an isolated model artifact containing the exact preprocessing pipeline, raw feature contract, identifier rule, target metadata, model metrics, and production threshold.

Use **Adaptive Predictions** with an identifier from the uploaded dataset. It reads the stored record, applies the saved model pipeline, returns the model-specific threshold, and can run a forensic audit. The backend also provides local and global SHAP endpoints, plus recommendations that cite model probability, threshold, SHAP drivers, and detected data semantics.

## Core API Prefix

All upgraded operations use `/api/adaptive`.

| Operation | Endpoint |
|---|---|
| Projects | `GET` / `POST` `/api/adaptive/projects` |
| Upload dataset | `POST /api/adaptive/projects/{projectId}/datasets` |
| Confirm target | `POST /api/adaptive/projects/{projectId}/datasets/{datasetId}/target` |
| Train | `POST /api/adaptive/projects/{projectId}/datasets/{datasetId}/train` |
| Customers | `GET /api/adaptive/projects/{projectId}/datasets/{datasetId}/customers` |
| Predict | `POST /api/adaptive/projects/{projectId}/datasets/{datasetId}/predict` |
| Explain | `GET/POST /api/adaptive/projects/{projectId}/datasets/{datasetId}/explain/...` |
| Recommend | `POST /api/adaptive/projects/{projectId}/datasets/{datasetId}/recommend` |
| Audit | `POST /api/adaptive/projects/{projectId}/datasets/{datasetId}/audit` |

## Validation

The upgrade includes backend tests that use a generic non-Telco schema to verify profiling, target confirmation, training, thresholded prediction, SHAP computation, recommendation traceability, audit checks, and the mounted FastAPI routes. The Next.js frontend passes TypeScript validation and a production build.

> No original Telco artifact or dataset was committed to the repository. Historical LightGBM scores should be reproduced only after the original dataset and artifact are supplied or a retraining run is completed.
