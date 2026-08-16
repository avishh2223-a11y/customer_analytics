# Adaptive Profiling and Upgrade Checklist

## How Dataset Profiling Works

The upgraded backend no longer opens a fixed Telco CSV at runtime. A user creates a project and uploads a CSV into that project's isolated workspace. The upload path accepts only `.csv` files, rejects empty files and files larger than 15 MB, sanitizes the stored filename, tries UTF-8 with BOM first, and falls back to Latin-1. The CSV is parsed before metadata is persisted, and uploads with fewer than two columns or duplicate column names are rejected.

The profiler then inspects every column without assuming a predefined business schema. It records the row and column counts, duplicate rows, missing counts and rates, unique counts, inferred data type, sample values, semantic roles, constant-column warnings, high-cardinality warnings, identifier candidates, target candidates, and possible leakage candidates.

### Dynamic Schema Detection Rules

| Detection | Method | Runtime effect |
|---|---|---|
| Numeric column | At least 90% of non-null values can be coerced to numeric | The column can enter numeric imputation, scaling, and model features. |
| Date column | At least 90% of non-null values parse as dates using mixed-format parsing | The column is labelled as a date candidate and can be handled as a dataset-specific feature. |
| Categorical column | A column that is neither reliably numeric nor date-like | It enters categorical imputation and one-hot encoding. |
| Identifier | Name contains terms such as customer, account, client, member, subscriber, user, record, reference, or id, and uniqueness exceeds 65% | The first high-confidence identifier is excluded from training but used for customer lookup and prediction identity. |
| Target candidate | Two to twenty unique values plus target-like terms such as churn, outcome, target, label, status, cancel, attrition, retained, converted, or default | The backend suggests a target and its binary or multiclass shape, but never trains until the user confirms it. |
| Regression target | A confirmed numeric target has more than 20 unique values | The model workflow switches to regression and does not use a classification threshold. |
| Leakage candidate | Column names contain terms such as post, after, resolved, actual, or final | The column is surfaced for review instead of being silently trusted as a predictive feature. |
| Semantic role | Names are matched against role vocabularies for engagement, revenue/spend, subscription, support, and date signals | Recommendation rules adapt to the available business semantics. |

The target confirmation step is deliberately separate from detection. Profiling can suggest a target, but the user must explicitly confirm it. This prevents a similarly named identifier, post-outcome column, or descriptive field from being silently used as the label.

## What Happens After Profiling

Once the target is confirmed, the backend builds a dataset-specific contract. The contract stores the target column, problem type, excluded identifier, raw feature list, numeric and categorical feature lists, and the fitted preprocessing pipeline. Numeric features use median imputation and standard scaling. Categorical features use most-frequent imputation and one-hot encoding with unknown categories ignored. The fitted transformer is serialized inside the model artifact and reused for training, prediction, and SHAP.

For binary classification, the trained model stores its positive label, class labels, validation metrics, and production threshold in the model metadata. Predictions read that threshold from the selected model rather than from a global constant. Regression models return a numeric prediction and intentionally return no classification threshold.

SHAP local and global explanations use the saved model and the saved preprocessing pipeline. Explanation records are persisted under the selected project, dataset, and model. Recommendations are created from the real prediction probability, the stored threshold, SHAP drivers, and detected semantic roles; they do not fabricate retention-success rates.

## Upgrade Checklist

### Repository and architecture

- [x] Audited the original Next.js, FastAPI, LightGBM, SHAP, and Streamlit components.
- [x] Added `UPGRADE_PLAN.md` and `UPGRADE_README.md` to the repository.
- [x] Added an isolated project workspace under `workspace/projects/{project_id}`.
- [x] Preserved Telco churn as a compatible binary-classification use case without keeping it as a runtime dependency.

### Dataset and schema intelligence

- [x] Added project creation and project listing.
- [x] Added secure CSV upload and parsing validation.
- [x] Added UTF-8/Latin-1 decoding fallback.
- [x] Added duplicate-column, empty-dataset, size, and malformed-CSV validation.
- [x] Added column type inference, missingness, cardinality, duplicate-row, constant-column, and high-cardinality profiling.
- [x] Added identifier, target, semantic-role, and leakage-candidate detection.
- [x] Added explicit target confirmation before training.
- [x] Added automatic binary-classification, multiclass-classification, and regression problem typing.

### Machine-learning integrity

- [x] Added a canonical per-dataset preprocessing and feature contract.
- [x] Excluded inferred identifiers from training while retaining them for customer lookup.
- [x] Serialized preprocessing, target metadata, label metadata, raw features, and model metadata together.
- [x] Added model-specific production thresholds for binary classifiers.
- [x] Removed the active runtime's fixed `MODEL_THRESHOLD = 0.60` behavior.
- [x] Added real saved-model prediction and thresholded risk output.
- [x] Added regression support without classification thresholds.
- [x] Added model-bound local and global SHAP computation.
- [x] Added persisted prediction, explanation, recommendation, and audit records.

### API and frontend

- [x] Added the `/api/adaptive` FastAPI contract for projects, datasets, targets, training, customers, predictions, explanations, recommendations, and audits.
- [x] Replaced active mock analytics, recommendation, report, generator, and demo-auth flows.
- [x] Added adaptive Dataset Manager and prediction views.
- [x] Added dedicated API-driven Explainability and Recommendations pages.
- [x] Added error and empty states for data-dependent workflows.
- [x] Replaced static model-health claims with dataset-managed workspace status.
- [x] Added an environment-stable `NODE_ENV=production next build` script.

### Validation

- [x] Tested a generic binary-classification dataset.
- [x] Tested a second regression-shaped dataset with a different schema.
- [x] Tested FastAPI upload, target confirmation, training, prediction, explanation persistence, recommendation persistence, and audit routes.
- [x] Ran TypeScript validation.
- [x] Completed a production Next.js build.
- [x] Scanned active backend and frontend paths for the retired mock and Telco-only runtime markers.

### User actions still required

- [ ] Supply the original Telco dataset and any trusted saved artifacts if historical LightGBM metrics must be reproduced exactly.
- [ ] Deploy the FastAPI and Next.js services with a persistent workspace volume or replace file-backed storage with the user's preferred object storage and database before production use.
- [ ] Review and confirm the target column and leakage warnings for every new business dataset.
