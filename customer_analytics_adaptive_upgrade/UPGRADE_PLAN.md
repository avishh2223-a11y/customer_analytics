# Full Adaptive Upgrade Plan

## Preserve

The current Next.js navigation model, FastAPI service boundary, customer-churn use case, LightGBM-era reports, and SHAP intent will be preserved where they remain compatible with genuine, dataset-bound behavior.

## Replace

| Existing component | Upgrade |
|---|---|
| Fixed `Telco-Customer-Churn.csv` reads | Project-scoped uploaded datasets stored in an isolated registry. |
| Global `MODEL_THRESHOLD` | Model-version metadata containing a validation-selected production threshold. |
| Label-encoder-only bundle | Persisted pipeline, schema contract, target/label metadata, feature roles, metrics, and explanation background. |
| Mock frontend services | API calls with loading, empty, and error states; no substituted values. |
| Telco-only UI copy and fields | Profile-driven data explorer, target confirmation, customer ID detection, and semantic recommendations. |
| Canned recommendation success rates | Traceable action rules based on real probability, threshold, SHAP drivers, and inferred business semantics. |

## New Runtime Flow

1. A user creates a project and uploads a CSV.
2. The API profiles column types, missingness, duplicates, identifier candidates, semantic roles, and target candidates.
3. A user confirms the target before training.
4. The backend trains and persists an isolated pipeline plus model contract.
5. Prediction, SHAP explanation, recommendation, dashboard analytics, and audit endpoints all reload the same persisted contract.
6. The frontend renders only returned results and explicitly displays unavailable, loading, and error states.

## Compatibility Policy

The original Telco schema remains a supported binary classification dataset. It is no longer a hard requirement or a runtime default.
