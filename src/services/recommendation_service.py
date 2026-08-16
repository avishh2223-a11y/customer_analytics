from typing import Dict, List, Any
import uuid

class RecommendationService:
    @staticmethod
    def get_action_plan(churn_prob: float, monthly_charges: float) -> Dict[str, str]:
        """Generates business rules based on risk and customer value."""
        if churn_prob < 0.30:
            return {
                "risk_level": "Low Risk",
                "color": "green",
                "action": "No immediate action required. Maintain standard engagement."
            }
        elif churn_prob < 0.70:
            return {
                "risk_level": "Medium Risk",
                "color": "orange",
                "action": f"Proactive Outreach: Offer a 10% discount for 3 months (Value: ${monthly_charges * 0.10 * 3:.2f})."
            }
        else:
            return {
                "risk_level": "High Risk",
                "color": "red",
                "action": f"Critical Intervention: Executive escalation. Offer immediate 20% discount or free premium upgrade."
            }

    @staticmethod
    def generate_rich_recommendation(customer_id: str, name: str, churn_prob: float, monthly_charges: float, shap_causes: List[str]) -> Dict[str, Any]:
        """Wraps the basic action plan into the rich UI format expected by Next.js"""
        
        # 1. Get the basic risk assessment
        base_plan = RecommendationService.get_action_plan(churn_prob, monthly_charges)
        
        # 2. Dynamically build the checklist based on the risk level
        checklist = []
        if base_plan["risk_level"] == "High Risk":
            checklist = ["Flag account for Executive Review", "Send immediate SMS offer", "Call customer within 2 hours"]
            priority = "HIGH"
            timeline = "Immediate"
            dept = "Executive Escalation"
        elif base_plan["risk_level"] == "Medium Risk":
            checklist = ["Send personalized discount email", "Schedule follow-up call", "Apply discount code"]
            priority = "MEDIUM"
            timeline = "1-2 days"
            dept = "Sales"
        else:
            checklist = ["Monitor account usage", "Include in monthly newsletter"]
            priority = "LOW"
            timeline = "Standard"
            dept = "Customer Success"

        # 3. Return the exact JSON structure Next.js expects
        return {
            "id": str(uuid.uuid4()),
            "customerName": name,
            "customerId": customer_id,
            "status": "pending",
            "priority": priority,
            "customerRisk": round(churn_prob * 100, 1), 
            "revenueAtRisk": round(monthly_charges * 12, 2), 
            "estimatedRevenueSaved": round((monthly_charges * 12) * (1 - churn_prob), 2),
            "implementationDifficulty": "Medium" if priority == "HIGH" else "Easy",
            "timeline": timeline,
            "rootCauses": shap_causes,
            "suggestedRetentionOffer": base_plan["action"],
            "expectedRetentionSuccess": 95.0 if priority == "LOW" else (85.0 if priority == "MEDIUM" else 65.0),
            "responsibleDepartment": dept,
            "implementationChecklist": checklist
        }