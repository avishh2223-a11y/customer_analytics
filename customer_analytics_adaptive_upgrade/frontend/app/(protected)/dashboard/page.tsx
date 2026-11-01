'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowRight, BarChart3, CheckCircle2, Database, Layers, Sparkles } from 'lucide-react'
import { adaptiveApi, type Dataset, type Project } from '@/services/adaptive'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [activeModel, setActiveModel] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    adaptiveApi
      .listProjects()
      .then(async (items) => {
        setProjects(items)
        if (items.length > 0) {
          const firstId = items[0].id
          setSelectedProjectId(firstId)
          loadProjectDetails(firstId)
        }
      })
      .catch((err) => setError(String(err)))
  }, [])

  const loadProjectDetails = async (projectId: string) => {
    try {
      setError('')
      const projectMeta = await adaptiveApi.getProject(projectId)
      const firstDataset = projectMeta?.datasets?.[0]
      if (firstDataset) {
        const ds = await adaptiveApi.getDataset(projectId, firstDataset.id)
        setDataset(ds)
        setActiveModel(ds?.activeModel ?? null)
      } else {
        setDataset(null)
        setActiveModel(null)
      }
    } catch {
      // Fallback if specific dataset lookup is pending
    }
  }

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId)
    loadProjectDetails(projectId)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-pink-500">
            Workspace Overview
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Intelligence Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Executive monitoring across isolated datasets, trained pipelines, and explainability contracts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="rounded-lg border bg-white p-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dynamic Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-pink-100 p-3 text-pink-600">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Active Projects</p>
              <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Dataset Rows</p>
              <p className="text-2xl font-bold text-slate-900">
                {dataset ? dataset.rowCount.toLocaleString() : '—'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Target Column</p>
              <p className="text-xl font-bold text-slate-900">
                {dataset?.target ?? 'Not confirmed'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Problem Type</p>
              <p className="text-sm font-bold text-slate-900 mt-1 capitalize">
                {dataset?.problemType ? dataset.problemType.replace('_', ' ') : 'Not trained'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-pink-300 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Adaptive Predictions</CardTitle>
            <CardDescription>
              Score specific customer records against the tuned production threshold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/adaptive-predictions">
              <Button className="w-full">
                Run Predictions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-pink-300 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Model Evidence</CardTitle>
            <CardDescription>
              Audit global importance and local SHAP explanation vectors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/explainability">
              <Button variant="outline" className="w-full">
                View SHAP Evidence <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-pink-300 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Dataset Manager</CardTitle>
            <CardDescription>
              Upload new iterations, adjust target parameters, or retrain models.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/datasets">
              <Button variant="secondary" className="w-full">
                Manage Datasets <Database className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
