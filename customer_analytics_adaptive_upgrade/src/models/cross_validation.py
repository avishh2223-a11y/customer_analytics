import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import StratifiedKFold, cross_validate

from src.config import SAVED_MODELS_DIR, PROCESSED_DATA_PATH
from src.utils.logger import get_logger

logger = get_logger(__name__)

def load_data_and_model():
    """Loads the entire processed dataset and the champion model."""
    logger.info("Loading full dataset and champion LightGBM model...")
    df = pd.read_csv(PROCESSED_DATA_PATH)
    
    X = df.drop('Churn', axis=1)
    y = df['Churn']
    
    champion_path = SAVED_MODELS_DIR / "champion_lightgbm.pkl"
    with open(champion_path, 'rb') as f:
        model = pickle.load(f)
        
    return X, y, model

def run_cross_validation():
    logger.info("Initializing 5-Fold Stratified Cross Validation...")
    X, y, model = load_data_and_model()
    
    # 1. Define the Fold Strategy
    # Stratified ensures the imbalanced Churn ratio is preserved in every fold
    cv_strategy = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    # 2. Define the metrics we want to track across folds
    scoring_metrics = ['accuracy', 'f1', 'roc_auc', 'recall']
    
    # 3. Execute Cross Validation
    logger.info("Executing folds (this will train 5 separate models)...")
    cv_results = cross_validate(
        estimator=model,
        X=X,
        y=y,
        cv=cv_strategy,
        scoring=scoring_metrics,
        n_jobs=-1,
        return_train_score=False
    )
    
    # 4. Process and Print Results
    print("\n" + "="*65)
    print("             5-FOLD CROSS VALIDATION RESULTS")
    print("="*65)
    print(f"{'Metric':<15} | {'Mean Score':<15} | {'Standard Deviation (±)'}")
    print("-" * 65)
    
    metrics_map = {
        'test_accuracy': 'Accuracy',
        'test_f1': 'F1-Score',
        'test_roc_auc': 'ROC-AUC',
        'test_recall': 'Recall'
    }
    
    for cv_key, display_name in metrics_map.items():
        scores = cv_results[cv_key]
        mean_score = np.mean(scores)
        std_score = np.std(scores)
        
        print(f"{display_name:<15} | {mean_score:<15.4f} | ± {std_score:.4f}")
        
    print("="*65 + "\n")
    
    # 5. Interpretation
    roc_std = np.std(cv_results['test_roc_auc'])
    if roc_std < 0.02:
        logger.info("CONCLUSION: The model is HIGHLY STABLE across varying data distributions.")
    else:
        logger.warning("CONCLUSION: The model shows HIGH VARIANCE. Risk of overfitting.")

if __name__ == "__main__":
    run_cross_validation()
    