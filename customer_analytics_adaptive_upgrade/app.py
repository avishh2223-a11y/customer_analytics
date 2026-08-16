import streamlit as st
import pandas as pd
import time

from src.services.prediction_service import PredictionService
from src.services.explanation_service import ExplanationService
from src.services.recommendation_service import RecommendationService

# Page Configuration
st.set_page_config(page_title="AI Churn Analytics", page_icon="📊", layout="wide")

# Initialize Services
@st.cache_resource
def load_services():
    pred_svc = PredictionService()
    expl_svc = ExplanationService(pred_svc.model)
    return pred_svc, expl_svc

try:
    pred_service, expl_service = load_services()
except Exception as e:
    st.error(f"Failed to load backend services: {e}")
    st.stop()

# Sidebar Navigation
st.sidebar.title("Navigation")
page = st.sidebar.radio("Select Module", [
    "🏠 Home", 
    "🔮 Customer Prediction", 
    "📈 Analytics & About"
])

st.sidebar.markdown("---")
st.sidebar.info("Powered by LightGBM & SHAP\n\nDeveloped for Enterprise Analytics.")

if page == "🏠 Home":
    st.title("Enterprise Customer Churn Prediction System")
    st.markdown("""
    Welcome to the AI-driven Business Decision Support Engine.
    
    This architecture integrates a **LightGBM ensemble classifier** with **Game Theory (SHAP)** to not only predict customer churn but to mathematically explain *why* it is happening, allowing the business to deploy targeted retention strategies.
    """)
    
    col1, col2, col3 = st.columns(3)
    col1.metric(label="Champion Model", value="LightGBM")
    col2.metric(label="Validation Recall", value="83.91%")
    col3.metric(label="Artifact Version", value="v1.0.0")

elif page == "🔮 Customer Prediction":
    st.title("Customer Risk Assessment")
    st.markdown("Enter customer details below to run real-time inference.")
    
    with st.form("customer_form"):
        col1, col2, col3 = st.columns(3)
        
        with col1:
            gender = st.selectbox("Gender", ["Male", "Female"])
            senior = st.selectbox("Senior Citizen", [0, 1])
            partner = st.selectbox("Partner", ["Yes", "No"])
            dependents = st.selectbox("Dependents", ["Yes", "No"])
            tenure = st.number_input("Tenure (Months)", min_value=0, max_value=100, value=12)
            
        with col2:
            phone = st.selectbox("Phone Service", ["Yes", "No"])
            mult_lines = st.selectbox("Multiple Lines", ["No phone service", "No", "Yes"])
            internet = st.selectbox("Internet Service", ["DSL", "Fiber optic", "No"])
            security = st.selectbox("Online Security", ["No", "Yes", "No internet service"])
            backup = st.selectbox("Online Backup", ["No", "Yes", "No internet service"])
            
        with col3:
            contract = st.selectbox("Contract", ["Month-to-month", "One year", "Two year"])
            paperless = st.selectbox("Paperless Billing", ["Yes", "No"])
            payment = st.selectbox("Payment Method", ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"])
            monthly = st.number_input("Monthly Charges ($)", min_value=0.0, value=70.0)
            total = st.number_input("Total Charges ($)", min_value=0.0, value=840.0)
            
        submitted = st.form_submit_button("Run AI Inference", use_container_width=True)

    if submitted:
        raw_data = {
            "gender": gender, "SeniorCitizen": senior, "Partner": partner, "Dependents": dependents,
            "tenure": tenure, "PhoneService": phone, "MultipleLines": mult_lines,
            "InternetService": internet, "OnlineSecurity": security, "OnlineBackup": backup,
            "DeviceProtection": "No", "TechSupport": "No", "StreamingTV": "No", "StreamingMovies": "No",
            "Contract": contract, "PaperlessBilling": paperless, "PaymentMethod": payment,
            "MonthlyCharges": monthly, "TotalCharges": total
        }
        
        with st.spinner("Processing architectural pipeline..."):
            time.sleep(0.5) # Simulate network latency for UX
            pred, prob, X_encoded = pred_service.predict(raw_data)
            
        st.success("Inference Complete.")
        
        # UI: Dashboard Results
        st.markdown("---")
        st.subheader("Decision Support Dashboard")
        
        res_col1, res_col2 = st.columns([1, 1])
        
        with res_col1:
            st.markdown("### 1. Model Prediction")
            if pred == 1:
                st.error(f"**CHURN PREDICTED** (Probability: {prob*100:.1f}%)")
            else:
                st.success(f"**RETENTION PREDICTED** (Probability: {(1-prob)*100:.1f}%)")
                
            st.markdown("### 2. Recommended Action")
            rec = RecommendationService.get_action_plan(prob, monthly)
            st.info(f"**Risk Profile:** {rec['risk_level']}\n\n**Strategy:** {rec['action']}")
            
        with res_col2:
            st.markdown("### 3. Explainable AI (SHAP)")
            fig = expl_service.generate_waterfall(X_encoded)
            st.pyplot(fig)

elif page == "📈 Analytics & About":
    st.title("System Analytics")
    st.markdown("Global interpretability derived from the training dataset.")
    try:
        st.image("reports/figures/08_shap_importance.png", caption="Global Feature Importance", use_container_width=True)
    except FileNotFoundError:
        st.warning("Analytics images not found. Ensure Phase 3 scripts were executed.")