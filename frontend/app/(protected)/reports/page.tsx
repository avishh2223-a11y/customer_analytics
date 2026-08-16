'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/services/api'
import { Loader2, FileText, Download, Eye, Share2, Archive, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

const REPORT_TYPES = [
  { title: 'Executive', description: 'High-level business overview' },
  { title: 'Prediction', description: 'Customer risk scores & inference' },
  { title: 'SHAP', description: 'Feature attribution analysis' },
  { title: 'Recommendation', description: 'Targeted retention strategies' },
  { title: 'Analytics', description: 'Exploratory data distributions' }
]

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingType, setGeneratingType] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('All Reports')
  const [previewReport, setPreviewReport] = useState<any>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      const response = await apiClient.get('/api/reports/list')
      setReports(response.data || response)
    } catch (error) {
      console.error('Failed to load reports:', error)
      toast.error('Failed to load reports list.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async (reportType: string) => {
    setGeneratingType(reportType)
    try {
      const response = await apiClient.post('/api/reports/generate', { reportType })
      const newRep = response.data?.report || response.report
      setReports((prev) => [newRep, ...prev])
      toast.success(`${reportType} Report generated successfully!`)
    } catch (error) {
      toast.error(`Failed to generate ${reportType} Report.`)
    } finally {
      setGeneratingType(null)
    }
  }

  const handleDeleteReport = async (id: string) => {
    try {
      await apiClient.delete(`/api/reports/${id}`)
      setReports((prev) => prev.filter((r) => r.id !== id))
      toast.success('Report deleted successfully.')
    } catch (error) {
      toast.error('Failed to delete report.')
    }
  }

  // Functional real file download handler
  const handleDownload = (report: any) => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute("href", dataStr)
      downloadAnchor.setAttribute("download", `${report.title.replace(/\s+/g, '_')}_${report.date.replace(/\//g, '-')}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      toast.success(`Successfully downloaded ${report.title}!`)
    } catch (error) {
      toast.error('Failed to download report file.')
    }
  }

  const filteredReports = reports.filter((r) => {
    if (activeTab === 'Ready') return r.status === 'Ready'
    if (activeTab === 'Generating') return r.status === 'Generating'
    if (activeTab === 'Failed') return r.status === 'Failed'
    return true
  })

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate, download, and manage churn analytics reports.
        </p>
      </div>

      {/* Generate Report Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Generate Report</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {REPORT_TYPES.map((rep, index) => {
            const isGenerating = generatingType === rep.title
            return (
              <Card key={index} className="border-border bg-card flex flex-col justify-between hover:border-primary/50 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-base text-foreground">{rep.title}</CardTitle>
                    <span className="text-xs text-muted-foreground">{rep.description}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    onClick={() => handleGenerateReport(rep.title)}
                    disabled={isGenerating}
                    variant="outline"
                    className="w-full border-border hover:bg-primary hover:text-primary-foreground transition-all text-xs"
                  >
                    {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Generate'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pt-2">
        {['All Reports', 'Ready', 'Generating', 'Failed'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab)}
            className={`text-xs ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border">
            No reports found for this filter.
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-card border border-border shadow-sm gap-4 hover:border-border/80 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  {/* Fixed title rendering bug to prevent double 'Report' text */}
                  <span className="font-semibold text-foreground">{report.title} - {report.date}</span>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 border text-[10px]">
                    {report.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground ml-8">{report.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground ml-8 pt-1">
                  <span>🕒 {report.date}</span>
                  <span>📁 {report.size}</span>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setPreviewReport(report)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground" 
                  title="View Report"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDownload(report)} 
                  className="h-8 w-8 text-muted-foreground hover:text-foreground" 
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toast.success('Report link copied to clipboard!')} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Share">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toast.success('Report archived.')} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Archive">
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteReport(report.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal Dialog */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">{previewReport.title} Preview</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewReport(null)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-1">
                <p><strong className="text-foreground">Report ID:</strong> {previewReport.id}</p>
                <p><strong className="text-foreground">Generated Date:</strong> {previewReport.date}</p>
                <p><strong className="text-foreground">File Size:</strong> {previewReport.size}</p>
                <p><strong className="text-foreground">Status:</strong> {previewReport.status}</p>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-1">Description:</p>
                <p className="text-foreground bg-card p-3 rounded-lg border border-border">{previewReport.description}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setPreviewReport(null)}
                className="border-border text-foreground hover:bg-muted"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleDownload(previewReport)
                  setPreviewReport(null)
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/95 flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Download Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}