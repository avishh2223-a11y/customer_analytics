import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth-storage')
      if (token) {
        try {
          const authData = JSON.parse(token)
          if (authData.state?.user?.token) {
            config.headers.Authorization = `Bearer ${authData.state.user.token}`
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      return config
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('auth-storage')
          //window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

export const apiClient = new APIClient()

// Health check for API
export async function checkAPIHealth() {
  try {
    // TODO: Replace with real API call
    // return await apiClient.get('/health')
    await new Promise((resolve) => setTimeout(resolve, 200))
    return { status: 'healthy', version: 'v2.4.1' }
  } catch (error) {
    console.error('API health check failed:', error)
    return { status: 'unhealthy', error: String(error) }
  }
}
