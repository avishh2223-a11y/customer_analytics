'use client'

import Link from 'next/link'
import { Database, ShieldCheck } from 'lucide-react'

export function Topbar() {
  return <header className="flex h-18 shrink-0 items-center justify-between border-b border-pink-100 bg-white/70 px-5 backdrop-blur-xl md:px-8"><div><p className="text-sm font-semibold text-slate-800">Local project workspace</p><p className="text-xs text-slate-500">Dataset-scoped models, predictions, SHAP evidence, and audits</p></div><div className="flex items-center gap-2"><Link href="/datasets" className="flex items-center gap-2 rounded-lg bg-pink-50 px-3 py-2 text-xs font-medium text-pink-700 hover:bg-pink-100"><Database className="h-4 w-4"/>Datasets</Link><span className="hidden items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 sm:flex"><ShieldCheck className="h-4 w-4"/>API-driven</span></div></header>
}
