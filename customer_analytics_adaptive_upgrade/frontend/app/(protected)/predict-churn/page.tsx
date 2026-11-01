'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AlertCircle, ArrowRight, CheckCircle2, Database, Loader2, Search, TrendingDown, User } from 'lucide-react'
import { adaptiveApi, type Dataset, type Project } from '@/services/adaptive'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LegacyPredictionPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState('')
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [customerKey, setCustomerKey] = useState('')
  const [sampleKeys, setSampleKeys] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [error, setError] = useState('')

  const loadDataset = async (nextProjectId: string) => {
    setLoading(true)
    setError('')
    setDataset(null)
    setResult(null)
    setSampleKeys([])
    try {
      const nextDataset = await adaptiveApi.getLatestDataset(nextProjectId)
      setDataset(nextDataset)
      const customers = await adaptiveApi.customers(nextProjectId, nextDataset.id)
      const keys = customers.customers.map((item) => item.customerKey).slice(0, 6)
      setSampleKeys(keys)
      setCustomerKey(keys[0] ?? '')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No uploaded Telco-compatible dataset is available.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    adaptiveApi.listProjects().then((items) => {
      setProjects(items)
      const saved = typeof window !== 'undefined' ? localStorage.getItem('adaptive_project_id') : null
      const nextId = items.some((item) => item.id === saved) ? saved as string : items[0]?.id ?? ''
      setProjectId(nextId)
      if (nextId) void loadDataset(nextId)
      else setLoading(false)
    }).catch((reason) => {
      setError(reason instanceof Error ? reason.message : 'Unable to load projects.')
      setLoading(false)
    })
  }, [])

  const predict = async () => {
    if (!dataset || !customerKey.trim()) return
    setPredicting(true)
    setError('')
    try {
      setResult(await adaptiveApi.predict(projectId, dataset.id, customerKey.trim()))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Legacy Telco prediction failed.')
    } finally {
      setPredicting(false)
    }
  }

  const handleProjectChange = (nextId: string) => {
    setProjectId(nextId)
    localStorage.setItem('adaptive_project_id', nextId)
    if (nextId) void loadDataset(nextId)
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-yellow-600">Legacy Telco workflow</p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold text-slate-900"><TrendingDown className="h-8 w-8 text-yellow-500" /> Telco Churn Prediction</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">The legacy tab now runs against an uploaded Telco-compatible dataset and its saved production pipeline. It does not use hardcoded mock predictions.</p>
      </header>

      {error && <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}

      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div><label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Telco dataset project</label><select value={projectId} onChange={(event) => handleProjectChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm shadow-sm"><option value="">Select project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Customer ID</label><div className="relative"><input value={customerKey} onChange={(event) => setCustomerKey(event.target.value)} placeholder="e.g. 7590-VHVEG" className="w-full rounded-lg border border-slate-200 p-2.5 pr-9 text-sm shadow-sm" /><User className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" /></div>{sampleKeys.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{sampleKeys.map((key) => <button key={key} type="button" onClick={() => setCustomerKey(key)} className="rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-700 hover:bg-yellow-100">{key}</button>)}</div>}</div>
        </CardContent>
      </Card>

      {loading && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Loading the Telco model contract…</div>}

      {!loading && !dataset && !error && <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center"><Database className="h-10 w-10 text-yellow-500" /><h2 className="text-lg font-semibold">Upload a Telco dataset to start</h2><p className="max-w-md text-sm text-slate-500">Create a project, upload the original Telco CSV, confirm the churn target, and train the model before returning here.</p><Link href="/datasets"><Button>Open Dataset Manager <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></CardContent></Card>}

      {dataset && <Card><CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-yellow-600" />{dataset.originalName}</CardTitle><CardDescription>{dataset.rowCount.toLocaleString()} customer records · target: {dataset.target ?? 'not confirmed'} · {dataset.activeModel ? 'saved model ready' : 'model not trained'}</CardDescription></CardHeader><CardContent><Button onClick={predict} disabled={predicting || !customerKey.trim() || !dataset.activeModel}><Search className="mr-2 h-4 w-4" />{predicting ? 'Scoring customer…' : 'Run Telco prediction'}</Button>{!dataset.activeModel && <p className="mt-3 text-sm text-amber-700">Confirm the target and train this dataset in Dataset Manager before scoring.</p>}</CardContent></Card>}

      {result?.probability !== undefined && <Card><CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" />Prediction result</CardTitle><CardDescription>Saved-model inference for <span className="font-mono font-semibold">{result.customerKey}</span></CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-4"><ResultStat label="Churn probability" value={`${(Number(result.probability) * 100).toFixed(1)}%`} /><ResultStat label="Production threshold" value={result.threshold == null ? '—' : Number(result.threshold).toFixed(3)} /><ResultStat label="Predicted class" value={result.predictedClass ?? '—'} /><ResultStat label="Risk state" value={result.risk?.toUpperCase() ?? '—'} danger={result.risk === 'high'} /></CardContent></Card>}
    </div>
  )
}

function ResultStat({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return <div className={`rounded-xl border p-4 ${danger ? 'border-rose-200 bg-rose-50' : 'border-slate-100 bg-slate-50'}`}><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? 'text-rose-700' : 'text-slate-900'}`}>{value}</p></div>
}
