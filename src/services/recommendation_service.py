from typing import Dict

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