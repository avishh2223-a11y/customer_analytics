'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, BarChart3, Database, Gauge, Loader2, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react'
import { adaptiveApi, type Dataset, type Project, type RiskSummary } from '@/services/adaptive'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type BarDatum = { label: string; value: number; color: string }

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState('')
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [risk, setRisk] = useState<RiskSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProject = async (selectedProjectId: string, refresh = false) => {
    if (!selectedProjectId) return
    setLoading(true)
    setError('')
    setDataset(null)
    setRisk(null)
    try {
      const nextDataset = await adaptiveApi.getLatestDataset(selectedProjectId)
      setDataset(nextDataset)
      if (nextDataset.activeModel?.problemType === 'binary_classification') {
        try {
          setRisk(await adaptiveApi.riskSummary(selectedProjectId, nextDataset.id, refresh))
        } catch {
          setRisk(null)
        }
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load dataset insights.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    adaptiveApi.listProjects()
      .then((items) => {
        setProjects(items)
        const saved = typeof window !== 'undefined' ? localStorage.getItem('adaptive_project_id') : null
        const nextId = items.some((item) => item.id === saved) ? saved as string : items[0]?.id ?? ''
        setProjectId(nextId)
        if (nextId) void loadProject(nextId)
        else setLoading(false)
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Unable to load projects.')
        setLoading(false)
      })
  }, [])

  const profileInsights = useMemo(() => {
    const columns = dataset?.profile.columns ?? []
    const typeCounts = columns.reduce<Record<string, number>>((counts, column) => {
      const type = column.inferredType.toLowerCase().includes('numeric')
        ? 'Numeric'
        : column.inferredType.toLowerCase().includes('date')
          ? 'Date'
          : 'Categorical'
      counts[type] = (counts[type] ?? 0) + 1
      return counts
    }, {})
    const missingCells = columns.reduce((sum, column) => sum + column.missingCount, 0)
    const totalCells = (dataset?.rowCount ?? 0) * (dataset?.columnCount ?? 0)
    const missingRate = totalCells ? (missingCells / totalCells) * 100 : 0
    const qualityBars: BarDatum[] = [
      { label: 'Complete cells', value: Math.max(0, 100 - missingRate), color: 'bg-emerald-500' },
      { label: 'Missing cells', value: missingRate, color: 'bg-amber-400' },
      { label: 'Duplicate rows', value: dataset?.rowCount ? (dataset.profile.duplicateRows / dataset.rowCount) * 100 : 0, color: 'bg-rose-500' },
    ]
    const typeBars: BarDatum[] = [
      { label: 'Numeric', value: typeCounts.Numeric ?? 0, color: 'bg-cyan-500' },
      { label: 'Categorical', value: typeCounts.Categorical ?? 0, color: 'bg-indigo-500' },
      { label: 'Date', value: typeCounts.Date ?? 0, color: 'bg-violet-500' },
    ]
    return { missingRate, qualityBars, typeBars }
  }, [dataset])

  const handleProjectChange = (nextId: string) => {
    setProjectId(nextId)
    localStorage.setItem('adaptive_project_id', nextId)
    void loadProject(nextId)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-600">Data Explorer</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Dataset Insights</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            See data quality, schema composition, and model risk at a glance. Raw records and column dumps stay out of the executive view.
          </p>
        </div>
        <div className="flex gap-2">
          <select value={projectId} onChange={(event) => handleProjectChange(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
            <option value="">Select a project</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <Button variant="outline" size="sm" disabled={!projectId || loading} onClick={() => void loadProject(projectId, true)}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </header>

      {error && <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
      {loading && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Calculating dataset insights…</div>}

      {!loading && !dataset && !error && (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center"><Database className="h-10 w-10 text-cyan-500" /><h2 className="text-lg font-semibold">No dataset to explore yet</h2><p className="max-w-md text-sm text-slate-500">Create a project and upload a CSV in Dataset Manager to unlock data-quality and risk insights.</p></CardContent></Card>
      )}

      {dataset && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InsightMetric label="Records analyzed" value={dataset.rowCount.toLocaleString()} icon={<Database className="h-5 w-5" />} />
            <InsightMetric label="Data completeness" value={`${(100 - profileInsights.missingRate).toFixed(1)}%`} icon={<Gauge className="h-5 w-5" />} />
            <InsightMetric label="At-risk customers" value={risk ? `${risk.riskPercentage.toFixed(1)}%` : 'Model required'} icon={<ShieldAlert className="h-5 w-5" />} />
            <InsightMetric label="Target readiness" value={dataset.target ? dataset.target : 'Needs confirmation'} icon={<Sparkles className="h-5 w-5" />} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <InsightBars title="Dataset composition" description="How the uploaded fields are distributed by inferred data type." data={profileInsights.typeBars} />
            <InsightBars title="Data quality signal" description="Percent of the dataset affected by missing or duplicate records." data={profileInsights.qualityBars} percentage />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-cyan-600" />Model risk snapshot</CardTitle><CardDescription>Dataset-wide scoring using the saved production threshold.</CardDescription></CardHeader>
              <CardContent>
                {risk ? <div className="space-y-5"><div className="flex h-7 overflow-hidden rounded-full bg-emerald-100"><div className="bg-rose-500 transition-all" style={{ width: `${risk.riskPercentage}%` }} /><div className="flex-1" /></div><div className="grid grid-cols-2 gap-3"><Stat label="At risk" value={risk.atRiskCount.toLocaleString()} tone="rose" /><Stat label="Lower risk" value={risk.safeCount.toLocaleString()} tone="emerald" /><Stat label="Threshold" value={risk.threshold.toFixed(3)} /><Stat label="Revenue at risk" value={risk.revenueAtRisk === null ? 'Not detected' : risk.revenueAtRisk.toLocaleString(undefined, { maximumFractionDigits: 2 })} /></div></div> : <EmptyInsight text="Train a binary classification model to calculate dataset-wide risk." />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>What needs attention</CardTitle><CardDescription>Signals from profiling, summarized for action.</CardDescription></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <AttentionRow label="Target" value={dataset.target ? `${dataset.target} confirmed` : 'Confirm a target before training'} alert={!dataset.target} />
                <AttentionRow label="Duplicate records" value={dataset.profile.duplicateRows ? `${dataset.profile.duplicateRows.toLocaleString()} detected` : 'None detected'} alert={dataset.profile.duplicateRows > 0} />
                <AttentionRow label="Identifier" value={dataset.profile.identifierCandidates[0]?.column ?? 'No identifier detected'} />
                <AttentionRow label="Leakage review" value={dataset.profile.columns.some((column) => column.warnings.includes('leakage')) ? 'Review flagged fields' : 'No automatic flags'} alert={dataset.profile.columns.some((column) => column.warnings.includes('leakage'))} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function InsightMetric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <Card><CardContent className="flex items-center gap-3 p-5"><div className="rounded-xl bg-cyan-100 p-3 text-cyan-700">{icon}</div><div><p className="text-xs font-medium uppercase text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div></CardContent></Card>
}

function InsightBars({ title, description, data, percentage = false }: { title: string; description: string; data: BarDatum[]; percentage?: boolean }) {
  const max = Math.max(...data.map((item) => item.value), 1)
  return <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className="space-y-4">{data.map((item) => <div key={item.label}><div className="mb-1 flex justify-between text-sm"><span className="font-medium text-slate-700">{item.label}</span><span className="text-slate-500">{percentage ? `${item.value.toFixed(1)}%` : item.value}</span></div><div className="h-3 rounded-full bg-slate-100"><div className={`h-3 rounded-full ${item.color}`} style={{ width: `${Math.max(item.value / max * 100, item.value > 0 ? 5 : 0)}%` }} /></div></div>)}</CardContent></Card>
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'rose' | 'emerald' }) {
  return <div className={`rounded-xl border p-3 ${tone === 'rose' ? 'border-rose-100 bg-rose-50' : tone === 'emerald' ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>
}

function AttentionRow({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"><span className="text-slate-500">{label}</span><span className={`text-right font-medium ${alert ? 'text-amber-700' : 'text-slate-800'}`}>{value}</span></div>
}

function EmptyInsight({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">{text}</div>
}
