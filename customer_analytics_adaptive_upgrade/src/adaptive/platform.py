from __future__ import annotations

import json
import pickle
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, f1_score, mean_absolute_error, mean_squared_error, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from src.config import PROJECT_ROOT

WORKSPACE_ROOT = PROJECT_ROOT / "workspace"

ID_WORDS = ("customer", "account", "client", "member", "subscriber", "user", "record", "reference", "id")
TARGET_WORDS = ("churn", "outcome", "target", "label", "status", "cancel", "attrition", "retained", "converted", "default")
ROLE_WORDS = {
    "engagement": ("usage", "activity", "session", "visit", "event", "engage", "login", "interaction"),
    "revenue_or_spend": ("revenue", "spend", "charge", "price", "value", "payment", "amount", "bill"),
    "subscription": ("plan", "contract", "subscription", "renewal", "tenure", "term"),
    "support": ("support", "ticket", "complaint", "service", "issue"),
    "date": ("date", "time", "month", "year", "day"),
}


class AdaptiveError(ValueError):
    pass


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def safe_name(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", value).strip("_") or "dataset.csv"


class AdaptivePlatform:
    """File-backed project workspace; each dataset and model is explicitly isolated."""

    def __init__(self, root: Path = WORKSPACE_ROOT):
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def _project_dir(self, project_id: str) -> Path:
        path = self.root / "projects" / project_id
        if not path.exists():
            raise AdaptiveError("Project not found.")
        return path

    def _read_json(self, path: Path) -> dict[str, Any]:
        if not path.exists():
            raise AdaptiveError(f"Required metadata is unavailable: {path.name}")
        return json.loads(path.read_text(encoding="utf-8"))

    def _write_json(self, path: Path, payload: dict[str, Any]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")

    def create_project(self, name: str, description: str | None = None) -> dict[str, Any]:
        if len(name.strip()) < 3:
            raise AdaptiveError("Project names must contain at least three characters.")
        project_id = str(uuid.uuid4())
        directory = self.root / "projects" / project_id
        for child in ("datasets", "models", "runs", "audits", "explanations", "recommendations"):
            (directory / child).mkdir(parents=True, exist_ok=True)
        project = {"id": project_id, "name": name.strip(), "description": description or "", "createdAt": utc_now(), "updatedAt": utc_now()}
        self._write_json(directory / "project.json", project)
        return project

    def list_projects(self) -> list[dict[str, Any]]:
        projects_dir = self.root / "projects"
        if not projects_dir.exists():
            return []
        projects = []
        for item in projects_dir.iterdir():
            if item.is_dir() and (item / "project.json").exists():
                project = self._read_json(item / "project.json")
                datasets = list((item / "datasets").glob("*/dataset.json"))
                project["datasetCount"] = len(datasets)
                projects.append(project)
        return sorted(projects, key=lambda item: item["updatedAt"], reverse=True)

    def _dataset_dir(self, project_id: str, dataset_id: str) -> Path:
        path = self._project_dir(project_id) / "datasets" / dataset_id
        if not path.exists():
            raise AdaptiveError("Dataset not found for this project.")
        return path

    def _dataset_meta(self, project_id: str, dataset_id: str) -> dict[str, Any]:
        return self._read_json(self._dataset_dir(project_id, dataset_id) / "dataset.json")

    def _load_dataset(self, project_id: str, dataset_id: str) -> pd.DataFrame:
        meta = self._dataset_meta(project_id, dataset_id)
        path = self._dataset_dir(project_id, dataset_id) / meta["fileName"]
        try:
            return pd.read_csv(path, encoding="utf-8-sig")
        except UnicodeDecodeError:
            return pd.read_csv(path, encoding="latin-1")

    def upload_dataset(self, project_id: str, original_name: str, content: bytes) -> dict[str, Any]:
        if not original_name.lower().endswith(".csv"):
            raise AdaptiveError("Only CSV datasets are accepted.")
        if not content or len(content) > 15 * 1024 * 1024:
            raise AdaptiveError("CSV files must be non-empty and no larger than 15 MB.")
        dataset_id = str(uuid.uuid4())
        directory = self._project_dir(project_id) / "datasets" / dataset_id
        directory.mkdir(parents=True, exist_ok=True)
        file_name = safe_name(original_name)
        (directory / file_name).write_bytes(content)
        try:
            frame = self._load_csv(directory / file_name)
        except Exception as exc:
            (directory / file_name).unlink(missing_ok=True)
            raise AdaptiveError(f"The CSV could not be parsed safely: {exc}") from exc
        if frame.empty or len(frame.columns) < 2:
            raise AdaptiveError("A dataset requires at least one row and two columns.")
        frame.columns = [str(column).strip() for column in frame.columns]
        if len({column.lower() for column in frame.columns}) != len(frame.columns):
            raise AdaptiveError("CSV columns must be unique when case is ignored.")
        profile = self.profile_frame(frame)
        meta = {"id": dataset_id, "projectId": project_id, "fileName": file_name, "originalName": original_name, "uploadedAt": utc_now(), "rowCount": int(len(frame)), "columnCount": int(len(frame.columns)), "profile": profile, "target": None, "problemType": "descriptive"}
        self._write_json(directory / "dataset.json", meta)
        project_path = self._project_dir(project_id) / "project.json"
        project = self._read_json(project_path)
        project["updatedAt"] = utc_now()
        self._write_json(project_path, project)
        return meta

    @staticmethod
    def _load_csv(path: Path) -> pd.DataFrame:
        try:
            return pd.read_csv(path, encoding="utf-8-sig")
        except UnicodeDecodeError:
            return pd.read_csv(path, encoding="latin-1")

    @staticmethod
    def _role_for_column(name: str, series: pd.Series) -> list[str]:
        normalized = re.sub(r"[^a-z0-9]+", "_", name.lower())
        roles = [role for role, words in ROLE_WORDS.items() if any(word in normalized for word in words)]
        unique_ratio = series.nunique(dropna=True) / max(len(series), 1)
        if any(word in normalized for word in ID_WORDS) and unique_ratio > 0.65:
            roles.append("identifier")
        return roles

    def profile_frame(self, frame: pd.DataFrame) -> dict[str, Any]:
        columns = []
        identifiers = []
        targets = []
        leakages = []
        for name in frame.columns:
            series = frame[name]
            non_null = series.dropna()
            numeric = pd.to_numeric(non_null, errors="coerce").notna().mean() >= 0.9 if len(non_null) else False
            dates = pd.to_datetime(non_null, errors="coerce", format="mixed").notna().mean() >= 0.9 if len(non_null) else False
            inferred = "numeric" if numeric else "date" if dates else "categorical"
            roles = self._role_for_column(name, series)
            unique_count = int(series.nunique(dropna=True))
            unique_ratio = unique_count / max(len(frame), 1)
            normalized = re.sub(r"[^a-z0-9]+", "_", name.lower())
            warnings = []
            if unique_count <= 1:
                warnings.append("constant_column")
            if unique_ratio > 0.98 and "identifier" not in roles:
                warnings.append("high_cardinality")
            if any(word in normalized for word in ("post", "after", "resolved", "actual", "final")):
                leakages.append({"column": name, "reason": "Column name may describe an outcome known after the prediction decision."})
            column = {"name": name, "inferredType": inferred, "semanticRoles": roles, "missingCount": int(series.isna().sum()), "missingRate": round(float(series.isna().mean()), 6), "uniqueCount": unique_count, "sampleValues": [str(item) for item in non_null.astype(str).head(3).tolist()], "warnings": warnings}
            columns.append(column)
            if "identifier" in roles:
                identifiers.append({"column": name, "confidence": round(min(0.99, 0.7 + unique_ratio * 0.25), 3), "reason": "Name and high uniqueness indicate a record identifier."})
            cardinality_score = 0.9 if 2 <= unique_count <= 20 else 0.0
            name_score = 0.1 if any(word in normalized for word in TARGET_WORDS) else 0.0
            if cardinality_score + name_score >= 0.8 and "identifier" not in roles:
                kind = "binary" if unique_count == 2 else "multiclass"
                targets.append({"column": name, "confidence": round(min(0.99, cardinality_score + name_score), 3), "kind": kind, "values": [str(item) for item in non_null.astype(str).drop_duplicates().head(10).tolist()], "reason": "Cardinality and column semantics make this a possible supervised-learning outcome; user confirmation is required."})
        duplicate_rows = int(frame.duplicated().sum())
        return {"rowCount": int(len(frame)), "columnCount": int(len(frame.columns)), "duplicateRows": duplicate_rows, "columns": columns, "identifierCandidates": identifiers, "targetCandidates": targets, "leakageCandidates": leakages, "constantColumns": [column["name"] for column in columns if "constant_column" in column["warnings"]], "highCardinalityColumns": [column["name"] for column in columns if "high_cardinality" in column["warnings"]]}

    def get_dataset(self, project_id: str, dataset_id: str) -> dict[str, Any]:
        return self._dataset_meta(project_id, dataset_id)

    def confirm_target(self, project_id: str, dataset_id: str, target: str) -> dict[str, Any]:
        meta = self._dataset_meta(project_id, dataset_id)
        if target not in [column["name"] for column in meta["profile"]["columns"]]:
            raise AdaptiveError("The confirmed target is not present in this dataset.")
        column = next(item for item in meta["profile"]["columns"] if item["name"] == target)
        unique_count = column["uniqueCount"]
        if column["inferredType"] == "numeric" and unique_count > 20:
            problem_type = "regression"
        elif unique_count == 2:
            problem_type = "binary_classification"
        elif unique_count > 2:
            problem_type = "multiclass_classification"
        else:
            raise AdaptiveError("The target requires at least two observed values.")
        meta["target"] = target
        meta["problemType"] = problem_type
        meta["confirmedAt"] = utc_now()
        self._write_json(self._dataset_dir(project_id, dataset_id) / "dataset.json", meta)
        return meta

    def _build_pipeline(self, frame: pd.DataFrame, target: str, problem_type: str) -> tuple[Pipeline, list[str], dict[str, Any]]:
        profile = self.profile_frame(frame)
        identifier = profile["identifierCandidates"][0]["column"] if profile["identifierCandidates"] else None
        features = [column for column in frame.columns if column not in {target, identifier}]
        if not features:
            raise AdaptiveError("No valid features remain after excluding the confirmed target and identifier candidate.")
        feature_frame = frame[features].copy()
        numeric = [name for name in features if pd.to_numeric(feature_frame[name], errors="coerce").notna().mean() >= 0.9]
        categorical = [name for name in features if name not in numeric]
        numeric_pipe = Pipeline([("imputer", SimpleImputer(strategy="median")), ("scale", StandardScaler())])
        categorical_pipe = Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("encode", OneHotEncoder(handle_unknown="ignore"))])
        preprocessor = ColumnTransformer([("numeric", numeric_pipe, numeric), ("categorical", categorical_pipe, categorical)], remainder="drop")
        if problem_type == "regression":
            estimator = RandomForestRegressor(n_estimators=180, min_samples_leaf=2, random_state=42, n_jobs=-1)
        else:
            estimator = RandomForestClassifier(n_estimators=220, min_samples_leaf=2, class_weight="balanced", random_state=42, n_jobs=-1)
        pipeline = Pipeline([("preprocessor", preprocessor), ("model", estimator)])
        contract = {"rawFeatures": features, "numericFeatures": numeric, "categoricalFeatures": categorical, "identifierColumn": identifier, "targetColumn": target, "problemType": problem_type}
        return pipeline, features, contract

    @staticmethod
    def _binary_threshold(y_true: pd.Series, probabilities: np.ndarray) -> float:
        candidates = np.linspace(0.1, 0.9, 81)
        best = max(candidates, key=lambda threshold: f1_score(y_true, (probabilities >= threshold).astype(int), zero_division=0))
        return round(float(best), 4)

    def train(self, project_id: str, dataset_id: str) -> dict[str, Any]:
        meta = self._dataset_meta(project_id, dataset_id)
        target = meta.get("target")
        if not target:
            raise AdaptiveError("Confirm the target column before training.")
        frame = self._load_dataset(project_id, dataset_id)
        pipeline, features, contract = self._build_pipeline(frame, target, meta["problemType"])
        y = frame[target]
        if meta["problemType"] != "regression":
            labels = sorted([str(item) for item in y.dropna().unique().tolist()])
            y = y.astype(str)
            stratify = y if y.value_counts().min() >= 2 else None
        else:
            labels = []
            y = pd.to_numeric(y, errors="coerce")
            valid = y.notna()
            frame, y = frame.loc[valid], y.loc[valid]
            stratify = None
        X_train, X_test, y_train, y_test = train_test_split(frame[features], y, test_size=0.2, random_state=42, stratify=stratify)
        pipeline.fit(X_train, y_train)
        model_id = str(uuid.uuid4())
        if meta["problemType"] == "regression":
            predictions = pipeline.predict(X_test)
            metrics = {"mae": round(float(mean_absolute_error(y_test, predictions)), 6), "rmse": round(float(np.sqrt(mean_squared_error(y_test, predictions))), 6)}
            threshold = None
            positive_label = None
        else:
            probabilities_matrix = pipeline.predict_proba(X_test)
            classes = [str(item) for item in pipeline.named_steps["model"].classes_]
            positive_label = classes[-1]
            positive_index = classes.index(positive_label)
            binary = meta["problemType"] == "binary_classification"
            if binary:
                y_binary = (y_test.astype(str) == positive_label).astype(int)
                probabilities = probabilities_matrix[:, positive_index]
                threshold = self._binary_threshold(y_binary, probabilities)
                metrics = {"f1": round(float(f1_score(y_binary, probabilities >= threshold, zero_division=0)), 6), "prAuc": round(float(average_precision_score(y_binary, probabilities)), 6), "rocAuc": round(float(roc_auc_score(y_binary, probabilities)), 6), "threshold": threshold}
            else:
                predicted = pipeline.predict(X_test)
                threshold = None
                metrics = {"macroF1": round(float(f1_score(y_test, predicted, average="macro", zero_division=0)), 6)}
        directory = self._project_dir(project_id) / "models" / model_id
        directory.mkdir(parents=True, exist_ok=True)
        artifact = {"pipeline": pipeline, "contract": contract, "labels": labels, "positiveLabel": positive_label, "background": frame[features].sample(min(200, len(frame)), random_state=42)}
        with open(directory / "model.pkl", "wb") as handle:
            pickle.dump(artifact, handle)
        record = {"id": model_id, "projectId": project_id, "datasetId": dataset_id, "createdAt": utc_now(), "status": "ready", "algorithm": type(pipeline.named_steps["model"]).__name__, "problemType": meta["problemType"], "productionThreshold": threshold, "metrics": metrics, "contract": contract, "artifactPath": str((directory / "model.pkl").relative_to(self.root))}
        self._write_json(directory / "model.json", record)
        self._write_json(self._dataset_dir(project_id, dataset_id) / "active_model.json", {"modelId": model_id, "updatedAt": utc_now()})
        return record

    def _model(self, project_id: str, dataset_id: str, model_id: str | None = None) -> tuple[dict[str, Any], dict[str, Any]]:
        if not model_id:
            model_id = self._read_json(self._dataset_dir(project_id, dataset_id) / "active_model.json")["modelId"]
        directory = self._project_dir(project_id) / "models" / model_id
        record = self._read_json(directory / "model.json")
        if record["datasetId"] != dataset_id:
            raise AdaptiveError("This model does not belong to the selected dataset.")
        with open(directory / "model.pkl", "rb") as handle:
            artifact = pickle.load(handle)
        return record, artifact

    def list_customers(self, project_id: str, dataset_id: str, query: str = "", limit: int = 50) -> dict[str, Any]:
        meta = self._dataset_meta(project_id, dataset_id)
        frame = self._load_dataset(project_id, dataset_id)
        identifier = meta["profile"]["identifierCandidates"][0]["column"] if meta["profile"]["identifierCandidates"] else None
        if identifier:
            filtered = frame[frame[identifier].astype(str).str.contains(query, case=False, na=False)] if query else frame
            rows = [{"customerKey": str(row[identifier]), "record": {key: self._json_value(value) for key, value in row.to_dict().items()}} for _, row in filtered.head(limit).iterrows()]
        else:
            rows = [{"customerKey": str(index), "record": {key: self._json_value(value) for key, value in row.to_dict().items()}} for index, row in frame.head(limit).iterrows()]
        return {"identifierColumn": identifier, "customers": rows}

    @staticmethod
    def _json_value(value: Any) -> Any:
        return None if pd.isna(value) else value.item() if hasattr(value, "item") else value

    def _customer_record(self, project_id: str, dataset_id: str, customer_key: str) -> tuple[dict[str, Any], pd.DataFrame]:
        meta = self._dataset_meta(project_id, dataset_id)
        frame = self._load_dataset(project_id, dataset_id)
        identifiers = meta["profile"]["identifierCandidates"]
        if identifiers:
            identifier = identifiers[0]["column"]
            match = frame[frame[identifier].astype(str).str.strip() == customer_key.strip()]
        else:
            match = frame.loc[[int(customer_key)]] if customer_key.isdigit() and int(customer_key) in frame.index else frame.iloc[0:0]
        if match.empty:
            raise AdaptiveError("Customer record not found in the selected dataset.")
        return meta, match.iloc[[0]]

    def predict(self, project_id: str, dataset_id: str, customer_key: str, model_id: str | None = None) -> dict[str, Any]:
        meta, row = self._customer_record(project_id, dataset_id, customer_key)
        model_record, artifact = self._model(project_id, dataset_id, model_id)
        contract = artifact["contract"]
        pipeline = artifact["pipeline"]
        features = contract["rawFeatures"]
        if any(feature not in row.columns for feature in features):
            raise AdaptiveError("The stored model feature contract is incompatible with the selected customer record.")
        input_frame = row[features]
        if model_record["problemType"] == "regression":
            value = float(pipeline.predict(input_frame)[0])
            return {"customerKey": customer_key, "modelId": model_record["id"], "prediction": value, "threshold": None, "predictedClass": None, "risk": None, "record": {key: self._json_value(value) for key, value in row.iloc[0].to_dict().items()}}
        probabilities = pipeline.predict_proba(input_frame)[0]
        classes = [str(item) for item in pipeline.named_steps["model"].classes_]
        positive_label = artifact["positiveLabel"]
        probability = float(probabilities[classes.index(positive_label)])
        threshold = model_record["productionThreshold"]
        predicted_class = positive_label if threshold is not None and probability >= threshold else next(label for label in classes if label != positive_label)
        risk = "high" if threshold is not None and probability >= threshold else "monitor"
        payload = {"customerKey": customer_key, "modelId": model_record["id"], "probability": round(probability, 8), "threshold": threshold, "predictedClass": predicted_class, "risk": risk, "record": {key: self._json_value(value) for key, value in row.iloc[0].to_dict().items()}}
        run_path = self._project_dir(project_id) / "runs" / "predictions.jsonl"
        with run_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps({**payload, "generatedAt": utc_now()}, default=str) + "\n")
        return payload

    def explain(self, project_id: str, dataset_id: str, customer_key: str | None = None, model_id: str | None = None) -> dict[str, Any]:
        try:
            import shap
        except ImportError as exc:
            raise AdaptiveError("SHAP is unavailable in this runtime; explanations cannot be fabricated.") from exc
        model_record, artifact = self._model(project_id, dataset_id, model_id)
        if model_record["problemType"] == "regression":
            raise AdaptiveError("SHAP classification explanations are not configured for this regression model.")
        pipeline = artifact["pipeline"]
        preprocessor = pipeline.named_steps["preprocessor"]
        model = pipeline.named_steps["model"]
        background = artifact["background"]
        if customer_key:
            _, frame = self._customer_record(project_id, dataset_id, customer_key)
            raw = frame[artifact["contract"]["rawFeatures"]]
        else:
            raw = background
        transformed = preprocessor.transform(raw)
        feature_names = [str(name) for name in preprocessor.get_feature_names_out()]
        explainer = shap.TreeExplainer(model)
        values = explainer.shap_values(transformed)
        array = values[1] if isinstance(values, list) else values
        if getattr(array, "ndim", 0) == 3:
            array = array[:, :, 1]
        if customer_key:
            contributions = [{"feature": feature, "shapValue": round(float(value), 8)} for feature, value in zip(feature_names, np.asarray(array)[0])]
            contributions.sort(key=lambda item: abs(item["shapValue"]), reverse=True)
            result = {"id": str(uuid.uuid4()), "scope": "local", "projectId": project_id, "datasetId": dataset_id, "customerKey": customer_key, "modelId": model_record["id"], "contributions": contributions, "statement": "Computed from the saved model and canonical preprocessing pipeline.", "generatedAt": utc_now()}
            self._write_json(self._project_dir(project_id) / "explanations" / f"{result['id']}.json", result)
            return result
        importance = np.abs(np.asarray(array)).mean(axis=0)
        result = [{"feature": feature, "meanAbsoluteShap": round(float(value), 8)} for feature, value in zip(feature_names, importance)]
        payload = {"id": str(uuid.uuid4()), "scope": "global", "projectId": project_id, "datasetId": dataset_id, "modelId": model_record["id"], "features": sorted(result, key=lambda item: item["meanAbsoluteShap"], reverse=True), "generatedAt": utc_now()}
        self._write_json(self._project_dir(project_id) / "explanations" / f"{payload['id']}.json", payload)
        return payload

    def recommend(self, project_id: str, dataset_id: str, customer_key: str, model_id: str | None = None) -> dict[str, Any]:
        prediction = self.predict(project_id, dataset_id, customer_key, model_id)
        if prediction.get("probability") is None:
            raise AdaptiveError("Recommendations require a classification model with a real probability.")
        explanation = self.explain(project_id, dataset_id, customer_key, model_id)
        meta = self._dataset_meta(project_id, dataset_id)
        roles = {role for column in meta["profile"]["columns"] for role in column["semanticRoles"]}
        top_drivers = [item["feature"] for item in explanation["contributions"] if item["shapValue"] > 0][:2]
        if prediction["probability"] < prediction["threshold"]:
            rule, text = "monitor_below_threshold", "Monitor this customer rather than trigger an intervention."
        elif "engagement" in roles:
            rule, text = "reengagement_from_model_evidence", "Launch a measured re-engagement campaign with a clear response window."
        elif "revenue_or_spend" in roles:
            rule, text = "retention_review_from_value_signal", "Prioritize a value-aware retention review before extending an offer."
        elif "subscription" in roles:
            rule, text = "plan_review_from_subscription_signal", "Offer a subscription or commitment-plan review before the next renewal decision."
        else:
            rule, text = "targeted_retention_review", "Route the customer for a targeted retention review."
        reason = f"Probability {prediction['probability']:.4f} is evaluated against the production threshold {prediction['threshold']:.4f}. Leading positive SHAP drivers: {', '.join(top_drivers) or 'none available'}; detected semantic roles: {', '.join(sorted(roles)) or 'none'} ."
        payload = {"id": str(uuid.uuid4()), "projectId": project_id, "datasetId": dataset_id, "modelId": prediction["modelId"], "customerKey": customer_key, "prediction": prediction, "recommendation": {"ruleKey": rule, "recommendationText": text, "reason": reason, "drivers": top_drivers}, "generatedAt": utc_now()}
        self._write_json(self._project_dir(project_id) / "recommendations" / f"{payload['id']}.json", payload)
        return payload

    def list_records(self, project_id: str, kind: str, dataset_id: str, limit: int = 25) -> list[dict[str, Any]]:
        if kind not in {"explanations", "recommendations"}:
            raise AdaptiveError("Unsupported record type.")
        directory = self._project_dir(project_id) / kind
        records = []
        for path in directory.glob("*.json"):
            record = self._read_json(path)
            if record.get("datasetId") == dataset_id:
                records.append(record)
        return sorted(records, key=lambda item: item.get("generatedAt", ""), reverse=True)[:limit]

    def audit(self, project_id: str, dataset_id: str, model_id: str | None = None) -> dict[str, Any]:
        record, artifact = self._model(project_id, dataset_id, model_id)
        meta = self._dataset_meta(project_id, dataset_id)
        frame = self._load_dataset(project_id, dataset_id)
        contract = artifact["contract"]
        checks = [
            {"key": "artifact_exists", "status": "pass", "detail": "Serialized pipeline artifact and metadata were loaded."},
            {"key": "dataset_binding", "status": "pass" if record["datasetId"] == dataset_id else "fail", "detail": "Model metadata is bound to the selected dataset."},
            {"key": "feature_contract", "status": "pass" if set(contract["rawFeatures"]).issubset(frame.columns) else "fail", "detail": "All model raw features are present in the selected dataset."},
            {"key": "threshold_contract", "status": "pass" if record["problemType"] != "binary_classification" or record["productionThreshold"] is not None else "fail", "detail": "Binary classifiers must persist a production threshold within model metadata."},
            {"key": "target_confirmation", "status": "pass" if meta.get("target") == contract["targetColumn"] else "fail", "detail": "Persisted target matches the model feature contract."},
        ]
        status = "fail" if any(check["status"] == "fail" for check in checks) else "pass"
        audit = {"id": str(uuid.uuid4()), "projectId": project_id, "datasetId": dataset_id, "modelId": record["id"], "status": status, "checks": checks, "generatedAt": utc_now()}
        self._write_json(self._project_dir(project_id) / "audits" / f"{audit['id']}.json", audit)
        return audit
