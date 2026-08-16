import sys
import os
import pandas as pd
import numpy as np
import shap

# Ensure project root is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.services.prediction_service import PredictionService

def independent_shap_audit():
    print("--- INDEPENDENT SHAP AUTHENTICITY AUDIT ---")
    
    # 1. Load Model and Dataset
    pred_service = PredictionService()
    df = pd.read_csv("data/raw/Telco-Customer-Churn.csv")
    
    # 2. Replicate Preprocessing
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce').fillna(0.0)
    df['MonthlyCharges'] = pd.to_numeric(df['MonthlyCharges'], errors='coerce').fillna(0.0)
    df['tenure'] = pd.to_numeric(df['tenure'], errors='coerce').fillna(0)
    
    X = df.drop(['customerID', 'Churn'], axis=1, errors='ignore').head(300).to_dict(orient='records')
    
    encoded_rows = []
    for row in X:
        _, _, x_enc = pred_service.predict(row)
        if isinstance(x_enc, np.ndarray):
            x_enc = x_enc.flatten()
        elif isinstance(x_enc, pd.DataFrame):
            x_enc = x_enc.values.flatten()
        elif isinstance(x_enc, pd.Series):
            x_enc = x_enc.values
        encoded_rows.append(x_enc)
        
    X_encoded_df = pd.DataFrame(encoded_rows)
    
    # 3. Extract Feature Names
    feature_names = None
    for attr in ['preprocessor', 'pipeline', 'transformer', 'column_transformer']:
        obj = getattr(pred_service, attr, None)
        if obj is not None and hasattr(obj, 'get_feature_names_out'):
            try:
                feature_names = obj.get_feature_names_out()
                break
            except Exception:
                pass
                
    if feature_names is None and hasattr(pred_service.model, 'feature_name_'):
        feature_names = pred_service.model.feature_name_
        
    if feature_names is not None and len(feature_names) == X_encoded_df.shape[1]:
        X_encoded_df.columns = [str(f) for f in feature_names]
        
    # 4. Independent TreeExplainer Execution
    explainer = shap.TreeExplainer(pred_service.model)
    shap_values = explainer.shap_values(X_encoded_df)
    
    if isinstance(shap_values, list):
        vals = np.abs(shap_values[1]).mean(0)
    elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
        vals = np.abs(shap_values[:, :, 1]).mean(0)
    else:
        vals = np.abs(np.array(shap_values)).mean(0)
        
    # 5. Metrics & Consistency Check
    num_model_features = pred_service.model.n_features_in_ if hasattr(pred_service.model, 'n_features_in_') else len(X_encoded_df.columns)
    num_shap_features = len(vals)
    num_returned_features = min(10, num_shap_features)
    
    print(f"number_of_model_features: {num_model_features}")
    print(f"number_of_shap_features: {num_shap_features}")
    print(f"number_of_returned_features: {num_returned_features}")
    
    importance_list = [{"feature": str(f), "importance": round(float(v), 4)} for f, v in zip(X_encoded_df.columns, vals)]
    importance_list.sort(key=lambda x: x['importance'], reverse=True)
    
    print("\nTop 10 Independent SHAP Features:")
    for item in importance_list[:10]:
        print(f"  {item['feature']} -> {item['importance']:.4f}")

if __name__ == "__main__":
    independent_shap_audit()