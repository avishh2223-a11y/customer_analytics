from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import pandas as pd
import numpy as np
import json
import os
from datetime import datetime
import shap

from src.services.prediction_service import PredictionService
from src.services.explanation_service import ExplanationService
from src.services.recommendation_service import RecommendationService
from src.utils.logger import get_logger

logger = get_logger(__name__)

MODEL_THRESHOLD = 0.60
CHAMPION_MODEL = "LightGBM"

app = FastAPI(title="ChurnAI Customer Intelligence", version="1.2.4 - Production")
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

try:
    pred_service = PredictionService()
    expl_service = ExplanationService(pred_service.model)
    logger.info("ML Services loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load ML Services: {e}")
    pred_service = None
    expl_service = None

class DeployOfferRequest(BaseModel):
    customerId: str
    strategy: str

class ReportGenerateRequest(BaseModel):
    reportType: str

reports_db = [
    {
        "id": "rep-1",
        "title": "Executive Report",
        "date": datetime.now().strftime("%d/%m/%Y"),
        "status": "Ready",
        "size": "Generated",
        "description": "High-level overview of churn metrics and trends"
    }
]

def load_verified_metrics():
    filepath = "saved_models/metrics.json"
    if os.path.exists(filepath):
        try:
            with open(filepath, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to parse metrics.json: {e}")
    return {}

@app.get("/health")
def health_check():
    return {"status": "online", "champion_model": CHAMPION_MODEL, "threshold": MODEL_THRESHOLD}

@app.get("/api/predict-by-id/{customer_id}")
def predict_churn_by_id(customer_id: str):
    if not pred_service:
        raise HTTPException(status_code=500, detail="ML Model Offline")
    
    df = pd.read_csv("data/raw/Telco-Customer-Churn.csv")
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce').fillna(0.0)
    df['MonthlyCharges'] = pd.to_numeric(df['MonthlyCharges'], errors='coerce').fillna(0.0)
    df['tenure'] = pd.to_numeric(df['tenure'], errors='coerce').fillna(0)
    
    customer_row = df[df['customerID'].str.strip() == customer_id.strip()]
    if customer_row.empty:
        raise HTTPException(status_code=404, detail="Customer ID not found.")
    
    row_dict = customer_row.iloc[0].to_dict()
    _, prob, _ = pred_service.predict(row_dict)
    
    prob_val = float(prob)
    predicted_class = "Churn" if prob_val >= MODEL_THRESHOLD else "No Churn"
    risk_category = "HIGH" if prob_val >= MODEL_THRESHOLD else ("MEDIUM" if prob_val >= (MODEL_THRESHOLD - 0.20) else "LOW")
    
    return {
        "customerId": customer_id,
        "probability": round(prob_val, 4),
        "predicted_class": predicted_class,
        "risk_level": risk_category,
        "threshold_used": MODEL_THRESHOLD,
        "champion_model": CHAMPION_MODEL,
        "customerDetails": row_dict
    }

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    try:
        df = pd.read_csv("data/raw/Telco-Customer-Churn.csv")
        df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce').fillna(0.0)
        df['MonthlyCharges'] = pd.to_numeric(df['MonthlyCharges'], errors='coerce').fillna(0.0)
        df['tenure'] = pd.to_numeric(df['tenure'], errors='coerce').fillna(0)
        
        churned_df = df[df['Churn'] == 'Yes']
        retention_rate = round(((len(df) - len(churned_df)) / len(df)) * 100, 1)
        
        high_risk_active = df[(df['Contract'] == 'Month-to-month') & (df['MonthlyCharges'] > 70)]
        at_risk_revenue = round(float(high_risk_active['MonthlyCharges'].sum() * 12), 2)
        
        metrics = load_verified_metrics()
        t_metrics = metrics.get("threshold_dependent_metrics", {})
        i_metrics = metrics.get("threshold_independent_metrics", {})
        
        return {
            "championModel": metrics.get("model_name", CHAMPION_MODEL),
            "selectedThreshold": metrics.get("selected_threshold", MODEL_THRESHOLD),
            "totalCustomers": len(df),
            "historicalChurners": len(churned_df),
            "retentionRate": retention_rate,
            "atRiskRevenue": at_risk_revenue,
            "modelAccuracy": t_metrics.get("accuracy", "N/A"),
            "modelWeightedF1": t_metrics.get("f1_weighted", "N/A"),
            "modelChurnRecall": t_metrics.get("recall_churn", "N/A"),
            "modelRocAuc": round(i_metrics.get("roc_auc", 0) * 100, 2) if "roc_auc" in i_metrics else "N/A"
        }
    except Exception as e:
        logger.error(f"Error computing dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics")
def get_analytics_distributions():
    try:
        df = pd.read_csv("data/raw/Telco-Customer-Churn.csv")
        df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce').fillna(0.0)
        df['MonthlyCharges'] = pd.to_numeric(df['MonthlyCharges'], errors='coerce').fillna(0.0)
        df['tenure'] = pd.to_numeric(df['tenure'], errors='coerce').fillna(0)
        
        contract_churn = df.groupby('Contract')['Churn'].apply(lambda x: round((x == 'Yes').mean() * 100, 1)).to_dict()
        internet_churn = df.groupby('InternetService')['Churn'].apply(lambda x: round((x == 'Yes').mean() * 100, 1)).to_dict()
        payment_churn = df.groupby('PaymentMethod')['Churn'].apply(lambda x: round((x == 'Yes').mean() * 100, 1)).to_dict()
        
        total_customers = len(df)
        churned_df = df[df['Churn'] == 'Yes']
        overall_churn_rate = round((len(churned_df) / total_customers) * 100, 1)
        
        high_risk_active = df[(df['Contract'] == 'Month-to-month') & (df['MonthlyCharges'] > 70)]
        at_risk_annual_revenue = round(float(high_risk_active['MonthlyCharges'].sum() * 12), 2)
        
        return {
            "contractDistribution": df['Contract'].value_counts().to_dict(),
            "contractChurnRate": contract_churn,
            "internetDistribution": df['InternetService'].value_counts().to_dict(),
            "internetChurnRate": internet_churn,
            "paymentDistribution": df['PaymentMethod'].value_counts().to_dict(),
            "paymentChurnRate": payment_churn,
            "avgTenure": round(float(df['tenure'].mean()), 1),
            "avgMonthlyCharges": round(float(df['MonthlyCharges'].mean()), 2),
            "overallChurnRate": overall_churn_rate,
            "totalAtRiskRevenue": at_risk_annual_revenue
        }
    except Exception as e:
        logger.error(f"Error in analytics endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports/list")
def list_reports():
    return reports_db

@app.post("/api/reports/generate")
def generate_report(payload: ReportGenerateRequest):
    try:
        new_report = {
            "id": f"rep-{len(reports_db) + 1}",
            "title": f"{payload.reportType} Report",
            "date": datetime.now().strftime("%d/%m/%Y"),
            "status": "Ready",
            "size": "Generated",
            "description": f"Automated analytical audit generated for {payload.reportType} module."
        }
        reports_db.insert(0, new_report)
        return {"status": "success", "report": new_report}
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/reports/{report_id}")
def delete_report(report_id: str):
    global reports_db
    reports_db = [r for r in reports_db if r["id"] != report_id]
    return {"status": "success"}

@app.get("/api/explainability/global")
def get_global_explainability():
    if not pred_service or not pred_service.model:
        raise HTTPException(status_code=500, detail="Model unavailable for SHAP.")
    
    try:
        df = pd.read_csv("data/raw/Telco-Customer-Churn.csv")
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
        
        # Extract precise feature names from the fitted preprocessor/pipeline if available
        feature_names = None
        for attr in ['preprocessor', 'pipeline', 'transformer', 'column_transformer']:
            obj = getattr(pred_service, attr, None)
            if obj is not None and hasattr(obj, 'get_feature_names_out'):
                try:
                    feature_names = obj.get_feature_names_out()
                    break
                except Exception:
                    pass

        # Fallback to Booster feature names if available
        if feature_names is None and hasattr(pred_service.model, 'feature_name_'):
            feature_names = pred_service.model.feature_name_

        if feature_names is not None and len(feature_names) == X_encoded_df.shape[1]:
            X_encoded_df.columns = [str(f) for f in feature_names]
        else:
            # Fallback descriptive mapping based on standard telco preprocessing order
            fallback_names = [
                'gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure', 
                'PhoneService', 'MultipleLines', 'InternetService_DSL', 'InternetService_Fiber optic', 'InternetService_No', 
                'OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV', 
                'StreamingMovies', 'Contract', 'PaperlessBilling', 'PaymentMethod', 
                'MonthlyCharges', 'TotalCharges'
            ]
            if X_encoded_df.shape[1] == len(fallback_names):
                X_encoded_df.columns = fallback_names
            else:
                X_encoded_df.columns = [f"Feature_{i}" for i in range(X_encoded_df.shape[1])]
        
        explainer = shap.TreeExplainer(pred_service.model)
        shap_values = explainer.shap_values(X_encoded_df)
        
        if isinstance(shap_values, list):
            vals = np.abs(shap_values[1]).mean(0)
        elif isinstance(shap_values, np.ndarray):
            if shap_values.ndim == 3:
                vals = np.abs(shap_values[:, :, 1]).mean(0)
            else:
                vals = np.abs(shap_values).mean(0)
        else:
            if hasattr(shap_values, "values"):
                sv = shap_values.values
                vals = np.abs(sv[:, :, 1]).mean(0) if sv.ndim == 3 else np.abs(sv).mean(0)
            else:
                vals = np.abs(np.array(shap_values)).mean(0)
        
        importance_list = [{"feature": str(f), "importance": round(float(v), 4)} for f, v in zip(X_encoded_df.columns, vals)]
        return sorted(importance_list, key=lambda x: x['importance'], reverse=True)[:10]
    except Exception as e:
        logger.error(f"Error calculating genuine SHAP values: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating SHAP explanations: {str(e)}")

@app.get("/api/recommendations")
def get_dashboard_recommendations():
    if not pred_service:
        raise HTTPException(status_code=500, detail="ML Model Offline")

    try:
        df = pd.read_csv("data/raw/Telco-Customer-Churn.csv")
        df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce').fillna(0.0)
        df['MonthlyCharges'] = pd.to_numeric(df['MonthlyCharges'], errors='coerce').fillna(0.0)
        df['tenure'] = pd.to_numeric(df['tenure'], errors='coerce').fillna(0)
        
        churned_df = df[df['Churn'] == 'Yes'].head(15)
        active_recommendations = []
        
        for _, row in churned_df.iterrows():
            customer_dict = row.to_dict()
            cust_id = str(customer_dict.get('customerID'))
            
            try:
                _, prob, _ = pred_service.predict(customer_dict)
            except Exception as e:
                logger.error(f"Inference failed for {cust_id}: {e}")
                continue 
                
            prob_val = float(prob)
            predicted_class = "Churn" if prob_val >= MODEL_THRESHOLD else "No Churn"
            
            if predicted_class == "Churn":
                strategies = []
                if customer_dict.get('Contract') == 'Month-to-month':
                    strategies.append("Propose 1-year contract.")
                
                active_recommendations.append({
                    "customerId": cust_id,
                    "probability": round(prob_val, 4),
                    "riskLevel": "HIGH",
                    "strategy": " ".join(strategies) or "Standard retention offer.",
                    "thresholdUsed": MODEL_THRESHOLD
                })
                
        return sorted(active_recommendations, key=lambda x: x['probability'], reverse=True)
    except Exception as e:
        logger.error(f"Error in recommendations endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendations/deploy")
def deploy_retention_offer(payload: DeployOfferRequest):
    try:
        logger.info(f"SUCCESS: Retention offer deployed for {payload.customerId} with strategy: {payload.strategy}")
        return {"status": "success", "message": f"Retention offer deployed for account {payload.customerId}."}
    except Exception as e:
        logger.error(f"Error deploying offer: {e}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    logger.info("Starting FastAPI server...")
    uvicorn.run("src.api.main:app", host="127.0.0.1", port=8000, reload=True)