import { PredictionResult, SHAPExplanation, Recommendation } from '@/lib/types'
import { apiClient } from './api'

/**
 * Predict churn for a customer by their dataset Customer ID.
 */
export async function predictChurnById(customerId: string): Promise<PredictionResult & { customerId: string; customerDetails: any }> {
  try {
    const response = await apiClient.get(`/api/predict-by-id/${customerId}`)
    return response.data || response
  } catch (error) {
    console.error('Error in predictChurnById API call:', error)
    throw error
  }
}

// Alias export to prevent any import mismatches across components
export const predictChurn = predictChurnById

/**
 * Explain a prediction using real backend SHAP values
 */
export async function explainPrediction(customerId: string): Promise<SHAPExplanation> {
  try {
    const response = await apiClient.post('/api/explain', { customerId })
    return response.data || response
  } catch (error) {
    console.error('Error in explainPrediction API call:', error)
    throw error
  }
}

/**
 * Get dynamic recommendations for a customer from Python business rules engine
 */
export async function getRecommendations(customerId: string, customerName: string): Promise<Recommendation> {
  try {
    const response = await apiClient.get(`/api/recommendations/${customerId}`)
    return response.data || response
  } catch (error) {
    console.error('Error in getRecommendations API call:', error)
    throw error
  }
}

/**
 * Get prediction history for a customer
 */
export async function getPredictionHistory(customerId: string): Promise<PredictionResult[]> {
  try {
    const response = await apiClient.get(`/api/predictions/${customerId}/history`)
    return response.data || response
  } catch (error) {
    console.error('Error in getPredictionHistory API call:', error)
    return []
  }
}