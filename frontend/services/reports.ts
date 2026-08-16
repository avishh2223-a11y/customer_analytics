import { Report } from '@/lib/types'
import { generateReport } from '@/lib/generators'
import { apiClient } from './api'

/**
 * Get all generated reports
 * 
 * Backend ready: Replace with:
 * return await apiClient.get('/reports')
 */
export async function getAllReports(): Promise<Report[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  
  // TODO: Replace with real API call
  // return await apiClient.get('/reports')
  
  return mockGetAllReports()
}

function mockGetAllReports(): Report[] {
  // Generate 6-10 mock reports
  const count = 6 + Math.floor(Math.random() * 5)
  return Array.from({ length: count }, (_, i) => {
    const types: Report['type'][] = ['Executive', 'Prediction', 'SHAP', 'Recommendation', 'Analytics']
    return generateReport(types[i % types.length])
  })
}

/**
 * Generate a specific report
 * 
 * Backend ready: Replace with:
 * return await apiClient.post('/reports/generate', { type })
 */
export async function generateReportByType(type: Report['type']): Promise<Report> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500))
  
  // TODO: Replace with real API call
  // return await apiClient.post('/reports/generate', { type })
  
  return mockGenerateReport(type)
}

function mockGenerateReport(type: Report['type']): Report {
  return generateReport(type)
}

/**
 * Delete a report
 * 
 * Backend ready: Replace with:
 * return await apiClient.delete(`/reports/${reportId}`)
 */
export async function deleteReport(reportId: string): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  // TODO: Replace with real API call
  // return await apiClient.delete(`/reports/${reportId}`)
}

/**
 * Archive a report
 * 
 * Backend ready: Replace with:
 * return await apiClient.patch(`/reports/${reportId}`, { archived: true })
 */
export async function archiveReport(reportId: string): Promise<Report> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  // TODO: Replace with real API call
  // return await apiClient.patch(`/reports/${reportId}`, { archived: true })
  
  return generateReport('Executive')
}

/**
 * Share a report
 * 
 * Backend ready: Replace with:
 * return await apiClient.post(`/reports/${reportId}/share`, { email })
 */
export async function shareReport(reportId: string, email: string): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))
  
  // TODO: Replace with real API call
  // return await apiClient.post(`/reports/${reportId}/share`, { email })
}
