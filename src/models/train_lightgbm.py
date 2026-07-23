import pandas as pd
import pickle
import json
import matplotlib.pyplot as plt
import seaborn as sns
import lightgbm as lgb
from typing import Tuple
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
    logger.info("Loading processed dataset for LightGBM...")
    df = pd.read_csv(PROCESSED_DATA_PATH)
    
    X = df.drop('Churn', axis=1)
    y = df['Churn']
    
    return train_test_split(X, y, test_size=0.2, random_state=42)

def train_model(X_train: pd.DataFrame, y_train: pd.Series) -> lgb.LGBMClassifier:
    """Trains the LightGBM classifier handling class imbalance."""
    logger.info("Training LightGBM Classifier...")
    
    # LightGBM supports class_weight='balanced' natively, just like Random Forest
    model = lgb.LGBMClassifier(
        n_estimators=100,
        random_state=42,
        class_weight='balanced',
        n_jobs=-1,
        verbose=-1 # Suppress LightGBM C++ warnings
    )
    
    model.fit(X_train, y_train)
    return model

def evaluate_and_save(model: lgb.LGBMClassifier, X_test: pd.DataFrame, y_test: pd.Series):
    """Evaluates the model, plots confusion matrix, and saves metrics."""
    logger.info("Evaluating LightGBM model...")
    
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    metrics = {
        "Accuracy": float(accuracy_score(y_test, y_pred)),
        "Precision": float(precision_score(y_test, y_pred)),
        "Recall": float(recall_score(y_test, y_pred)),
        "F1_Score": float(f1_score(y_test, y_pred)),
        "ROC_AUC": float(roc_auc_score(y_test, y_prob))
    }
    
    print("\n" + "="*55)
    print(f"             LIGHTGBM MODEL METRICS")
    print("="*55)
    for k, v in metrics.items():
        print(f"{k+':':<15} {v:.4f}")
    print("="*55)
    print(classification_report(y_test, y_pred))
    
    # Save Metrics
    with open(METRICS_DIR / "lightgbm_metrics.json", 'w') as f:
        json.dump(metrics, f, indent=4)
        
    # Plot Confusion Matrix (Using Greens to visually distinguish from XGBoost)
    plt.figure(figsize=(6, 5))
    cm = confusion_matrix(y_test, y_pred)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Greens', cbar=False)
    plt.title('LightGBM Confusion Matrix')
    plt.ylabel('Actual')
    plt.xlabel('Predicted')
    
    cm_path = FIGURES_DIR / "05_lgb_confusion_matrix.png"
    plt.savefig(cm_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    logger.info(f"Saved metrics and CM plot to reports directory.")

def run_lightgbm_pipeline():
    X_train, X_test, y_train, y_test = prepare_data()
    
    model = train_model(X_train, y_train)
    evaluate_and_save(model, X_test, y_test)
    
    model_path = SAVED_MODELS_DIR / "lgb_model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    logger.info(f"LightGBM model successfully saved to {model_path}")

if __name__ == "__main__":
    run_lightgbm_pipeline()