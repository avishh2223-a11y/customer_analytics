'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/services/api'
import { Loader2, BarChart3, Activity, TrendingUp, DollarSign } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await apiClient.get('/api/analytics')
        setAnalytics(response.data || response)
      } catch (error) {
        console.error('Failed to load advanced analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Transform data for Recharts conditional churn percentages
  const contractChurnData = Object.entries(analytics?.contractChurnRate || {}).map(([name, value]) => ({ name, value }))
  const internetChurnData = Object.entries(analytics?.internetChurnRate || {}).map(([name, value]) => ({ name, value }))
  const paymentChurnData = Object.entries(analytics?.paymentChurnRate || {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Exploratory Data Analysis & Churn Drivers</h1>
        <p className="text-muted-foreground mt-2">
          Advanced statistical distributions and conditional churn rates computed dynamically from your 7,043 Telco records.
        </p>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Churn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{analytics?.overallChurnRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Baseline dataset attrition</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">At-Risk Annual Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ${(analytics?.totalAtRiskRevenue / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total revenue exposure from churned profiles</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Tenure</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{analytics?.avgTenure} Mos</div>
            <p className="text-xs text-muted-foreground mt-1">Lifecycle duration across records</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mean Monthly Bill</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${analytics?.avgMonthlyCharges}</div>
            <p className="text-xs text-muted-foreground mt-1">Average monthly billing per user</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Conditional Churn Rate Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Churn Risk Bar Chart */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-400" /> Attrition Risk by Contract Type (%)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contractChurnData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Internet Service Churn Rate */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Attrition Risk by Internet Service (%)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={internetChurnData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods Churn Impact */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" /> Churn Probability Breakdown by Payment Method (%)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentChurnData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} interval={0} />
                <YAxis stroke="#9ca3af" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}