import { Recommendation } from '@/lib/types'
import { generateRecommendation, generateCustomer } from '@/lib/generators'
import { apiClient } from './api'

/**
 * Get all recommendations for all at-risk customers
 * 
 * Backend ready: Replace with:
 * return await apiClient.get('/recommendations')
 */
export async function getAllRecommendations(): Promise<Recommendation[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200))
  
  // TODO: Replace with real API call
  // return await apiClient.get('/recommendations')
  
  return mockGetAllRecommendations()
}

function mockGetAllRecommendations(): Recommendation[] {
  // Generate 12-15 recommendations for different customers
  const count = 12 + Math.floor(Math.random() * 4)
  return Array.from({ length: count }, (_, i) => {
    const customer = generateCustomer(`cust_${i}`)
    return generateRecommendation(customer.id, `${customer.firstName} ${customer.lastName}`)
  })
}

/**
 * Get recommendations for a specific customer
 * 
 * Backend ready: Replace with:
 * return await apiClient.get(`/recommendations/${customerId}`)
 */
export async function getCustomerRecommendations(
  customerId: string,
  customerName: string
): Promise<Recommendation> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))
  
  // TODO: Replace with real API call
  // return await apiClient.get(`/recommendations/${customerId}`)
  
  return mockGetCustomerRecommendations(customerId, customerName)
}

function mockGetCustomerRecommendations(customerId: string, customerName: string): Recommendation {
  return generateRecommendation(customerId, customerName)
}

/**
 * Update recommendation status
 * 
 * Backend ready: Replace with:
 * return await apiClient.patch(`/recommendations/${recommendationId}`, { status })
 */
export async function updateRecommendationStatus(
  recommendationId: string,
  status: 'pending' | 'completed' | 'archived'
): Promise<Recommendation> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  // TODO: Replace with real API call
  // return await apiClient.patch(`/recommendations/${recommendationId}`, { status })
  
  // Mock: return updated recommendation
  const customer = generateCustomer(recommendationId)
  const rec = generateRecommendation(customer.id, customer.firstName)
  rec.status = status
  return rec
}

/**
 * Get recommendations by priority
 * 
 * Backend ready: Replace with:
 * return await apiClient.get(`/recommendations?priority=${priority}`)
 */
export async function getRecommendationsByPriority(
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
): Promise<Recommendation[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  
  // TODO: Replace with real API call
  // return await apiClient.get(`/recommendations?priority=${priority}`)
  
  const allRecs = await getAllRecommendations()
  return allRecs.filter((r) => r.priority === priority)
}
