// Customer Data for Prediction
export interface CustomerData {
  id: string
  firstName: string
  lastName: string
  email: string
  accountId: string
  contractStart: string
  monthlyCharges: number
  tenure: number
  subscriptionType: 'Basic' | 'Standard' | 'Premium'
  internetType: 'Fiber' | 'DSL' | 'Cable'
  techSupport: boolean
  deviceProtection: boolean
  paperlessBilling: boolean
  paymentMethod: 'Credit Card' | 'Bank Transfer' | 'Check'
  totalCharges: number
}

// Prediction Result
export interface PredictionResult {
  customerId: string
  probability: number
  confidence: number
  riskScore: number
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH'
  topFeatures: FeatureContribution[]
  businessSummary: string
}

// Feature Contribution for SHAP
export interface FeatureContribution {
  feature: string
  value: number
  shapValue: number
  direction: 'positive' | 'negative'
}

// SHAP Explanation
export interface SHAPExplanation {
  customerId: string
  baseValue: number
  finalPrediction: number
  contributions: FeatureContribution[]
  businessInterpretation: string
  technicalInterpretation: string
  recommendedAction: string
}

// Recommendation
export interface Recommendation {
  id: string
  customerId: string
  customerName: string
  customerRisk: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  revenueAtRisk: number
  estimatedRevenueSaved: number
  implementationDifficulty: 'Easy' | 'Medium' | 'Hard'
  timeline: string
  status: 'pending' | 'completed' | 'archived'
  rootCauses: string[]
  suggestedRetentionOffer: string
  expectedRetentionSuccess: number
  responsibleDepartment: string
  implementationChecklist: string[]
}

// Analytics Data
export interface AnalyticsMetrics {
  totalCustomers: number
  atRiskCustomers: number
  retentionRate: number
  modelAccuracy: number
  rocAuc: number
  f1Score: number
  predictionsToday: number
  averageRiskScore: number
  lastTrainingTime: number
  currentModelVersion: string
  accuracy: number
  precision: number
  recall: number
}

// Analytics Charts
export interface AnalyticsCharts {
  metrics: {
    accuracy: number
    precision: number
    recall: number
    f1Score: number
    rocAuc: number
  }
  rocCurve: Array<{ fpr: number; tpr: number; random?: number }>
  precisionRecallCurve: Array<{ recall: number; precision: number }>
  confusionMatrix: { tp: number; tn: number; fp: number; fn: number }
  featureImportance: Array<{ feature: string; importance: number }>
  monthlyChurn: Array<{ month: string; rate: number }>
  revenueAnalysis: Array<{ month: string; actual: number; projected: number }>
  riskDistribution: Array<{ name: string; value: number }>
  predictionConfidence: Array<{ x: number; y: number }>
  segmentPerformance: Array<{ segment: string; accuracy: number; churnRate: number; retention: number }>
}

// Report
export interface Report {
  id: string
  type: 'Executive' | 'Prediction' | 'SHAP' | 'Recommendation' | 'Analytics'
  title: string
  description: string
  generatedAt: number
  fileSize: number
  downloadUrl: string
  status: 'Ready' | 'Generating' | 'Failed'
}

// Activity Timeline Event
export interface ActivityEvent {
  id: string
  timestamp: number
  action: string
  description: string
  details?: Record<string, any>
}

// AI Insight
export interface AIInsight {
  feature: string
  shapValue: number
  interpretation: string
  recommendation: string
}
