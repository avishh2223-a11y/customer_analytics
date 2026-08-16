import { apiClient } from '@/services/api'

export type TargetCandidate = { column: string; confidence: number; kind: string; values: string[]; reason: string }
export type ColumnProfile = { name: string; inferredType: string; semanticRoles: string[]; missingCount: number; missingRate: number; uniqueCount: number; sampleValues: string[]; warnings: string[] }
export type Dataset = { id: string; projectId: string; originalName: string; rowCount: number; columnCount: number; profile: { columns: ColumnProfile[]; identifierCandidates: Array<{ column: string; confidence: number; reason: string }>; targetCandidates: TargetCandidate[]; duplicateRows: number }; target: string | null; problemType: string }
export type Project = { id: string; name: string; description: string; createdAt: string; updatedAt: string; datasetCount: number }
export type ModelRun = { id: string; algorithm: string; problemType: string; productionThreshold: number | null; metrics: Record<string, number> }

const base = '/adaptive/projects'

export const adaptiveApi = {
  listProjects: () => apiClient.get<Project[]>(base),
  createProject: (name: string, description?: string) => apiClient.post<Project>(base, { name, description }),
  uploadDataset: (projectId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<Dataset>(`${base}/${projectId}/datasets`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getDataset: (projectId: string, datasetId: string) => apiClient.get<Dataset>(`${base}/${projectId}/datasets/${datasetId}`),
  confirmTarget: (projectId: string, datasetId: string, targetColumn: string) => apiClient.post<Dataset>(`${base}/${projectId}/datasets/${datasetId}/target`, { targetColumn }),
  train: (projectId: string, datasetId: string) => apiClient.post<ModelRun>(`${base}/${projectId}/datasets/${datasetId}/train`),
  customers: (projectId: string, datasetId: string, search = '') => apiClient.get<{ identifierColumn: string | null; customers: Array<{ customerKey: string; record: Record<string, unknown> }> }>(`${base}/${projectId}/datasets/${datasetId}/customers`, { params: { search } }),
  predict: (projectId: string, datasetId: string, customerKey: string) => apiClient.post<{ probability?: number; threshold?: number; predictedClass?: string; risk?: string; customerKey: string; record: Record<string, unknown> }>(`${base}/${projectId}/datasets/${datasetId}/predict`, { customerKey }),
  explainLocal: (projectId: string, datasetId: string, customerKey: string) => apiClient.post<{ contributions: Array<{ feature: string; shapValue: number }>; statement: string }>(`${base}/${projectId}/datasets/${datasetId}/explain/local`, { customerKey }),
  explainGlobal: (projectId: string, datasetId: string) => apiClient.get<{ features: Array<{ feature: string; meanAbsoluteShap: number }> }>(`${base}/${projectId}/datasets/${datasetId}/explain/global`),
  listExplanations: (projectId: string, datasetId: string) => apiClient.get<Array<{ id: string; scope: string; customerKey?: string; generatedAt: string }>>(`${base}/${projectId}/datasets/${datasetId}/explanations`),
  recommend: (projectId: string, datasetId: string, customerKey: string) => apiClient.post<{ prediction: { probability: number; threshold: number }; recommendation: { ruleKey: string; recommendationText: string; reason: string; drivers: string[] } }>(`${base}/${projectId}/datasets/${datasetId}/recommend`, { customerKey }),
  listRecommendations: (projectId: string, datasetId: string) => apiClient.get<Array<{ customerKey: string; recommendation: { ruleKey: string; recommendationText: string; reason: string }; generatedAt: string }>>(`${base}/${projectId}/datasets/${datasetId}/recommendations`),
  audit: (projectId: string, datasetId: string) => apiClient.post<{ status: string; checks: Array<{ key: string; status: string; detail: string }> }>(`${base}/${projectId}/datasets/${datasetId}/audit`),
}
