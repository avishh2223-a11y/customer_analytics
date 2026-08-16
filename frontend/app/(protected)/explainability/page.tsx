'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { apiClient } from '@/services/api'
import { Loader2, BrainCircuit, AlertCircle } from 'lucide-react'

interface ShapFeature {
  feature: string
  importance: number
}

export default function ExplainabilityPage() {
  const [features, setFeatures] = useState<ShapFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchShapValues() {
      try {
        const response = await apiClient.get('/api/explainability/global')
        setFeatures(response.data || response)
      } catch (err) {
        console.error('Failed to fetch SHAP values:', err)
        setError('Failed to load explainability data from the model. Check backend logs.')
      } finally {
        setLoading(false)
      }
    }
    fetchShapValues()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4 text-red-400">
        <AlertCircle className="h-10 w-10" />
        <p>{error}</p>
      </div>
    )
  }

  const maxImportance = features.length > 0 ? Math.max(...features.map(f => f.importance)) : 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Model Explainability & Feature Importance</h1>
        <p className="text-muted-foreground mt-2">
          Understand the underlying decision drivers powering your LightGBM churn predictions.
        </p>
      </div>

      <Card className="border-border bg-card max-w-4xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <CardTitle>Global SHAP Values</CardTitle>
          </div>
          <CardDescription>
            Mean absolute SHAP (SHapley Additive exPlanations) values calculated directly from the champion model. 
            Longer bars indicate features that have the highest overall impact on the model's predictions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {features.length === 0 ? (
              <p className="text-muted-foreground text-sm">No feature importance data available.</p>
            ) : (
              features.map((item, index) => {
                const relativeWidth = (item.importance / maxImportance) * 100
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-sm gap-4">
                      <span className="font-medium text-foreground truncate max-w-[70%]" title={item.feature}>
                        {item.feature}
                      </span>
                      <span className="text-muted-foreground font-mono text-xs">
                        {item.importance.toFixed(4)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                        style={{ width: `${relativeWidth}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}