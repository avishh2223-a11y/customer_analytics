import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const storage = localStorage.getItem('auth-storage')
    if (storage) {
      try {
        const parsed = JSON.parse(storage)
        const token = parsed?.state?.token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (e) {
        console.error('Failed to parse auth token', e)
      }
    }
  }
  return config
})

export interface ChurnPredictionPayload {
  credit_score: number
  age: number
  tenure: number
  balance: number
  num_of_products: number
  has_cr_card: number
  is_active_member: number
  estimated_salary: number
  geography?: string
  gender?: string
}

export interface ChurnPredictionResponse {
  churn_probability: number
  prediction: boolean
  risk_level: string
  shap_values?: Record<string, number>
}

export const predictChurn = async (data: ChurnPredictionPayload): Promise<ChurnPredictionResponse> => {
  const response = await api.post<ChurnPredictionResponse>('/api/predict', data)
  return response.data
}

export default api