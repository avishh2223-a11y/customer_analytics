import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

from src.config import SAVED_MODELS_DIR, PROCESSED_DATA_PATH
from src.utils.logger import get_logger

logger = get_logger(__name__)

def train_and_evaluate():
    logger.info("Loading processed numeric dataset...")
    df = pd.read_csv(PROCESSED_DATA_PATH)
    
    # 1. Separate Features (X) and Target (y)
    # X contains all columns EXCEPT Churn. y contains ONLY Churn.
    X = df.drop('Churn', axis=1)
    y = df['Churn']
    
    # 2. Split Data (80% for learning, 20% for testing)
    logger.info("Splitting data into Training (80%) and Testing (20%) sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 3. Initialize the Algorithm
    # 'class_weight="balanced"' tells the math to pay extra attention to Churn=1
    # because we saw in our EDA that the dataset is imbalanced.
    logger.info("Training the Random Forest Algorithm...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    
    # 4. Train (Fit) the Model
    model.fit(X_train, y_train)
    
    # 5. Make Predictions on the unseen Test data
    logger.info("Evaluating model performance...")
    predictions = model.predict(X_test)
    
    # 6. Generate the Report
    acc = accuracy_score(y_test, predictions)
    report = classification_report(y_test, predictions)
    
    print("\n" + "="*55)
    print(f"               MODEL ACCURACY: {acc*100:.2f}%")
    print("="*55)
    print(report)
    print("="*55 + "\n")
    
    # 7. Save the trained brain for future use
    model_path = SAVED_MODELS_DIR / "rf_model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    logger.info(f"Model successfully saved to {model_path}")

if __name__ == "__main__":
    train_and_evaluate()