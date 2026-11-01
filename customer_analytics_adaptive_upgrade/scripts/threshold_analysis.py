import json
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split


PROJECT_ROOT = Path(__file__).resolve().parents[1]

PROCESSED_DATA_PATH = (
    PROJECT_ROOT / "data" / "processed" / "cleaned_churn_data.csv"
)
MODEL_PATH = PROJECT_ROOT / "saved_models" / "lgb_model.pkl"
OUTPUT_PATH = PROJECT_ROOT / "saved_models" / "threshold_analysis.json"


def run_threshold_analysis() -> None:
    print("--- CHURN PREDICTION THRESHOLD ANALYSIS ---\n")

    if not PROCESSED_DATA_PATH.exists():
        raise FileNotFoundError(
            f"Processed dataset not found: {PROCESSED_DATA_PATH}"
        )

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Trained model not found: {MODEL_PATH}. "
            "Run python -m src.models.train_lightgbm first."
        )

    # Load the same processed data used by train_lightgbm.py.
    df = pd.read_csv(PROCESSED_DATA_PATH)

    if "Churn" not in df.columns:
        raise ValueError(
            "The processed dataset must contain a 'Churn' target column."
        )

    X = df.drop(columns=["Churn"])
    y = df["Churn"].astype(int)

    # Match the split used in train_lightgbm.py.
    _, X_test, _, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
    )

    with MODEL_PATH.open("rb") as model_file:
        model = pickle.load(model_file)

    probabilities = model.predict_proba(X_test)[:, 1]

    print(f"Test rows: {len(y_test)}")
    print(f"Positive test rows: {int(y_test.sum())}")
    print(f"ROC-AUC: {roc_auc_score(y_test, probabilities):.4f}")
    print(
        f"PR-AUC:  {average_precision_score(y_test, probabilities):.4f}"
    )
    print(f"Min probability:  {probabilities.min():.4f}")
    print(f"Max probability:  {probabilities.max():.4f}")
    print(f"Mean probability: {probabilities.mean():.4f}\n")

    print(
        f"{'Thresh':<8} | {'Acc':<8} | {'Prec':<8} | "
        f"{'Recall':<8} | {'F1':<8} | {'Spec':<8} | "
        f"{'FPR':<8} | {'FNR':<8} | {'TN':<5} | "
        f"{'FP':<5} | {'FN':<5} | {'TP':<5}"
    )
    print("-" * 115)

    thresholds = np.array([
    0.10,
    0.15,
    0.20,
    0.25,
    0.30,
    0.32,
    0.35,
    0.40,
    0.45,
    0.50,
    0.55,
    0.60,
    0.65,
    0.70,
    0.75,
    0.80,
    0.85,
    0.90,
])

    results = []

    for threshold in thresholds:
        predictions = (probabilities >= threshold).astype(int)

        tn, fp, fn, tp = confusion_matrix(
            y_test,
            predictions,
            labels=[0, 1],
        ).ravel()

        accuracy = accuracy_score(y_test, predictions)
        precision = precision_score(
            y_test,
            predictions,
            zero_division=0,
        )
        recall = recall_score(
            y_test,
            predictions,
            zero_division=0,
        )
        f1 = f1_score(
            y_test,
            predictions,
            zero_division=0,
        )

        specificity = (
            tn / (tn + fp)
            if (tn + fp) > 0
            else 0.0
        )
        false_positive_rate = (
            fp / (fp + tn)
            if (fp + tn) > 0
            else 0.0
        )
        false_negative_rate = (
            fn / (fn + tp)
            if (fn + tp) > 0
            else 0.0
        )

        result = {
            "threshold": round(float(threshold), 2),
            "accuracy": round(float(accuracy), 4),
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "f1": round(float(f1), 4),
            "specificity": round(float(specificity), 4),
            "fpr": round(float(false_positive_rate), 4),
            "fnr": round(float(false_negative_rate), 4),
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
        }

        results.append(result)

        print(
            f"{threshold:<8.2f} | "
            f"{accuracy:<8.4f} | "
            f"{precision:<8.4f} | "
            f"{recall:<8.4f} | "
            f"{f1:<8.4f} | "
            f"{specificity:<8.4f} | "
            f"{false_positive_rate:<8.4f} | "
            f"{false_negative_rate:<8.4f} | "
            f"{tn:<5} | {fp:<5} | {fn:<5} | {tp:<5}"
        )

    best_f1 = max(results, key=lambda item: item["f1"])
    best_recall = max(results, key=lambda item: item["recall"])

    output = {
        "model": str(MODEL_PATH),
        "dataset": str(PROCESSED_DATA_PATH),
        "roc_auc": round(
            float(roc_auc_score(y_test, probabilities)),
            4,
        ),
        "pr_auc": round(
            float(average_precision_score(y_test, probabilities)),
            4,
        ),
        "best_f1_threshold": best_f1,
        "best_recall_threshold": best_recall,
        "thresholds": results,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT_PATH.open("w", encoding="utf-8") as output_file:
        json.dump(output, output_file, indent=4)

    print(f"\nAnalysis saved to: {OUTPUT_PATH}")
    print(
        f"Best F1 threshold: {best_f1['threshold']} "
        f"(F1={best_f1['f1']:.4f})"
    )
    print(
        f"Best recall threshold: {best_recall['threshold']} "
        f"(Recall={best_recall['recall']:.4f})"
    )


if __name__ == "__main__":
    run_threshold_analysis()
