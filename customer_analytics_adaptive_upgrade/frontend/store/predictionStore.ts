import { create } from 'zustand'

export interface Prediction {
  id: string
  customerId: string
  customerName: string
  riskScore: number
  probability: number
  confidence: number
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH'
  timestamp: number
  topFeatures: Array<{ name: string; shap: number }>
}

interface PredictionState {
  predictions: Prediction[]
  currentPrediction: Prediction | null
  isLoading: boolean
  error: string | null
  
  setPredictions: (predictions: Prediction[]) => void
  setCurrentPrediction: (prediction: Prediction | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addPrediction: (prediction: Prediction) => void
  clearError: () => void
}

export const usePredictionStore = create<PredictionState>((set) => ({
  predictions: [],
  currentPrediction: null,
  isLoading: false,
  error: null,

  setPredictions: (predictions) => set({ predictions }),
  setCurrentPrediction: (prediction) => set({ currentPrediction: prediction }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  addPrediction: (prediction) =>
    set((state) => ({ predictions: [prediction, ...state.predictions] })),
  clearError: () => set({ error: null }),
}))
