import json
import os
import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Ensure src is in the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.services.prediction_service import PredictionService

def run_threshold_analysis():
    print("--- CHURN PREDICTION THRESHOLD ANALYSIS ---\n")
    
    pred_service = PredictionService()
    df = pd.read_csv("data/raw/Telco-Customer-Churn.csv")
    
    # Replicate preprocessing
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce').fillna(0.0)
    df['MonthlyCharges'] = pd.to_numeric(df['MonthlyCharges'], errors='coerce').fillna(0.0)
    df['tenure'] = pd.to_numeric(df['tenure'], errors='coerce').fillna(0)
    
    X = df.drop(['customerID', 'Churn'], axis=1, errors='ignore')
    y = (df['Churn'] == 'Yes').astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    y_prob = []
    
    # FIX: Using to_dict('records') strictly preserves floats and ints, preventing the string coercion error
    test_records = X_test.to_dict(orient='records')
    for record in test_records:
        _, prob, _ = pred_service.predict(record)
        y_prob.append(prob)
        
    y_prob = np.array(y_prob)

    print(f"{'Thresh':<8} | {'Acc':<8} | {'Prec':<8} | {'Recall':<8} | {'F1':<8} | {'Spec':<8} | {'FPR':<8} | {'FNR':<8} | {'TN':<5} | {'FP':<5} | {'FN':<5} | {'TP':<5}")
    print("-" * 115)

    thresholds = np.arange(0.10, 0.95, 0.05)
    results = []
    
    for t in thresholds:
        y_pred = (y_prob >= t).astype(int)
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        spec = tn / (tn + fp) if (tn+fp) > 0 else 0
        fpr = fp / (fp + tn) if (fp+tn) > 0 else 0
        fnr = fn / (fn + tp) if (fn+tp) > 0 else 0
        
        results.append({
            "threshold": round(t, 2), "accuracy": round(acc, 4), "precision": round(prec, 4), 
            "recall": round(rec, 4), "f1": round(f1, 4), "specificity": round(spec, 4),
            "fpr": round(fpr, 4), "fnr": round(fnr, 4), "tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)
        })
        print(f"{t:<8.2f} | {acc:<8.4f} | {prec:<8.4f} | {rec:<8.4f} | {f1:<8.4f} | {spec:<8.4f} | {fpr:<8.4f} | {fnr:<8.4f} | {tn:<5} | {fp:<5} | {fn:<5} | {tp:<5}")

    os.makedirs("saved_models", exist_ok=True)
    with open("saved_models/threshold_analysis.json", "w") as f:
        json.dump(results, f, indent=4)
    print("\nAnalysis saved to saved_models/threshold_analysis.json")

if __name__ == "__main__":
    run_threshold_analysis()