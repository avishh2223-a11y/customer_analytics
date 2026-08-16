'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Database, FileUp, Loader2, Sparkles } from 'lucide-react'
import { adaptiveApi, type Dataset, type ModelRun, type Project } from '@/services/adaptive'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DatasetsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState('')
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [model, setModel] = useState<ModelRun | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [target, setTarget] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const activeProject = useMemo(() => projects.find((item) => item.id === projectId) ?? null, [projects, projectId])
  const reloadProjects = async () => {
    const result = await adaptiveApi.listProjects()
    setProjects(result)
    if (!projectId && result[0]) setProjectId(result[0].id)
  }
  useEffect(() => { reloadProjects().catch((reason) => setError(String(reason))) }, [])

  const createProject = async () => {
    setBusy(true); setError('')
    try {
      const project = await adaptiveApi.createProject(name, description || undefined)
      setProjects((current) => [project, ...current]); setProjectId(project.id); setName(''); setDescription(''); setDataset(null); setModel(null)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create project.') } finally { setBusy(false) }
  }
  const upload = async (file: File) => {
    if (!projectId) return setError('Create or select a project before uploading a dataset.')
    setBusy(true); setError(''); setDataset(null); setModel(null)
    try { setDataset(await adaptiveApi.uploadDataset(projectId, file)) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Dataset upload failed.') } finally { setBusy(false) }
  }
  const confirm = async () => {
    if (!dataset || !target) return
    setBusy(true); setError('')
    try { setDataset(await adaptiveApi.confirmTarget(projectId, dataset.id, target)) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to confirm target.') } finally { setBusy(false) }
  }
  const train = async () => {
    if (!dataset) return
    setBusy(true); setError('')
    try { setModel(await adaptiveApi.train(projectId, dataset.id)) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Training failed.') } finally { setBusy(false) }
  }

  return <div className="space-y-6">
    <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-pink-500">Dataset-adaptive intelligence</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Dataset Manager</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Each upload is isolated to a project, profiled before training, and requires explicit target confirmation. The Telco schema is supported but no longer assumed.</p></div><select value={projectId} onChange={(event) => { setProjectId(event.target.value); setDataset(null); setModel(null) }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"> <option value="">Select a project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></header>
    {error && <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
    <div className="grid gap-5 lg:grid-cols-2"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-pink-500" />Create an intelligence project</CardTitle></CardHeader><CardContent className="space-y-3"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Project name" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"/><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional project context" className="min-h-20 w-full rounded-lg border border-slate-200 p-3 text-sm"/><Button disabled={busy || name.trim().length < 3} onClick={createProject}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Create project</Button></CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileUp className="h-5 w-5 text-cyan-600" />Upload a CSV</CardTitle></CardHeader><CardContent><label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-cyan-300 bg-cyan-50/40 p-5 text-center"><Database className="h-7 w-7 text-cyan-600"/><span className="mt-2 text-sm font-medium">Choose a customer dataset</span><span className="mt-1 text-xs text-slate-500">UTF-8 or Latin-1 CSV • 15 MB maximum • project-scoped storage</span><input className="sr-only" type="file" accept=".csv,text/csv" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])}/></label>{activeProject && <p className="mt-3 text-xs text-slate-500">Uploading to <b>{activeProject.name}</b>.</p>}</CardContent></Card></div>
    {busy && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin"/>Processing the genuine dataset or model workflow…</div>}
    {dataset && <div className="space-y-5"><div className="grid gap-4 md:grid-cols-4"><Metric label="Records" value={String(dataset.rowCount)} /><Metric label="Fields" value={String(dataset.columnCount)} /><Metric label="Duplicate rows" value={String(dataset.profile.duplicateRows)} /><Metric label="Identifier" value={dataset.profile.identifierCandidates[0]?.column ?? 'None detected'} /></div><div className="grid gap-5 lg:grid-cols-2"><Card><CardHeader><CardTitle>Confirm outcome target</CardTitle></CardHeader><CardContent className="space-y-3">{dataset.profile.targetCandidates.length ? dataset.profile.targetCandidates.map((candidate) => <button key={candidate.column} onClick={() => setTarget(candidate.column)} className={`w-full rounded-xl border p-3 text-left ${target === candidate.column ? 'border-pink-400 bg-pink-50' : 'border-slate-200 hover:border-slate-300'}`}><div className="flex justify-between"><b>{candidate.column}</b><span className="text-xs text-pink-600">{Math.round(candidate.confidence * 100)}% confidence</span></div><p className="mt-1 text-xs text-slate-500">{candidate.kind} · {candidate.reason}</p></button>) : <p className="text-sm text-slate-500">No target is inferred. The dataset remains available for exploration but cannot be trained until an appropriate target is chosen.</p>}{dataset.target ? <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">Confirmed target: <b>{dataset.target}</b> ({dataset.problemType})</p> : <Button disabled={!target || busy} onClick={confirm}>Confirm target</Button>}</CardContent></Card><Card><CardHeader><CardTitle>Data contract</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><DataLine label="Potential leakage" value={dataset.profile.columns.filter((column) => column.warnings.includes('leakage')).map((column) => column.name).join(', ') || 'No automatic flags'} /><DataLine label="High-cardinality fields" value={dataset.profile.columns.filter((column) => column.warnings.includes('high_cardinality')).map((column) => column.name).join(', ') || 'None'} /><DataLine label="Training state" value={model ? `${model.algorithm} ready` : dataset.target ? 'Ready to evaluate' : 'Target confirmation required'} />{dataset.target && <Button disabled={busy || !!model} onClick={train} className="mt-3">{model ? <CheckCircle2 className="mr-2 h-4 w-4"/> : <Sparkles className="mr-2 h-4 w-4"/>}{model ? 'Model trained' : 'Train adaptive model'}</Button>}</CardContent></Card></div>{model && <Card><CardHeader><CardTitle>Saved production model</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-4"><Metric label="Algorithm" value={model.algorithm}/><Metric label="Problem" value={model.problemType}/><Metric label="Threshold" value={model.productionThreshold?.toFixed(4) ?? 'Not applicable'}/><Metric label="Metrics" value={Object.entries(model.metrics).map(([key, value]) => `${key}: ${value}`).join(' · ')}/></CardContent></Card>}<ProfileTable dataset={dataset}/></div>}
  </div>
}

function Metric({ label, value }: { label: string; value: string }) { return <Card><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 break-words text-lg font-bold text-slate-900">{value}</p></CardContent></Card> }
function DataLine({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b border-slate-100 py-2"><span className="text-slate-500">{label}</span><span className="text-right font-medium text-slate-800">{value}</span></div> }
function ProfileTable({ dataset }: { dataset: Dataset }) { return <Card><CardHeader><CardTitle>Adaptive schema profile</CardTitle></CardHeader><CardContent className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="pb-3">Field</th><th className="pb-3">Type</th><th className="pb-3">Semantic roles</th><th className="pb-3">Missing</th><th className="pb-3">Examples</th></tr></thead><tbody>{dataset.profile.columns.map((column) => <tr key={column.name} className="border-b border-slate-100"><td className="py-3 font-medium">{column.name}</td><td className="py-3 text-slate-600">{column.inferredType}</td><td className="py-3">{column.semanticRoles.map((role) => <span key={role} className="mr-1 rounded-full bg-cyan-50 px-2 py-1 text-xs text-cyan-700">{role}</span>) || '—'}</td><td className="py-3 text-slate-600">{(column.missingRate * 100).toFixed(1)}%</td><td className="py-3 text-xs text-slate-500">{column.sampleValues.join(', ') || '—'}</td></tr>)}</tbody></table></CardContent></Card> }
