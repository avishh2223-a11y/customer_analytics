import json
import os
import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, log_loss, brier_score_loss,
    confusion_matrix
)
import warnings
warnings.filterwarnings('ignore')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.services.prediction_service import PredictionService

def run_forensic_audit():
    print("Starting ML Forensic Audit...")
    
    MODEL_THRESHOLD = 0.60  # Centralized Champion Threshold
    
    csv_path = "data/raw/Telco-Customer-Churn.csv"
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")
        
    df = pd.read_csv(csv_path)
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce').fillna(0.0)
    df['MonthlyCharges'] = pd.to_numeric(df['MonthlyCharges'], errors='coerce').fillna(0.0)
    df['tenure'] = pd.to_numeric(df['tenure'], errors='coerce').fillna(0)
    
    X = df.drop(['customerID', 'Churn'], axis=1, errors='ignore')
    y = (df['Churn'] == 'Yes').astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    pred_service = PredictionService()
    
    y_prob = []
    test_records = X_test.to_dict(orient='records')
    for record in test_records:
        _, prob, _ = pred_service.predict(record)
        y_prob.append(prob)
        
    y_prob = np.array(y_prob)
    y_pred = (y_prob >= MODEL_THRESHOLD).astype(int)
    
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    metrics = {
        "model_name": "LightGBM",
        "dataset": "Telco Customer Churn",
        "validation_method": "80/20 stratified holdout",
        "random_state": 42,
        "dataset_rows": len(df),
        "test_samples": len(X_test),
        "selected_threshold": MODEL_THRESHOLD,
        "threshold_selection_basis": "highest tested churn F1",
        "threshold_dependent_metrics": {
            "accuracy": round(accuracy_score(y_test, y_pred) * 100, 2),
            "precision_churn": round(precision_score(y_test, y_pred, zero_division=0) * 100, 2),
            "recall_churn": round(recall_score(y_test, y_pred) * 100, 2),
            "f1_churn": round(f1_score(y_test, y_pred) * 100, 2),
            "f1_macro": round(f1_score(y_test, y_pred, average='macro') * 100, 2),
            "f1_weighted": round(f1_score(y_test, y_pred, average='weighted') * 100, 2),
            "specificity": round((tn / (tn + fp)) * 100, 2) if (tn+fp) > 0 else 0,
            "sensitivity": round((tp / (tp + fn)) * 100, 2) if (tp+fn) > 0 else 0,
            "confusion_matrix": {"TN": int(tn), "FP": int(fp), "FN": int(fn), "TP": int(tp)}
        },
        "threshold_independent_metrics": {
            "roc_auc": round(roc_auc_score(y_test, y_prob), 4),
            "pr_auc": round(average_precision_score(y_test, y_prob), 4),
            "log_loss": round(log_loss(y_test, y_prob), 4),
            "brier_score": round(brier_score_loss(y_test, y_prob), 4)
        }
    }
    
    os.makedirs("saved_models", exist_ok=True)
    with open("saved_models/metrics.json", "w") as f:
        json.dump(metrics, f, indent=4)
        
    print(f"Metrics saved for threshold {MODEL_THRESHOLD} in saved_models/metrics.json")

if __name__ == "__main__":
    run_forensic_audit()