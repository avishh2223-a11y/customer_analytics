import { AnalyticsMetrics, AnalyticsCharts } from '@/lib/types'
import { generateAnalyticsData, generateAnalyticsCharts } from '@/lib/generators'
import { apiClient } from './api'

export interface AnalyticsFilter {
  dateRange?: { start: string; end: string }
  segment?: string
  contractType?: string
  internetType?: string
  paymentMethod?: string
}

/**
 * Get analytics metrics
 * 
 * Backend ready: Replace with:
 * return await apiClient.get('/analytics/metrics', { params: filters })
 */
export async function getAnalyticsMetrics(filters?: AnalyticsFilter): Promise<AnalyticsMetrics> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  
  // TODO: Replace with real API call
  // return await apiClient.get('/analytics/metrics', { params: filters })
  
  return mockGetAnalyticsMetrics()
}

function mockGetAnalyticsMetrics(): AnalyticsMetrics {
  return generateAnalyticsData()
}

/**
 * Get comprehensive analytics charts data
 * 
 * Backend ready: Replace with:
 * return await apiClient.get('/analytics/charts', { params: filters })
 */
export async function getAnalyticsCharts(filters?: AnalyticsFilter): Promise<AnalyticsCharts> {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  
  // TODO: Replace with real API call
  // return await apiClient.get('/analytics/charts', { params: filters })
  
  return mockGetAnalyticsCharts()
}

function mockGetAnalyticsCharts(): AnalyticsCharts {
  return generateAnalyticsCharts()
}

/**
 * Get ROC curve data
 */
export async function getRocCurveData(filters?: AnalyticsFilter) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  
  // Mock data
  return {
    name: 'ROC Curve',
    data: [
      { fpr: 0, tpr: 0 },
      { fpr: 0.1, tpr: 0.7 },
      { fpr: 0.2, tpr: 0.85 },
      { fpr: 0.3, tpr: 0.91 },
      { fpr: 0.5, tpr: 0.95 },
      { fpr: 1, tpr: 1 },
    ],
    auc: 0.91,
  }
}

/**
 * Get precision-recall curve data
 */
export async function getPrecisionRecallData(filters?: AnalyticsFilter) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  
  return {
    name: 'Precision-Recall',
    data: [
      { recall: 0, precision: 1 },
      { recall: 0.2, precision: 0.95 },
      { recall: 0.4, precision: 0.92 },
      { recall: 0.6, precision: 0.88 },
      { recall: 0.8, precision: 0.82 },
      { recall: 1, precision: 0.65 },
    ],
    auc: 0.88,
  }
}

/**
 * Get confusion matrix
 */
export async function getConfusionMatrixData(filters?: AnalyticsFilter) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  return {
    truePositives: 234,
    falsePositives: 45,
    trueNegatives: 2156,
    falseNegatives: 34,
  }
}

/**
 * Get feature importance data
 */
export async function getFeatureImportanceData(filters?: AnalyticsFilter) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  
  return [
    { feature: 'Monthly Charges', importance: 0.38 },
    { feature: 'Contract Length', importance: 0.31 },
    { feature: 'Internet Type', importance: 0.22 },
    { feature: 'Tenure', importance: 0.18 },
    { feature: 'Tech Support', importance: 0.15 },
    { feature: 'Payment Method', importance: 0.12 },
    { feature: 'Device Protection', importance: 0.09 },
    { feature: 'Online Security', importance: 0.08 },
    { feature: 'Paperless Billing', importance: 0.07 },
    { feature: 'Subscription Type', importance: 0.06 },
  ]
}

/**
 * Get monthly churn trend
 */
export async function getMonthlyChurnTrend(filters?: AnalyticsFilter) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map((month, idx) => ({
    month,
    churnRate: 8 + Math.random() * 6,
    churned: Math.floor(Math.random() * 150) + 50,
  }))
}

/**
 * Get customer lifetime value distribution
 */
export async function getCustomerLTVData(filters?: AnalyticsFilter) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  return [
    { range: '$0-$1000', count: 450 },
    { range: '$1000-$3000', count: 1200 },
    { range: '$3000-$5000', count: 2800 },
    { range: '$5000-$10000', count: 2400 },
    { range: '$10000+', count: 1697 },
  ]
}

/**
 * Get churn distribution by contract type
 */
export async function getChurnByContractType(filters?: AnalyticsFilter) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  return [
    { name: 'Month-to-Month', value: 42, churnRate: 42 },
    { name: '1 Year', value: 22, churnRate: 12 },
    { name: '2 Year', value: 36, churnRate: 3 },
  ]
}

/**
 * Get revenue analysis
 */
export async function getRevenueAnalysisData(filters?: AnalyticsFilter) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 50000) + 200000,
    churnImpact: Math.floor(Math.random() * 15000) + 5000,
  }))
}
