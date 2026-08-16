import pandas as pd
import numpy as np
import pickle
import json
import lightgbm as lgb
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

from src.config import SAVED_MODELS_DIR, PROCESSED_DATA_PATH, METRICS_DIR
from src.utils.logger import get_logger

logger = get_logger(__name__)

def load_data():
    df = pd.read_csv(PROCESSED_DATA_PATH)
    X = df.drop('Churn', axis=1)
    y = df['Churn']
    return train_test_split(X, y, test_size=0.2, random_state=42)

def evaluate_model(model, X_test, y_test, model_name: str) -> dict:
    """Calculates and returns core metrics for a given model."""
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    return {
        "Accuracy": float(accuracy_score(y_test, y_pred)),
        "Precision": float(precision_score(y_test, y_pred)),
        "Recall": float(recall_score(y_test, y_pred)),
        "F1_Score": float(f1_score(y_test, y_pred)),
        "ROC_AUC": float(roc_auc_score(y_test, y_prob))
    }

def run_hyperparameter_tuning():
    logger.info("Starting Hyperparameter Tuning for LightGBM...")
    X_train, X_test, y_train, y_test = load_data()
    
    # 1. Baseline Model
    logger.info("Evaluating Baseline LightGBM...")
    baseline_model = lgb.LGBMClassifier(random_state=42, class_weight='balanced', n_jobs=-1, verbose=-1)
    baseline_model.fit(X_train, y_train)
    baseline_metrics = evaluate_model(baseline_model, X_test, y_test, "Baseline")
    
    # 2. Define Hyperparameter Space
    # num_leaves: Main parameter for controlling complexity in leaf-wise trees.
    # max_depth: Limits how deep the tree grows to prevent overfitting.
    # learning_rate: Step size for weight updates. Lower requires more trees (n_estimators).
    # min_child_samples: Minimum data in one leaf. Higher number prevents overfitting.
    param_dist = {
        'num_leaves': [20, 31, 40, 50],
        'max_depth': [3, 5, 7, -1],
        'learning_rate': [0.01, 0.05, 0.1, 0.2],
        'min_child_samples': [10, 20, 30, 50],
        'n_estimators': [100, 200, 300]
    }
    
    # 3. Initialize RandomizedSearchCV
    # We optimize specifically for 'roc_auc' to balance the True Positive and False Positive rates.
    logger.info("Running RandomizedSearchCV (this may take a minute)...")
    lgb_estimator = lgb.LGBMClassifier(random_state=42, class_weight='balanced', n_jobs=-1, verbose=-1)
    
    random_search = RandomizedSearchCV(
        estimator=lgb_estimator,
        param_distributions=param_dist,
        n_iter=20,          # Test 20 random combinations
        scoring='roc_auc',  # Optimize for Area Under Curve
        cv=3,               # 3-fold cross-validation during search
        random_state=42,
        n_jobs=-1,
        verbose=1
    )
    
    # 4. Execute Search
    random_search.fit(X_train, y_train)
    
    logger.info(f"Best Parameters Found: {random_search.best_params_}")
    
    # 5. Evaluate Best Model
    best_model = random_search.best_estimator_
    tuned_metrics = evaluate_model(best_model, X_test, y_test, "Tuned")
    
    # 6. Compare and Print Results
    print("\n" + "="*60)
    print("             BEFORE VS AFTER TUNING COMPARISON")
    print("="*60)
    print(f"{'Metric':<15} | {'Baseline':<15} | {'Tuned':<15} | {'Improvement'}")
    print("-" * 60)
    for metric in baseline_metrics.keys():
        base = baseline_metrics[metric]
        tuned = tuned_metrics[metric]
        diff = tuned - base
        sign = "+" if diff > 0 else ""
        print(f"{metric:<15} | {base:<15.4f} | {tuned:<15.4f} | {sign}{diff:.4f}")
    print("="*60 + "\n")
    
    # 7. Save the Champion Model
    champion_path = SAVED_MODELS_DIR / "champion_lightgbm.pkl"
    with open(champion_path, 'wb') as f:
        pickle.dump(best_model, f)
    
    # Save the parameters for the report
    with open(METRICS_DIR / "best_hyperparameters.json", 'w') as f:
        json.dump(random_search.best_params_, f, indent=4)
        
    logger.info(f"Champion model successfully saved to {champion_path}")

if __name__ == "__main__":
    run_hyperparameter_tuning()