'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Database, Loader2, Search, ShieldCheck, User } from 'lucide-react'
import { adaptiveApi, type Dataset, type Project } from '@/services/adaptive'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function AdaptivePredictionsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState('')
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [customerKey, setCustomerKey] = useState('')
  const [recentCustomers, setRecentCustomers] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingDataset, setFetchingDataset] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    adaptiveApi
      .listProjects()
      .then(async (items) => {
        setProjects(items)
        const savedProjectId = typeof window !== 'undefined' ? localStorage.getItem('adaptive_project_id') : null
        const targetId = items.some((p) => p.id === savedProjectId) ? (savedProjectId as string) : items[0]?.id

        if (targetId) {
          setProjectId(targetId)
          await resolveActiveDataset(targetId)
        }
      })
      .catch((reason) => setError(String(reason)))
  }, [])

  const resolveActiveDataset = async (targetProjectId: string) => {
    if (!targetProjectId) return
    setFetchingDataset(true)
    setError('')
    setDataset(null)
    setResult(null)
    setRecentCustomers([])

    try {
      let ds: Dataset | null = null
      try {
        ds = await adaptiveApi.getLatestDataset(targetProjectId)
      } catch {
        const proj = await (adaptiveApi as any).getProject?.(targetProjectId)
        if (proj?.datasets?.[0]?.id) {
          ds = await adaptiveApi.getDataset(targetProjectId, proj.datasets[0].id)
        }
      }

      if (ds) {
        setDataset(ds)
        try {
          const sample = await adaptiveApi.customers(targetProjectId, ds.id, '')
          if (sample?.customers?.length) {
            const keys = sample.customers.map((c) => c.customerKey).slice(0, 5)
            setRecentCustomers(keys)
            if (!customerKey && keys[0]) {
              setCustomerKey(keys[0])
            }
          }
        } catch {
          // non-blocking
        }
      } else {
        setError('No active dataset found for this project.')
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to load dataset details.')
    } finally {
      setFetchingDataset(false)
    }
  }

  const handleProjectSelect = async (newProjectId: string) => {
    setProjectId(newProjectId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('adaptive_project_id', newProjectId)
    }
    await resolveActiveDataset(newProjectId)
  }

  const predict = async () => {
    if (!dataset || !customerKey.trim()) return
    setLoading(true)
    setError('')
    try {
      const pred = await adaptiveApi.predict(projectId, dataset.id, customerKey.trim())
      setResult(pred)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const audit = async () => {
    if (!dataset) return
    setLoading(true)
    setError('')
    try {
      const auditResult = await adaptiveApi.audit(projectId, dataset.id)
      setResult({ audit: auditResult })
    } catch (reason) {
      setError(String(reason))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-pink-500">Saved model contract</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Adaptive Predictions</h1>
        <p className="mt-2 text-sm text-slate-500">
          Inference operates directly on the persisted pipeline, exact feature schema, and calibrated production threshold.
        </p>
      </div>

      {error && (
        <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Intelligence Project</label>
            <select
              value={projectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Customer Identifier</label>
            <div className="relative">
              <input
                value={customerKey}
                onChange={(e) => setCustomerKey(e.target.value)}
                placeholder="e.g. 7590-VHVEG or 3668-QPYBK"
                className="w-full rounded-lg border border-slate-200 p-2.5 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <User className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            {recentCustomers.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span>Sample IDs:</span>
                {recentCustomers.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCustomerKey(id)}
                    className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700 hover:bg-pink-100 hover:text-pink-700 transition-colors"
                  >
                    {id}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {fetchingDataset && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Synchronizing trained dataset schema…
        </div>
      )}

      {dataset && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-600" />
                <CardTitle className="text-lg">{dataset.originalName}</CardTitle>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Pipeline Active
              </span>
            </div>
            <CardDescription>
              Bound Dataset ID: <span className="font-mono text-xs text-slate-600">{dataset.id}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 pt-2">
            <Button onClick={predict} disabled={loading || !customerKey.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Run saved-model prediction
            </Button>
            <Button variant="outline" onClick={audit} disabled={loading}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Run forensic model audit
            </Button>
          </CardContent>
        </Card>
      )}

      {result?.probability !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Genuine inference result</CardTitle>
            <CardDescription>Target evaluated for record: <span className="font-mono text-slate-800 font-semibold">{result.customerKey}</span></CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-4">
            <Stat label="Probability" value={Number(result.probability).toFixed(6)} />
            <Stat label="Threshold" value={result.threshold !== null && result.threshold !== undefined ? Number(result.threshold).toFixed(4) : '—'} />
            <Stat label="Class" value={result.predictedClass ?? '—'} />
            <Stat
              label="Risk state"
              value={result.risk ? result.risk.toUpperCase() : '—'}
              highlight={result.risk === 'high'}
            />
          </CardContent>
        </Card>
      )}

      {result?.audit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Forensic audit:
              <span className={result.audit.status === 'pass' ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                {result.audit.status.toUpperCase()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.audit.checks.map((check: any) => (
              <div key={check.key} className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-sm">
                <b className={check.status === 'pass' ? 'text-emerald-700 uppercase tracking-wide' : 'text-red-700 uppercase tracking-wide'}>
                  {check.status.toUpperCase()}
                </b>
                <span className="text-slate-700">{check.detail}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50'}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">{label}</p>
      <p className={`mt-1.5 font-bold text-xl ${highlight ? 'text-red-600' : 'text-slate-900'}`}>{value}</p>
    </div>
  )
}