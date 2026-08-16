import { CustomerData, PredictionResult, SHAPExplanation, Recommendation, AIInsight, AnalyticsCharts, Report } from './types'

const FIRST_NAMES = ['John', 'Jane', 'Michael', 'Sarah', 'Robert', 'Emily', 'David', 'Jessica', 'James', 'Lisa']
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']

export function generateCustomer(id?: string): CustomerData {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  const monthlyCharges = Math.floor(Math.random() * 100) + 20
  const tenure = Math.floor(Math.random() * 72) + 1
  
  return {
    id: id || `cust_${Math.random().toString(36).substr(2, 9)}`,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    accountId: `ACC_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    contractStart: new Date(Date.now() - tenure * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    monthlyCharges,
    tenure,
    subscriptionType: ['Basic', 'Standard', 'Premium'][Math.floor(Math.random() * 3)] as any,
    internetType: ['Fiber', 'DSL', 'Cable'][Math.floor(Math.random() * 3)] as any,
    techSupport: Math.random() > 0.6,
    deviceProtection: Math.random() > 0.7,
    paperlessBilling: Math.random() > 0.5,
    paymentMethod: ['Credit Card', 'Bank Transfer', 'Check'][Math.floor(Math.random() * 3)] as any,
    totalCharges: monthlyCharges * tenure,
  }
}

export function generatePrediction(customerId: string, customerName: string): PredictionResult {
  const probability = Math.random() * 100
  const confidence = 80 + Math.random() * 20
  const riskScore = Math.floor(probability)
  
  let riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
  if (probability > 66) riskCategory = 'HIGH'
  else if (probability > 33) riskCategory = 'MEDIUM'
  
  const features = ['Monthly Charges', 'Tenure', 'Internet Type', 'Tech Support', 'Contract Length']
  const topFeatures = features.map((feature, idx) => ({
    feature,
    value: Math.random() * 100,
    shapValue: (Math.random() - 0.5) * 0.8,
    direction: Math.random() > 0.5 ? 'positive' : 'negative',
  }))
  
  return {
    customerId,
    probability: Math.round(probability * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    riskScore,
    riskCategory,
    topFeatures,
    businessSummary: `Customer has ${riskCategory.toLowerCase()} churn risk. ${
      riskCategory === 'HIGH' ? 'Recommend immediate retention offer.' : 'Monitor account regularly.'
    }`,
  }
}

export function generateSHAPExplanation(customerId: string): SHAPExplanation {
  const baseValue = 45
  const finalPrediction = baseValue + (Math.random() - 0.5) * 40
  
  const contributions = [
    { feature: 'Monthly Charges', value: 85, shapValue: 0.38, direction: 'positive' as const },
    { feature: 'Contract Length', value: 12, shapValue: -0.31, direction: 'negative' as const },
    { feature: 'Internet Service', value: 2, shapValue: 0.22, direction: 'positive' as const },
    { feature: 'Tenure', value: 24, shapValue: -0.18, direction: 'negative' as const },
    { feature: 'Tech Support', value: 0, shapValue: -0.15, direction: 'negative' as const },
  ]
  
  return {
    customerId,
    baseValue,
    finalPrediction: Math.round(finalPrediction * 100) / 100,
    contributions,
    businessInterpretation: 'High monthly charges and short contract period are the main drivers of churn risk for this customer.',
    technicalInterpretation: 'The model shows non-linear relationships between features and churn probability. Cost and commitment are key factors.',
    recommendedAction: 'Offer annual contract discount or bundled services to increase commitment and reduce price sensitivity.',
  }
}

export function generateRecommendation(customerId: string, customerName: string): Recommendation {
  const revenueAtRisk = Math.floor(Math.random() * 3000) + 500
  return {
    id: `rec_${Math.random().toString(36).substr(2, 9)}`,
    customerId,
    customerName,
    customerRisk: 40 + Math.random() * 50,
    rootCauses: [
      'High monthly charges relative to service value',
      'Short contract commitment',
      'Lack of premium service adoption',
    ],
    suggestedRetentionOffer: 'Annual contract with 20% discount + 6 months free tech support',
    revenueAtRisk,
    estimatedRevenueSaved: Math.floor(revenueAtRisk * 0.7),
    expectedRetentionSuccess: 65 + Math.random() * 25,
    implementationDifficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)] as any,
    timeline: Math.random() > 0.5 ? '2-3 days' : '1 week',
    priority: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)] as any,
    implementationChecklist: [
      'Send personalized offer email',
      'Schedule CS team call',
      'Prepare discount coupon',
      'Follow up after 3 days',
      'Track customer response',
    ],
    status: ['pending', 'completed', 'archived'][Math.floor(Math.random() * 3)] as any,
    responsibleDepartment: ['Customer Success', 'Sales', 'Retention'][Math.floor(Math.random() * 3)],
  }
}

export function generateAIInsights(): AIInsight[] {
  return [
    {
      feature: 'Monthly Charges',
      shapValue: 0.42,
      interpretation: 'High monthly charges are the strongest predictor of churn',
      recommendation: 'Offer loyalty discounts or bundle deals to reduce perceived cost',
    },
    {
      feature: 'Contract Type',
      shapValue: -0.35,
      interpretation: 'Longer contracts significantly reduce churn risk',
      recommendation: 'Encourage customers to upgrade to annual contracts',
    },
    {
      feature: 'Tech Support',
      shapValue: -0.22,
      interpretation: 'Tech support subscription reduces churn probability',
      recommendation: 'Promote tech support add-on to at-risk customers',
    },
    {
      feature: 'Internet Type',
      shapValue: 0.18,
      interpretation: 'Fiber customers have slightly lower churn risk',
      recommendation: 'Suggest fiber upgrades where available',
    },
  ]
}

export function generateActivityTimeline() {
  return [
    {
      id: '1',
      timestamp: Date.now() - 600000,
      action: 'Prediction Generated',
      description: 'Churn prediction completed for 42 customers',
    },
    {
      id: '2',
      timestamp: Date.now() - 300000,
      action: 'SHAP Explanation Generated',
      description: 'Feature importance analysis completed',
    },
    {
      id: '3',
      timestamp: Date.now() - 180000,
      action: 'Recommendation Created',
      description: 'Retention recommendations generated for 12 at-risk customers',
    },
    {
      id: '4',
      timestamp: Date.now() - 60000,
      action: 'Report Downloaded',
      description: 'Executive summary report downloaded',
    },
  ]
}

export function generateAnalyticsData() {
  return {
    totalCustomers: 8547,
    atRiskCustomers: 342,
    retentionRate: 89.3,
    modelAccuracy: 87.4,
    rocAuc: 0.91,
    f1Score: 0.86,
    predictionsToday: 1203,
    averageRiskScore: 34.2,
    lastTrainingTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).getTime(),
    currentModelVersion: 'v2.4.1',
    accuracy: 87.4,
    precision: 0.89,
    recall: 0.84,
  }
}

export function generateReport(type: Report['type']): Report {
  const statuses: Report['status'][] = ['Ready', 'Generating', 'Failed']
  const status = statuses[Math.floor(Math.random() * 3)]
  
  const descriptions = {
    Executive: 'High-level overview of churn metrics and trends',
    Prediction: 'Detailed customer churn predictions with confidence scores',
    SHAP: 'SHAP-based feature importance and model explainability',
    Recommendation: 'Retention strategies and business recommendations',
    Analytics: 'Comprehensive model performance and analytics metrics',
  }
  
  return {
    id: `rep_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: `${type} Report - ${new Date().toLocaleDateString()}`,
    description: descriptions[type],
    generatedAt: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
    fileSize: Math.floor(Math.random() * 5) + 1,
    downloadUrl: '#',
    status,
  }
}

export function generateAnalyticsCharts(): AnalyticsCharts {
  return {
    metrics: {
      accuracy: 87.4,
      precision: 0.89,
      recall: 0.84,
      f1Score: 0.86,
      rocAuc: 0.91,
    },
    rocCurve: [
      { fpr: 0, tpr: 0, random: 0 },
      { fpr: 0.1, tpr: 0.7, random: 0.1 },
      { fpr: 0.2, tpr: 0.85, random: 0.2 },
      { fpr: 0.3, tpr: 0.91, random: 0.3 },
      { fpr: 0.5, tpr: 0.95, random: 0.5 },
      { fpr: 1, tpr: 1, random: 1 },
    ],
    precisionRecallCurve: [
      { recall: 0, precision: 1 },
      { recall: 0.2, precision: 0.92 },
      { recall: 0.4, precision: 0.88 },
      { recall: 0.6, precision: 0.85 },
      { recall: 0.8, precision: 0.81 },
      { recall: 1, precision: 0.79 },
    ],
    confusionMatrix: { tp: 1420, tn: 6845, fp: 412, fn: 282 },
    featureImportance: [
      { feature: 'Monthly Charges', importance: 0.24 },
      { feature: 'Contract Length', importance: 0.19 },
      { feature: 'Internet Service', importance: 0.16 },
      { feature: 'Tenure', importance: 0.14 },
      { feature: 'Tech Support', importance: 0.11 },
      { feature: 'Payment Method', importance: 0.08 },
      { feature: 'Online Security', importance: 0.05 },
      { feature: 'Device Protection', importance: 0.03 },
    ],
    monthlyChurn: [
      { month: 'Jan', rate: 26.5 },
      { month: 'Feb', rate: 25.8 },
      { month: 'Mar', rate: 24.2 },
      { month: 'Apr', rate: 23.9 },
      { month: 'May', rate: 22.4 },
      { month: 'Jun', rate: 21.8 },
    ],
    revenueAnalysis: [
      { month: 'Jan', actual: 2450000, projected: 2500000 },
      { month: 'Feb', actual: 2480000, projected: 2510000 },
      { month: 'Mar', actual: 2520000, projected: 2520000 },
      { month: 'Apr', actual: 2560000, projected: 2540000 },
      { month: 'May', actual: 2610000, projected: 2580000 },
      { month: 'Jun', actual: 2650000, projected: 2620000 },
    ],
    riskDistribution: [
      { name: 'Low Risk', value: 72 },
      { name: 'Medium Risk', value: 18 },
      { name: 'High Risk', value: 10 },
    ],
    predictionConfidence: Array.from({ length: 20 }, (_, i) => ({
      x: i,
      y: 75 + Math.random() * 25,
    })),
    segmentPerformance: [
      { segment: 'Premium', accuracy: 89.2, churnRate: 18.5, retention: 81.5 },
      { segment: 'Standard', accuracy: 87.1, churnRate: 22.3, retention: 77.7 },
      { segment: 'Basic', accuracy: 84.3, churnRate: 28.9, retention: 71.1 },
    ],
  }
}
