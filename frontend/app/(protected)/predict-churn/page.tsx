'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PredictionResult } from '@/lib/types'
import { predictChurnById } from '@/services/predict'
import { Loader2, ArrowRight, MessageSquare, Search } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

const searchSchema = z.object({
  customerId: z.string().min(1, 'Please enter a valid Customer ID'),
})

type SearchFormData = z.infer<typeof searchSchema>

export default function PredictChurnPage() {
  const [step, setStep] = useState<'form' | 'results'>('form')
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [customerDetails, setCustomerDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      customerId: '7795-CFOCW',
    },
  })

  const onSubmit = async (data: SearchFormData) => {
    setIsLoading(true)
    try {
      const result = await predictChurnById(data.customerId.trim())
      setPrediction(result)
      setCustomerDetails(result.customerDetails)
      setStep('results')
      toast.success('Customer data loaded & inference completed!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Customer ID not found in dataset.')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'results' && prediction) {
    return (
      <PredictionResults 
        prediction={prediction} 
        customerDetails={customerDetails} 
        onReset={() => setStep('form')} 
      />
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pt-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Predict Customer Churn by ID</h1>
        <p className="text-muted-foreground mt-2">
          Enter any valid Customer ID from your Telco dataset to instantly pull profile data and run LightGBM inference.
        </p>
      </div>

      <Card className="border-border bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-foreground text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" /> Dataset Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Customer ID (e.g. 7795-CFOCW, 5575-GNVDE)</label>
              <div className="flex gap-3 mt-2">
                <Input
                  {...form.register('customerId')}
                  placeholder="Enter Customer ID..."
                  className="bg-muted/50 border-input text-lg py-5"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/95 px-8 py-5 text-base"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Analyze <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              {form.formState.errors.customerId && (
                <p className="text-xs text-red-400 mt-1">{form.formState.errors.customerId.message}</p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function PredictionResults({
  prediction,
  customerDetails,
  onReset,
}: {
  prediction: PredictionResult
  customerDetails: any
  onReset: () => void
}) {
  const getRiskColor = (category: string) => {
    switch (category) {
      case 'HIGH':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'LOW':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      default:
        return ''
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analysis for ID: {prediction.customerId}</h1>
          <p className="text-muted-foreground mt-1">Pulled directly from dataset & evaluated via LightGBM</p>
        </div>
        <Button variant="outline" onClick={onReset}>
          Search Another ID
        </Button>
      </div>

      {/* Customer Profile Summary Card */}
      {customerDetails && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground text-sm font-medium uppercase tracking-wider text-primary">
              Retrieved Customer Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Contract</p>
              <p className="font-semibold text-foreground mt-0.5">{customerDetails.Contract}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Tenure</p>
              <p className="font-semibold text-foreground mt-0.5">{customerDetails.tenure} Months</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Monthly Charges</p>
              <p className="font-semibold text-foreground mt-0.5">${customerDetails.MonthlyCharges}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Internet Service</p>
              <p className="font-semibold text-foreground mt-0.5">{customerDetails.InternetService}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-muted" strokeWidth="6" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      className="text-primary"
                      strokeWidth="6"
                      strokeDasharray={`${2.827 * prediction.probability} 282.7`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">{Math.round(prediction.probability)}%</span>
                    <span className="text-xs text-muted-foreground">Churn Risk</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Probability Score</p>
                  <p className="text-2xl font-bold text-foreground">{prediction.probability.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Risk Category</p>
                  <Badge className={`${getRiskColor(prediction.riskCategory)} border`}>
                    {prediction.riskCategory}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Actual Churn Status</p>
              <p className="text-xl font-bold text-foreground">{customerDetails?.Churn || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payment Method</p>
              <p className="text-sm font-semibold text-foreground">{customerDetails?.PaymentMethod}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Recommended Business Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{prediction.businessSummary}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}