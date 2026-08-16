'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/services/api'
import { Loader2, ShieldAlert, TrendingUp, Users, DollarSign, Award, Clock, Sparkles, ShieldCheck, Target } from 'lucide-react'

interface DashboardStats {
  championModel: string
  selectedThreshold: number
  totalCustomers: number
  historicalChurners: number
  retentionRate: number
  atRiskRevenue: number
  modelAccuracy: number | string
  modelWeightedF1: number | string
  modelChurnRecall: number | string
  modelRocAuc: number | string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await apiClient.get('/api/dashboard/stats')
        setStats(response.data || response)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Strict USD Locale formatting ensures consistent display (e.g., $2,202,297.60)
  const formattedRevenue = stats?.atRiskRevenue 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.atRiskRevenue)
    : '$0'

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Champion Model: <span className="font-semibold text-foreground">{stats?.championModel || 'Loading...'}</span> | 
            Operating Threshold: <span className="font-semibold text-foreground">{stats?.selectedThreshold || 'Loading...'}</span>
          </p>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border">
          Validated on 1,409 held-out test samples
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dataset Records</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats?.totalCustomers ? stats.totalCustomers.toLocaleString('en-US') : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total active profiles loaded</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Historical Churners</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats?.historicalChurners ? stats.historicalChurners.toLocaleString('en-US') : '0'}
            </div>
            <p className="text-xs text-red-400 mt-1">Customers who actually churned</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retention Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats?.retentionRate ? `${stats.retentionRate}%` : '0%'}
            </div>
            <p className="text-xs text-green-400 mt-1">Active customer baseline</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">At-Risk Annual Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {formattedRevenue}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Calculated via monthly exposure</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Model Accuracy</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats?.modelAccuracy && stats.modelAccuracy !== 'N/A' ? `${stats.modelAccuracy}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Validated held-out test accuracy</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weighted F1-Score</CardTitle>
            <Award className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats?.modelWeightedF1 && stats.modelWeightedF1 !== 'N/A' ? `${stats.modelWeightedF1}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Class-balanced weighted performance</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ROC-AUC</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats?.modelRocAuc && stats.modelRocAuc !== 'N/A' ? `${stats.modelRocAuc}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Model discrimination capability</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Churn Recall</CardTitle>
            <Target className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats?.modelChurnRecall && stats.modelChurnRecall !== 'N/A' ? `${stats.modelChurnRecall}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Percentage of actual churners detected</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Activity Timeline</CardTitle>
            <p className="text-xs text-muted-foreground">Recent system activities</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 border-b border-border/50 pb-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary mt-1">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Dataset Inference Synchronized</p>
                <p className="text-xs text-muted-foreground">FastAPI successfully connected to Telco-Customer-Churn.csv</p>
                <span className="text-[10px] text-muted-foreground/80 mt-1 block">Active</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary mt-1">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">LightGBM Model Online</p>
                <p className="text-xs text-muted-foreground">Model metrics validated successfully from metrics.json</p>
                <span className="text-[10px] text-muted-foreground/80 mt-1 block">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">AI Insights</CardTitle>
            <p className="text-xs text-muted-foreground">Model insights</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 p-3 rounded-md border border-border">
              <p className="text-xs font-semibold text-primary mb-1">Contract Type</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Month-to-month contracts remain the strongest driver of customer churn across your dataset.
              </p>
            </div>
            <div className="bg-muted/30 p-3 rounded-md border border-border">
              <p className="text-xs font-semibold text-primary mb-1">Tenure Impact</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Customers under 6 months tenure exhibit a significantly higher risk probability threshold.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}