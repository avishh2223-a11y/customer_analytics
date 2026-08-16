import pandas as pd
import pickle
import json
import matplotlib.pyplot as plt
import seaborn as sns
import xgboost as xgb
from typing import Tuple, Dict, Any
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report, 
    accuracy_score, 
    roc_auc_score, 
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score
)

from src.config import SAVED_MODELS_DIR, PROCESSED_DATA_PATH, FIGURES_DIR, METRICS_DIR
from src.utils.logger import get_logger

logger = get_logger(__name__)

def prepare_data() -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """Loads processed data and splits into training and testing sets."""
    logger.info("Loading processed dataset for XGBoost...")
    df = pd.read_csv(PROCESSED_DATA_PATH)
    
    X = df.drop('Churn', axis=1)
    y = df['Churn']
    
    return train_test_split(X, y, test_size=0.2, random_state=42)

def train_model(X_train: pd.DataFrame, y_train: pd.Series) -> xgb.XGBClassifier:
    """Trains the XGBoost classifier handling class imbalance."""
    logger.info("Training XGBoost Classifier...")
    
    # Calculate scale_pos_weight to handle imbalance (equivalent to class_weight='balanced')
    # Formula: count(negative examples) / count(positive examples)
    neg_count = (y_train == 0).sum()
    pos_count = (y_train == 1).sum()
    scale_weight = neg_count / pos_count
    
    model = xgb.XGBClassifier(
        n_estimators=100,
        random_state=42,
        scale_pos_weight=scale_weight,
        eval_metric='logloss',
        use_label_encoder=False
    )
    
    model.fit(X_train, y_train)
    return model

def evaluate_and_save(model: xgb.XGBClassifier, X_test: pd.DataFrame, y_test: pd.Series):
    """Evaluates the model, plots confusion matrix, and saves metrics."""
    logger.info("Evaluating XGBoost model...")
    
    # Generate predictions
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1] # Probabilities needed for ROC-AUC
    
    # Calculate Metrics
    metrics = {
        "Accuracy": float(accuracy_score(y_test, y_pred)),
        "Precision": float(precision_score(y_test, y_pred)),
        "Recall": float(recall_score(y_test, y_pred)),
        "F1_Score": float(f1_score(y_test, y_pred)),
        "ROC_AUC": float(roc_auc_score(y_test, y_prob))
    }
    
    # Print Report
    print("\n" + "="*55)
    print(f"             XGBOOST MODEL METRICS")
    print("="*55)
    for k, v in metrics.items():
        print(f"{k+':':<15} {v:.4f}")
    print("="*55)
    print(classification_report(y_test, y_pred))
    
    # Save Metrics to JSON
    METRICS_DIR.mkdir(parents=True, exist_ok=True)
    with open(METRICS_DIR / "xgboost_metrics.json", 'w') as f:
        json.dump(metrics, f, indent=4)
        
    # Plot and Save Confusion Matrix
    plt.figure(figsize=(6, 5))
    cm = confusion_matrix(y_test, y_pred)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False)
    plt.title('XGBoost Confusion Matrix')
    plt.ylabel('Actual')
    plt.xlabel('Predicted')
    
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    cm_path = FIGURES_DIR / "04_xgb_confusion_matrix.png"
    plt.savefig(cm_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    logger.info(f"Saved metrics to {METRICS_DIR} and CM plot to {FIGURES_DIR}")

def run_xgboost_pipeline():
    X_train, X_test, y_train, y_test = prepare_data()
    
    model = train_model(X_train, y_train)
    evaluate_and_save(model, X_test, y_test)
    
    # Save the model
    model_path = SAVED_MODELS_DIR / "xgb_model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    logger.info(f"XGBoost model successfully saved to {model_path}")

if __name__ == "__main__":
    run_xgboost_pipeline()